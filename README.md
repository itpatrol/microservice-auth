# microservice-auth

[![Gitter](https://img.shields.io/gitter/room/microservice-framework/chat.svg?style=flat-square)](https://gitter.im/microservice-framework/chat)
[![npm](https://img.shields.io/npm/dt/@microservice-framework/microservice-auth.svg?style=flat-square)](https://www.npmjs.com/~microservice-framework)
[![microservice-frame.work](https://img.shields.io/badge/online%20docs-200-green.svg?style=flat-square)](http://microservice-frame.work)


AuthToken microservice for [microservice-framework](https://www.npmjs.com/~microservice-framework)


## Create token

```js
const MicroserviceClient = require('@microservice-framework/microservice-client');

require('dotenv').config();

var client = new MicroserviceClient({
  URL: process.env.SELF_URL,
  secureKey: process.env.SECURE_KEY
});

client.post({
    ttl: 600,
    credentials: {
      username: 'Gormartsen'
    },
    scope:[
      {
        service: 'service1',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
        }
      },
      {
        service: 'service2',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
        }
      }
    ]
  }, function(err, handlerResponse){
    console.log(err);
    console.log(JSON.stringify(handlerResponse , null, 2));
});

```

 - `ttl` - access token live time. Use -1 to create immortal token.
 - `credentials` - object that will be available by requestDetails.credentials in GET/POST/PUT/SEARCH/DELETE methods under microservice.
 - `scope` - array of objects where:
   - service: SCOPE value from microservice register function.
   - methods: true - access allowed, false - denied.

### Changle log

- 1.3.5 - fix 'access-token' validation