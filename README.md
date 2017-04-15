# microservice-auth
API service to manage auth scopes

```js
  // Hook new repo.
  var client = new MicroserviceClient({
    URL: "https://myapiserver.com/api/v1/auth",
    secureKey: process.env.AUTH_SECURE_KEY
  });  
  client.search({ "accessToken": accessToken, 'scope': 'auth' }, function(err, handlerResponse){
    console.log(handlerResponse.answer);
  });
```

`handlerResponse.answer` should be not empty key value object, where key is required variable and value is required value to match scope.
