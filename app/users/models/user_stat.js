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

var UserStatSchema = db.Schema({
  date: Date,
  online: [{ type: db.Schema.ObjectId, ref: 'User'}],
  registered: [{ type: db.Schema.ObjectId, ref: 'User'}]
});


module.exports = db.model('UserStat', UserStatSchema);