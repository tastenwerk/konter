var dummyAuth = require( __dirname+'/../middleware/dummy_auth_middleware');

module.exports = function blogsRoutes( app, socket ){

  app.get('/blogs', dummyAuth.check, function( req, res ){
    res.send('here');
  });

}