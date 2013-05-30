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

var path = require('path')
  , fs = require('fs')
  , express = require('express');

var config = module.exports = {};

config.appsDir = 'app';

config.port = 3000;

config.log = { level: 3, file: null };

config.db = {};
config.db.adapter = 'mongodb';

config.session = {};
config.session.store = 'mongodb';

config.app = {};
config.app.use = {};
config.app.use.common = [];
config.app.use.production = [];
config.app.use.development = [];
config.app.use.test = [];

config.app.use.common.push( require('stylus').middleware( process.cwd()+'/public' ) );
config.app.use.common.push( express.static( process.cwd()+'/public' ) );

config.app.use.common.push( express.bodyParser() );
config.app.use.common.push( express.methodOverride() );
config.app.use.common.push( require( __dirname+'/middleware/flash') );

config.app.use.common.push( require('express-validator') );
config.app.use.common.push( express.cookieParser( new Date().getTime().toString(36) ) );

config.app.use.common.push( express.favicon( __dirname+'/../public/favicon.ico' ) );

// cross site reforgery protection
config.app.use.common.push( express.csrf() );

// PUT, DELETE availability
config.app.use.common.push( express.methodOverride() );

config.app.use.test.push( express.session('test') );

config.app.set = {};
config.app.set.common = {}

config.app.engine = {};
config.app.engine.jade = require('jade').__express;
config.app.engine.ejs = require('ejs').__express;

config.preload = [];
config.preload.push( __dirname+'/../app/users/models/user' );
config.preload.push( __dirname+'/../app/groups/models/group' );

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