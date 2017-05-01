/**
 * Profile Stats MicroService.
 */
'use strict';

const Cluster = require('@microservice-framework/microservice-cluster');
const Microservice = require('@microservice-framework/microservice');
const MicroserviceRouterRegister = require('@microservice-framework/microservice-router-register').register;
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
  schema: process.env.SCHEMA
});

var mControlCluster = new Cluster({
  pid: process.env.PIDFILE,
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  count: process.env.WORKERS,
  callbacks: {
    init: microserviceAuthINIT,
    validate: mservice.validate,
    POST: authRequestPOST,
    GET: mservice.get,
    PUT: mservice.put,
    DELETE: mservice.delete,
    SEARCH: authRequestSEARCH
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
        secureKey: process.env.SECURE_KEY
      },
      cluster: cluster
    });
  }
}

/**
 * POST handler.
 */
function authRequestPOST(jsonData, requestDetails, callback) {
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
      return authRequestPOST(jsonData, requestDetails, callback);
    }
    jsonData.expireAt = Date.now() + jsonData.ttl * 1000;
    mservice.post(jsonData, requestDetails, callback);
  });
}

function authRequestSEARCH(jsonData, requestDetails, callback) {
  if(jsonData.validate){
    let validate = true;
    delete jsonData.validate;
  }

  mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
    if(!validate) {
      return callback(err, handlerResponse);
    }
    if(err) {
      return callback(err, handlerResponse);
    }
    let answer = handlerResponse.answer[0];
    if(answer.expireAt < Date.now()) {
      return callback(new Error('Token expired'));
    }
    handlerResponse.answer = answer;
    return callback(null, handlerResponse);
  });
}
