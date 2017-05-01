const MicroserviceClient = require('@microservice-framework/microservice-client');

require('dotenv').config();

var client = new MicroserviceClient({
  URL: process.env.SELF_PATH,
  secureKey: process.env.SECURE_KEY
});

var accessToken = '4255119b61827d71ba8aebef0c98d21d6d45b53c';

client.post({
    accessToken: accessToken,
    ttl: 600,
    credential: {
      username: 'Gormartsen'
    }
    scope:[
      {
        service: 'repos',
        methods: {
          get:true,
          post:false,
          put: false,
          search: true,
          delete: false,
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
        }
      }
    ]
  }, function(err, handlerResponse){
    console.log(err);
    console.log(JSON.stringify(handlerResponse , null, 2));
});
