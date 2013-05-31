/**
 * konter
 *
 * a web solid small web framework basement
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */
 

var express = require('express')
  , path = require('path')
  , lessMW = require('less-middleware')
  , fs = require('fs');

var config = require( __dirname+'/config' )
  , logger = require( __dirname+'/logger' )
  , views = require( __dirname+'/views' )
  , dbConnectionHandler = require( __dirname+'/db/connection_handler' )
  , router = require( __dirname+'/router' );

var konter = module.exports = {};

/**
 * get current app's appsDirectory
 * set up in konter.config.appsDir
 *
 * default: 'app';
 *
 * @api public
 */
konter.appsDir = function(){ return path.join( process.cwd(), konter.config.appsDir ); }

konter.config = config;
konter.logger = logger;
konter.routes = router.routes;
konter.router = router;
konter.views = views;
konter.plugins = {};

konter.server = {};

konter.server.start = function startServer(){

  readEnvironment();
  loadPlugins();

  var app = express();

  logger.setLevel( config.log.level );

  konter.db = require( __dirname+'/db' );

  for( var i in config.preload )
    require( config.preload[i] );

  //app.use( require('stylus').middleware( process.cwd()+'/public' ) );
  app.use( lessMW({ src: __dirname + "/../public", compress : true }));
  //app.use( lessMW({ src: process.cwd() + "/public", compress : true }));
  app.use( express.static(__dirname + '/../public') );
  //app.use( express.static( process.cwd()+'/public' ) );
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( require('express-validator') );
  app.use( express.cookieParser( new Date().getTime().toString(36) ) );

  if( config.session && config.session.store ){
    var sessionStorePth = path.join( __dirname, 'session', 'stores', config.session.store+'-store' );
    if( fs.existsSync( sessionStorePth+'.js' ) )
      app.use( require( sessionStorePth ) );
    else
      logger.throwError('could not find session store', config.session.store );
  }
  
  for( var i in config.app.engine )
    app.engine( i, config.app.engine[i] );
  
  for( var i in config.app.set.common )
    app.set( i, config.app.set.common[i] );
  
  var defaultMWPath = path.join( __dirname, 'middleware' );
  fs.readdirSync( defaultMWPath ).forEach( function( mw ){
    app.use( require( path.join( defaultMWPath, mw ) ) );
  });

  for( var i=0, middleware; middleware=config.app.use.common[i]; i++ )
    app.use( middleware );

  // load test specific setting and uses
  if( config.app.use[process.env.NODE_ENV] )
    for( var i=0, middleware; middleware=config.app.use[process.env.NODE_ENV][i]; i++ )
      app.use( middleware );

  router.setupRoutes( app, null );
  app.use(app.router);

  router.setupErrorHandler( app, null );

  logger.info('konter is listening on port', config.port );

  app.listen( config.port );

}

function readEnvironment(){
  // read process.cwd()'s config and override settings

  var appConfigPath = path.join( process.cwd(), 'config', 'environment' );
  if( fs.existsSync( appConfigPath+'.js' ) ){
    
    appConfig = require( appConfigPath );

    if( appConfig.port ) config.port = appConfig.port;
    
    if( appConfig.appsDir ) config.appsDir = appConfig.appsDir;
    
    if( appConfig.db )
      for( var i in appConfig.db )
        config.db[i] = appConfig.db[i];

    if( appConfig.app )
      if( appConfig.app.use ){
        if( appConfig.app.use.common )
          for( var i in appConfig.app.use.common )
            config.app.use.common.push( appConfig.app.use.common[i] );
        if( appConfig.app.use.production )
          for( var i in appConfig.app.use.production )
            config.app.use.production.push( appConfig.app.use.production[i] );
        if( appConfig.app.use.development )
          for( var i in appConfig.app.use.development )
            config.app.use.development.push( appConfig.app.use.development[i] );
        if( appConfig.app.use.test )
          for( var i in appConfig.app.use.test )
            config.app.use.test.push( appConfig.app.use.test[i] );
      }

    if( appConfig.preload )
      for( var i in appConfig.preload )
        config.preload.push( appConfig.preload[i] );
  }
}

function loadPlugins(){

  var pluginsDir = path.join( __dirname, 'plugins' );

  fs.readdirSync( pluginsDir ).forEach( function( pluginFileName ){
    konter.plugins[ pluginFileName ] = require( path.join( pluginsDir, pluginFileName ) );
  });

}