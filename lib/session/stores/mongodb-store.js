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
  , MongoSessionStore = require('connect-mongo')(express)
  , config = require( __dirname+'/../../config' )
  , mongoose = require('mongoose');

var mongodbStore = module.exports = express.session({
  secret: config.session && config.session.secret || 'konter',
  store: new MongoSessionStore({
    mongoose_connection: mongoose.connections[0],
    collection: 'konter_sessions'
  })
});