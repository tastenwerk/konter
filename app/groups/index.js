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
 
var konter = require( __dirname+'/../../lib/konter' )
  , jade = require('jade')
  , fs = require('fs');

konter.plugins.groups = require(__dirname+'/groups-plugin');

module.exports = function groupRoutes( app, socket ){
}