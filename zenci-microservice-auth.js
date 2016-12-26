/**
 * Profile Stats MicroService.
 */
'use strict';

const Cluster = require('zenci-manager');
const Microservice = require('zenci-microservice');
const MicroserviceRouterRegister = require('zenci-microservice-router-register');

require('dotenv').config();

var mservice = new Microservice({
  mongoUrl: process.env.MONGO_URL,
  mongoTable: process.env.MONGO_TABLE,
  secureKey: process.env.SECURE_KEY,
  schema: process.env.SCHEMA
});

var mcluster = new Cluster({
  pid: process.env.PIDFILE,
  port: process.env.PORT,
  count: process.env.WORKERS,
  callbacks: {
    validate: mservice.validate,
    POST: mservice.post,
    GET: mservice.get,
    PUT: mservice.put,
    DELETE: mservice.delete,
    SEARCH: authRequestSEARCH
  }
});

if (mcluster.isMaster) {
  var mserviceRegister = new MicroserviceRouterRegister({
    server: {
      url: process.env.ROUTER_URL,
      secureKey: process.env.ROUTER_SECRET,
      period: process.env.ROUTER_PERIOD,
    },
    route: {
      path: process.env.SELF_PATH,
      url: process.env.SELF_URL
    },
    cluster: mcluster
  });
}

function authRequestSEARCH(jsonData, requestDetails, callback) {
  if(!jsonData.scope) {
    mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
      callback(err, handlerResponse);
    });
  } else {
    var scope = jsonData.scope;
    delete(jsonData.scope);
    mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
      if (!err && handlerResponse.code == 200) {
        var answer = []
        for (var i in handlerResponse.answer) {
          console.log(JSON.stringify(handlerResponse.answer[i] , null, 2));
          if(handlerResponse.answer[i].scope) {
            for (var j in handlerResponse.answer[i].scope) {
              if(handlerResponse.answer[i].scope[j].service == scope) {
                answer = handlerResponse.answer[i].scope[j].values;
                break;
              }
            }
          }
        }
        handlerResponse.answer = answer;
        callback(err, handlerResponse);
      } else {
        callback(err, handlerResponse);
      }
    });
  }
}
