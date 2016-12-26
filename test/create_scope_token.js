const MicroserviceClient = require('zenci-microservice-client');

require('dotenv').config();

var client = new MicroserviceClient({
  URL: "http://localhost:" + process.env.PORT,
  secureKey: process.env.SECURE_KEY
});

var accessToken = '4255119b61827d71ba8aebef0c98d21d6d45b53c';

client.post({
    accessToken: accessToken,
    scope:[
      {
        service: 'stats',
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
