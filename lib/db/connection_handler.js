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

var url = require('url')
  , path = require('path')
  , fs = require('fs');

var logger = require( __dirname+'/../logger' );
 
var connectionHandler = module.exports = function( options ){

  if( !fs.existsSync( __dirname+'/adapters/'+options.adapter ) )
    logger.throwError('adapter', options.adapter, 'is not available in this setup');

  var adapter = require( __dirname+'/adapters/'+options.adapter );
  for( var i in adapter )
    this[i] = adapter[i];

  this.connection = adapter.connect( options );

  loadPlugins.call( this, options );

}

/**
 * loads plugins from 'db/[adapter]/plugins' directory and provides
 * them through db.plugins collection
 *
 * @api private
 */
function loadPlugins( options ){

  var self = this;
  this.plugins = {};
  var pluginsPath = path.join( __dirname, 'adapters', options.adapter, 'plugins' );

  fs.readdirSync( pluginsPath ).forEach( function( relPath ){
    if( relPath.indexOf('_plugin') > 0 )
      self.plugins[relPath.replace('_plugin.js','')] = require( path.join( pluginsPath, relPath ) );
  });

}