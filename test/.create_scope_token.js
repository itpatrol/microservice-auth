const MicroserviceClient = require('@microservice-framework/microservice-client');

require('dotenv').config();

var client = new MicroserviceClient({
  URL: process.env.SELF_PATH,
  secureKey: process.env.SECURE_KEY
});

var accessToken = '4255119b61827d71ba8aebef0c98d21d6d45b53c';

client.post({
    accessToken: accessToken,
    ttl: 60,
    scope:[
      {
        service: 'stats',
        methods: {
          get:true,
          post:true,
          put: true,
          search: true,
          delete: true,
        },
        values: {
          database: 'stats',
          table: 'users'
        }
      }
    ]
  }, function(err, handlerResponse){
    console.log(err);
    console.log(JSON.stringify(handlerResponse , null, 2));
});
