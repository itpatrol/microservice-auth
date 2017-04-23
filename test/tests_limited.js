const expect  = require("chai").expect;
const MicroserviceClient = require('@microservice-framework/microservice-client');

require('dotenv').config();

describe('AUTH CRUD API',function(){
  var accessToken;
  var RecordID;
  var TokenID;

  it('POST by SECURE_KEY should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      secureKey: process.env.SECURE_KEY
    });
    client.post({
        accessToken: accessToken,
        ttl: 10,
        scope:[
          {
            service: 'auth',
            methods: {
              get:true,
              post:false,
              put: false,
              search: true,
              delete: false
            },
            values: {
            }
          }
        ]
      }, function(err, handlerResponse){
        accessToken = handlerResponse.accessToken;
        expect(err).to.equal(null);
        expect(handlerResponse.accessToken).to.not.equal(null);
        expect(handlerResponse.expiresAt).to.not.equal(null);
        expect(handlerResponse.ttl).to.not.equal(null);
        done();
    });
  });

  it('POST by limited accessToken should return 403',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.post({
        ttl: 10,
        scope:[
          {
            service: 'auth',
            methods: {
              get:true,
              post:true,
              put: true,
              search: true,
              delete: true
            },
            values: {
            }
          }
        ]
      }, function(err, handlerResponse){
        expect(err).to.not.equal(null);
        done();
    });
  });

  it('SEARCH by limited accessToken should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.search({ "accessToken": accessToken}, function(err, handlerResponse){
      RecordID = handlerResponse[0].id;
      expect(err).to.equal(null);
      expect(handlerResponse).to.not.equal(null);
      expect(handlerResponse.token).to.be.undefined;

      done();
    });
  });

  it('SEARCH by limited accessToken SCOPE should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.search({ "accessToken": accessToken, 'scope': 'auth' }, function(err, handlerResponse){
      expect(err).to.equal(null);
      expect(handlerResponse).to.not.equal(null);
      expect(handlerResponse.token).to.be.undefined;
      done();
    });
  });

  it('GET by limited accessToken  should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.get(RecordID, function(err, handlerResponse){
      expect(err).to.equal(null);
      expect(handlerResponse.token).to.be.undefined;
      done();
    });
  });

  it('DELETE should return 403',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.delete(RecordID, function(err, handlerResponse){
      expect(err).to.not.equal(null);
      done();
    });
  });

  it('GET after delete should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.get(RecordID, function(err, handlerResponse){
      expect(err).to.equal(null);
      done();
    });
  });

  it('SEARCH by SECURE_KEY should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      secureKey: process.env.SECURE_KEY
    });
    client.search({ "accessToken": accessToken}, function(err, handlerResponse){
      RecordID = handlerResponse[0].id;
      TokenID = handlerResponse[0].token;
      expect(err).to.equal(null);
      expect(handlerResponse).to.not.equal(null);
      expect(handlerResponse.token).to.not.equal(null);

      done();
    });
  });

  it('DELETE by id + token should return 200',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      secureKey: process.env.SECURE_KEY
    });
    client.delete(RecordID, TokenID, function(err, handlerResponse){
      expect(err).to.equal(null);
      done();
    });
  });

  it('GET after delete should return Access Denied',function(done){
    var client = new MicroserviceClient({
      URL: process.env.SELF_URL,
      accessToken: accessToken
    });
    client.get(RecordID, function(err, handlerResponse){
      expect(err).to.not.equal(null);
      done();
    });
  });
});
