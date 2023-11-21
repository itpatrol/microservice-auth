/**
 * Profile Stats MicroService.
 */
'use strict';

const framework = '@microservice-framework';
const Cluster = require(framework + '/microservice-cluster');
const Microservice = require(framework + '/microservice');
const MicroserviceRouterRegister = require(framework + '/microservice-router-register').register;
const tokenGenerate = require('./includes/token-generate.js');
const debugF = require('debug');

var debug = {
  log: debugF('proxy:log'),
  debug: debugF('proxy:debug')
};

require('dotenv').config();

var mservice = new Microservice({
  mongoUrl: process.env.MONGO_URL + process.env.MONGO_PREFIX + process.env.MONGO_OPTIONS,
  mongoTable: process.env.MONGO_TABLE,
  secureKey: process.env.SECURE_KEY,
  schema: process.env.SCHEMA,
  id: {
    title: 'access_token',
    field: 'accessToken',
    type: 'string',
    description: 'Generated access token.'
  }
});

var mControlCluster = new Cluster({
  pid: process.env.PIDFILE,
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  count: process.env.WORKERS,
  callbacks: {
    init: microserviceAuthINIT,
    validate: microserviceAuthVALIDATE,
    POST: microserviceAuthPOST,
    GET: microserviceAuthGET,
    PUT: mservice.put,
    DELETE: mservice.delete,
    SEARCH: microserviceAuthSEARCH,
    OPTIONS: mservice.options
  }
});

/**
 * Init Handler.
 */
function microserviceAuthINIT(cluster, worker, address) {
  if (worker.id == 1) {
    var mserviceRegister = new MicroserviceRouterRegister({
      server: {
        url: process.env.ROUTER_URL,
        secureKey: process.env.ROUTER_SECRET,
        period: process.env.ROUTER_PERIOD,
      },
      route: {
        path: [process.env.SELF_PATH],
        url: process.env.SELF_URL,
        secureKey: process.env.SECURE_KEY,
        provides: {
          ':access_token': {
            field: 'accessToken',
            type: 'number'
          }
        }
      },
      cluster: cluster
    });
  }
}

/**
 * Validate handler.
 */
function microserviceAuthVALIDATE(method, jsonData, requestDetails, callback) {
  console.log('microserviceAuthVALIDATE:requestDetails', requestDetails);
  let accessToken = false;

  if(requestDetails.headers.access_token) {
    accessToken = requestDetails.headers.access_token;
  }
  if(requestDetails.headers['access-token']) {
    accessToken = requestDetails.headers['access-token'];
  }
  if (!accessToken) {
    return mservice.validate(method, jsonData, requestDetails, callback);
  }
  requestDetails.url = requestDetails.url.toLowerCase();
  if (method.toLowerCase() == 'get') {
    if (requestDetails.url == accessToken.toLowerCase() && requestDetails.headers.scope) {
      return callback(null);
    }
  }

  let requestDetailsCopy = {
    url: accessToken,
  }
  mservice.get(requestDetailsCopy, function(err, handlerResponse) {
    if (err) {
      return callback(err);
    }
    let item = handlerResponse.answer;
    if (item.expireAt != -1 && item.expireAt < Date.now()) {
      mservice.delete(requestDetails, function(err, answer) {
        if (err) {
          return debug.debug('Failed to delete token %O', item);
        }
        debug.debug('Token deleted %O', item);
      });
      return callback(new Error('Token expired'));
    }
    let methods = {}
    for (var i in item.scope) {
      if (item.scope[i].service == process.env.SCOPE) {
        methods = item.scope[i].methods;
        break;
      }
    }
    if (!methods[method.toLowerCase()]) {
      debug.debug('Request:%s denied', method);
      return callback(new Error('Access denied'));
    }
    callback(null);
  });
}

/**
 * Wrapper for Get.
 */
function microserviceAuthGET(noneData, requestDetails, callback) {
  console.log('requestDetails', requestDetails);
  console.log('callback', callback);
  mservice.get(requestDetails, function(err, handlerResponse) {
    if (err) {
      return callback(err, handlerResponse);
    }
    let accessToken = false;

    if(requestDetails.headers.access_token) {
      accessToken = requestDetails.headers.access_token;
    }
    if(requestDetails.headers['access-token']) {
      accessToken = requestDetails.headers['access-token'];
    }

    if (accessToken && requestDetails.url == accessToken.toLowerCase()) {
      delete handlerResponse.answer.token;
    }

    if (!requestDetails.headers.scope) {
      return callback(err, handlerResponse);
    }
    let item = handlerResponse.answer;
    if (item.expireAt != -1 && item.expireAt < Date.now()) {
      return callback(new Error('Token expired'));
    }

    let answer = {}
    answer.accessToken = item.accessToken;
    answer.ttl = item.ttl;
    answer.expireAt = item.expireAt;
    answer.credentials = item.credentials;
    answer.scope = item.scope;
    answer.methods = {}

    for (var i in item.scope) {
      if (item.scope[i].service == requestDetails.headers.scope) {
        answer.methods = item.scope[i].methods;
        break;
      }
    }

    handlerResponse.answer = answer;
    return callback(err, handlerResponse);
  });
}

/**
 * POST handler.
 */
function microserviceAuthPOST(jsonData, requestDetails, callback) {
  if (!jsonData.accessToken) {
    jsonData.accessToken = tokenGenerate(24);
  }
  if (!jsonData.ttl) {
    jsonData.ttl = 3600;
  }
  var searchToken = {
    accessToken: jsonData.accessToken
  }
  mservice.search(searchToken, requestDetails, function(err, handlerResponse) {
    if (handlerResponse.code != 404) {
      jsonData.accessToken = tokenGenerate(24);
      return microserviceAuthPOST(jsonData, requestDetails, callback);
    }
    if (jsonData.ttl == -1) {
      jsonData.expireAt = -1;
    } else {
      jsonData.expireAt = Date.now() + jsonData.ttl * 1000;
    }
    mservice.post(jsonData, requestDetails, callback);
  });
}

/**
 * POST handler.
 * microservice before 1.3.4 was using search to validate token.
 */
function microserviceAuthSEARCH(jsonData, requestDetails, callback) {
  let validate = false;
  let scope = false;
  if (jsonData.validate) {
    validate = true;
    delete jsonData.validate;
    scope = jsonData.scope;
    delete jsonData.scope;
  }

  mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
    if (!validate) {
      return callback(err, handlerResponse);
    }
    if (err) {
      return callback(err, handlerResponse);
    }
    if (handlerResponse.code == 404) {
      return callback(err, handlerResponse);
    }
    let item = handlerResponse.answer[0];

    if (item.expireAt != -1 && item.expireAt < Date.now()) {
      return callback(new Error('Token expired'));
    }
    let answer = {}
    answer.accessToken = item.accessToken;
    answer.ttl = item.ttl;
    answer.expireAt = item.expireAt;
    answer.credentials = item.credentials;
    answer.methods = {}

    for (var i in item.scope) {
      if (item.scope[i].service == scope) {
        answer.methods = item.scope[i].methods;
        break;
      }
    }

    handlerResponse.answer = answer;
    return callback(null, handlerResponse);
  });
}
