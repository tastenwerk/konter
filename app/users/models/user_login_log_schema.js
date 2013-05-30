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
 * UserLoginLogSchema
 *
 * the login log keeps track of
 * the users logins
 */
var UserLoginLogSchema = module.exports = new db.Schema({
  ip: String,
  createdAt: { type: Date, default: Date.now }
});