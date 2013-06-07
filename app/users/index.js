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

konter.dashboard.plugins.push( require(__dirname+'/dashboard-plugins/online-users') );

module.exports = function userRoutes( app, socket ){

  app.get( '/users', renderGetUsers );

}

/**
 * GET /users
 *
 * lists users
 *
 * @api public
 */
function renderGetUsers( req, res ){
  res.render( konter.views.get('users/index.jade') );
}