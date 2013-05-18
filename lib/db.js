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

var ConnectionHandler = require( __dirname+'/db/connection_handler' )
  , config = require( __dirname+'/config' );

connection = new ConnectionHandler( { host: config.db.host || 'localhost', 
                                      name: config.db.name, 
                                      port: config.db.port || 27017,
                                      adapter: config.db.adapter } );

var db = module.exports = connection;