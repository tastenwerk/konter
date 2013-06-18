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
  , Globalize = require('globalize')
  , fs = require('fs');

var konter = require( __dirname+'/../../lib/konter' );

module.exports = function dashboardRoutes( app, socket ){

  app.get( '/', redirectToDashboard );

  app.get( '/dashboard', konter.plugins.auth.check, renderGetDashboard );

  app.get( '/cultures/:culture', renderGetCultures );

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

function renderGetCultures( req, res ){
  var culture = req.params.culture.replace('.js','');
  var s = 'moment.lang("'+culture+'");\n';
  s+='Globalize.addCultureInfo("'+culture+'", '+JSON.stringify(Globalize.culture( culture ))+');';
  s+='konter.t = function( str ){ var trans = Globalize.localize( str, "'+culture+'"); return trans || str; }';
  res.send( s );
}