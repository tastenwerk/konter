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
 
var db = require( __dirname + '/../../../lib/db' );

/**
 * UserACLSchema
 *
 * Access Lists for objects the user can
 * access
 *
 */
var UserACLSchema = module.exports = new db.Schema({
  documentId: db.Schema.ObjectId,
  documentType: String,
  _createdBy: { type: db.Schema.ObjectId, ref: 'User' },
  _createdAt: { type: Date, default: Date.now },
  privileges: String
});