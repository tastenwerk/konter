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

config.site = {};