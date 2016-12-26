const expect  = require("chai").expect;
const MicroserviceClient = require('zenci-microservice-client');

require('dotenv').config();

describe('Repo CRUD API',function(){
  var client = new MicroserviceClient({
    URL: "http://localhost:" + process.env.PORT,
    secureKey: process.env.SECURE_KEY
  });
  var accessToken = '4255119b61827d71ba8aebef0c98d21d6d45b53c';
  var RecordID;
  var RecordToken;

  it('POST should return 200',function(done){
    client.post({
        accessToken: githubToken,
        scope:[
          {
            service: 'auth',
            values: [
            {
              variable: 'username',
              value: 'test'
            },
            {
              variable: 'second',
              value: 'test2'
            }
            ]
          }
        ]
      }, function(err, handlerResponse){
        expect(err).to.equal(null);
        RecordID = handlerResponse.id;
        RecordToken = handlerResponse.token;
        done();
    });
  });

  it('SEARCH should return 200',function(done){
    client.search({ "owner": "Zen-CI", "repository": "issues" }, function(err, handlerResponse){
      expect(err).to.equal(null);
      expect(handlerResponse).to.not.equal(null);
      done();
    });
  });

  it('GET should return 200',function(done){
    client.get(RecordID, RecordToken, function(err, handlerResponse){
      expect(err).to.equal(null);
      done();
    });
  });


  it('DELETE should return 200',function(done){
    client.delete(RecordID, RecordToken, function(err, handlerResponse){
      expect(err).to.equal(null);
      done();
    });
  });

  it('GET after delete should return nothing',function(done){
    client.get(RecordID, RecordToken, function(err, handlerResponse){
      expect(handlerResponse).to.equal(null);
      done();
    });
  });

});
