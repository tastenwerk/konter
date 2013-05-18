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

  if( !fs.existsSync( __dirname+'/adapters/'+options.adapter+'.js' ) )
    logger.throwError('adapter', options.adapter, 'is not available in this setup');

  var adapter = require( __dirname+'/adapters/'+options.adapter );
  for( var i in adapter )
    this[i] = adapter[i];

  this.connection = adapter.connect( options );

}