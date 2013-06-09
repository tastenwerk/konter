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
 
var jade = require('jade')
  , fs = require('fs');

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
  processNextDashboardPlugin( [], konter.dashboard.plugins, res, function( renderedPlugins ){
    res.locals.renderedDashboardPlugins = renderedPlugins;
    res.render( konter.views.get('/dashboard/index.jade') );
  });
}

/**
 * process next plugin and render it
 *
 * @api private
 */
function processNextDashboardPlugin( renderedPlugins, plugins, res, callback ){
  if( renderedPlugins.length >= plugins.length )
    return callback( renderedPlugins );
  var plugin = plugins[ renderedPlugins.length ];
  if( plugin.before && plugin.before.render )
    plugin.before.render( res.locals, function( locals ){
      renderedPlugins.push( jade.compile( fs.readFileSync(plugin.tmplAbsPath), { filename: plugin.tmplAbsPath, pretty: false } )( locals ) );
      processNextDashboardPlugin( renderedPlugins, plugins, res, callback );
    });
  else{
    renderedPlugins.push( jade.compile( fs.readFileSync(plugin.tmplAbsPath), { filename: plugin.tmplAbsPath, pretty: false } )( res.locals ) );
    processNextDashboardPlugin( renderedPlugins, plugins, res, callback );
  }
}