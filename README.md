# microservice-auth

[![Gitter](https://img.shields.io/gitter/room/microservice-framework/chat.svg?style=flat-square)](https://gitter.im/microservice-framework/chat)
[![npm](https://img.shields.io/npm/dt/@microservice-framework/microservice-auth.svg?style=flat-square)](https://www.npmjs.com/~microservice-framework)
[![microservice-frame.work](https://img.shields.io/badge/online%20docs-200-green.svg?style=flat-square)](http://microservice-frame.work)


AuthToken microservice for [microservice-framework](https://www.npmjs.com/~microservice-framework)


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
