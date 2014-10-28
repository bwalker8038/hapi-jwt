# Hapi JWT

[![Build Status](https://travis-ci.org/bwalker8038/hapi-jwt.svg?branch=master)](https://travis-ci.org/bwalker8038/hapi-jwt)

[![NPM](https://nodei.co/npm/hapi-jwt.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hapi-jwt/)


## Description

hapi-jwt is a JWT authentication plugin for [Hapi](https://github.com/spumko/hapi).


This is library is a fork of [Jerry Sievert's hapi-auth-jwt library](https://github.com/JerrySievert/hapi-auth-jwt).


## Install
```
$ npm install --save hapi-jwt
```

## Usage

hapi-jwt will validate a token passed in the bearer authorization header, e.g. `'Authorization:Bearer #{my_auth_token}'`, or by an `access_token` query parameter in the request. The validation will only occur on routes that have the authorization scheme set in the routes `config` object.

hapi-jwt will return an error response if the token is invalid or expired, as well as an error if the request is malformed.

### Setup

Register the plugin with your server object, from there we'll need to create a new server auth strategy within the registration block. To create our new auth strategy, will need to pass our new strategy's name, the strategy type, as well as the types options. hapi-jwt's auth strategy type currently is `'bearer-access-token'`.

```javascript
  server.pack.register(require('hapi-jwt'), function ( err ) {
    server.auth.strategy( 'jwt-auth', 'bearer-access-token', options );
  });
```

### Options & Token Validation

Token validation is handled by the `validateFunc` that is set in our auth strategy's options object. Also within our options object, we'll pass our secret key. The secret key will be used by hapi-jwt to decrypt our token.

```javascript

  function validateToken ( decoded, request, next ) {
    var isValid = false;

    if ( decoded.username === "valid user"  ) isValid = true;

    return next(null, isValid, { token: decoded });
  }

  var options: {
    validateFunc: validateToken,
    secret: 'mySecret'
  };

  server.auth.strategy( 'jwt-auth', 'bearer-access-token', options );
```

Any logic that our app needs to validate the decrypted token data will live inside of validateFunc. If we pass an err to our callback, or isValid is set to false, hapi-jwt will return a `401 Unauthorized` error response. 


### Securing a route

Hapi routes can be secured using our auth scheme using the routes `config` object.

```javascript

  function defaultHandler ( req, reply ) {
    reply('success!');
  }

  server.route({ method: 'GET', path: '/', handler: defaultHandler, config: { auth: 'jwt-auth' } });

```

### Token generation

As of writing this, hapi-jwt does not handle token generation, revoking, or re-issuing. This functionality will need to be handled with in your application. 


## API Reference

### Options

- `validateFunc` - (required) a token lookup and validation function with the signature `function (token, request, callback)` where:
    - `token` - the decoded and authenticated JSON Web Token.
    - `request` - the request object.
    - `callback` - a callback function with the signature `function (err, isValid, credentials)` where:
        - `err` - an internal error.
        - `isValid` - `true` if access is to be granted, otherwise `false`.
        - `credentials` - a credentials object passed back to the application in `request.auth.credentials`. Typically, `credentials` are only
          included when `isValid` is `true`, but there are cases when the application needs to know who tried to authenticate even when it fails
          (e.g. with authentication mode `'try'`).
- `secret` - (required) the secret for decoding the JWT Bearer Token


## Example

See the example directory for examples
