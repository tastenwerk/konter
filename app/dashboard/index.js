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

module.exports = function dashboardRoutes( app, socket ){

  app.get( '/', redirectToDashboard );

  app.get( '/dashboard', konter.plugins.auth.check, renderGetDashboard );

}

/**
 * GET /
 *
 * default redirects to /dashboard
 *
 * @api public
 */
function redirectToDashboard( req, res ){
  res.redirect( '/dashboard' );
}

function renderGetDashboard( req, res ){
  res.render( konter.views.get('/dashboard/index.jade') );
}