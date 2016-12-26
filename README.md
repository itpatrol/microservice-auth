# zenci-microservice-auth
API service to manage auth scopes
Available via http://api.zen.ci/auth
```js
  // Hook new repo.
  var client = new MicroserviceClient({
    URL: "ttp://api.zen.ci/auth",
    secureKey: process.env.SECURE_KEY
  });  
  client.search({ "accessToken": accessToken, 'scope': 'auth' }, function(err, handlerResponse){
    console.log(handlerResponse.answer);
  });
```

`handlerResponse.answer` should be not empty key value object, where key is required variable and value is required value to match scope.
