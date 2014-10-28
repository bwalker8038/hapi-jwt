/*
 * example-auth.js
 * Below is a sample usage of the hapi-jwt plugin
 * 
 * Author: brad <brad@bradww.com>
 *
 * Usage:
 *
 * Start the server, e.g. node example-auth.js
 *
 * Curl the routes
 */


/*
 * Dependencies
 */

var Hapi = require('hapi');
var jwt  = require('jsonwebtoken');


// Our Apps secret
var secret = 'shhh';

// Our Server
var server = Hapi.createServer('localhost', 8080, {
    cors: true
});


// Validation Function
function validateToken ( token, request, next ) {
var isValid = false;

// Validate the username within the token
if ( token.username === "validUser" ) isValid = true;

// Our callback
return next(null, isValid, { token: token });
}


// Register hapi-jwt with our server
server.pack.register(require('../'), function (err) {
  if ( err ) throw err;

  server.auth.strategy('simple', 'bearer-access-token', {
    validateFunc: validateToken,
    secret: secret
  });
});


// Our index route handler
function defaultHandler ( req, reply ) {
  reply({ statusCode: 200, message: 'success!' });
};

// Our authorization handler
function authHandler ( req, reply ) {

  // Authenicate our user
  if ( req.payload.username === "validUser") {

    // Set our tokenData
    var tokenData = {
      username: req.payload.username
    };

    // Create our token, will expire in one minute after it's creation
    var token = jwt.sign( tokenData, secret, { expiresInMinutes: 1 });

    // reply with the token
    reply({ status: 200, token: token });
  } else {
      reply({ statusCode: 401, msg: 'Unauthorized' }).code(401);
  }
}


// POST authenticate user
// curl -H "Content-Type: application/json" -d '{"username": "validUser" }' -X POST http://localhost:8080/auth

server.route({ method: 'POST', path: '/auth', handler: authHandler });

// GET Index
// curl -X GET -H "Authorization:Bearer #{ token_here }" -H "Cache-Control:no-cache" http://localhost:8080
server.route({ method: 'GET', path: '/', handler: defaultHandler, config: { auth: 'simple' } });


// Start our server
server.start( function () {
  console.log('Server started at: ' + server.info.uri);
});
