var konter = require( __dirname+'/../../../../lib/konter' );

var dummyAuth = require( konter.appsDir() +'/middleware/dummy_auth_middleware');

module.exports = function blogsRoutes( app, socket ){

  app.get('/blogs', dummyAuth.checkDummy, function( req, res ){
    res.send('here');
  });

}