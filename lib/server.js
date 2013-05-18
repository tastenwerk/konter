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

var express = require('express')
  , app = express()
  , path = require('path')
  , fs = require('fs');

 
var config = require( __dirname+'/config' )
  , router = require( __dirname+'/router' )
  , logger = require( __dirname+'/logger' );

var server = module.exports = {};

server.start = function startServer(){

  logger.setLevel( config.log.level );

  this.db = require( __dirname+'/db' );

  for( var i in config.app.engine )
    app.engine( i, config.app.engine[i] );

  for( var i in config.app.set.common )
    app.set( i, config.app.set.common[i] );
  
  for( var i=0, middleware; middleware=config.app.use.common[i]; i++ )
    app.use( middleware );

  // load test specific setting and uses
  if( config.app.use[process.env.NODE_ENV] )
    for( var i=0, middleware; middleware=config.app.use[process.env.NODE_ENV][i]; i++ )
      app.use( middleware );

  if( config.session && config.session.store ){
    var sessionStorePth = path.join( __dirname, 'session', 'stores', config.session.store+'-store' );
    if( fs.existsSync( sessionStorePth+'.js' ) )
      app.use( require( sessionStorePth ) );
    else
      logger.throwError('could not find session store', config.session.store );
  }


  router.setupRoutes( app, null );
  app.use(app.router);

  router.setupErrorHandler( app, null );


  logger.info('konter is listening on port', config.port );

  app.listen( config.port );

}