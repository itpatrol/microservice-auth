const MicroserviceClient = require('@microservice-framework/microservice-client');

require('dotenv').config();

var client = new MicroserviceClient({
  URL: process.env.SELF_URL,
  secureKey: process.env.SECURE_KEY
});

var accessToken = '4255119b61827d71ba8aebef0c98d21d6d45b53c';

client.post({
    accessToken: accessToken,
    ttl: 6000,
    credential: {
      username: 'Gormartsen'
    },
    scope:[
      {
        service: 'repos',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
          options: true,
        }
      },
      {
        service: 'payload',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
          options: true,
        }
      },
      {
        service: 'auth',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
          options: true,
        }
      }
    ]
  }, function(err, handlerResponse){
    console.log(err);
    console.log(JSON.stringify(handlerResponse , null, 2));
});
