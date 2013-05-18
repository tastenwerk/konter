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
 
var config = require( __dirname+'/config' )
  , logger = require( __dirname+'/logger' )
  , server = require( __dirname+'/server' )
  , dbConnectionHandler = require( __dirname+'/db/connection_handler' )
  , router = require( __dirname+'/router' );

var konter = module.exports = {};

konter.config = config;
konter.logger = logger;
konter.routes = router.routes;
konter.router = router;
konter.server = server;

konter.db = server.db;