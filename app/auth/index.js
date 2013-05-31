/**
 * konter
 *
 * a rock solid and small content repository and web framework
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */
 
var konter = require( __dirname+'/../../lib/konter' );

module.exports = function authRoutes( app, socket ){

  app.get('/login', function( req, res ){
    res.render( konter.views.get('auth/login.jade') );
  });

}