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

var db = require( __dirname + '/../../../lib/db' )
  , UserACLSchema = require( __dirname+'/../../users/models/user_acl_schema' )

var GroupSchema = db.Schema({
  name: String,
  allowedApps: Array,
  createdBy: { type: db.Schema.ObjectId, rel: 'User' },
  acl: [ UserACLSchema ], 
  createdAt: { type: Date, default: Date.now }
});


module.exports = db.model('Group', GroupSchema);