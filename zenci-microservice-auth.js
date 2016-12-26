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
    SEARCH: mservice.search
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
