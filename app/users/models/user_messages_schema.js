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
 * UserMessagesSchema
 *
 * a message is for inner communication
 * between users.
 *
 * this Schema is embedded in the user object
 *
 */
var UserMessagesSchema = new db.Schema({
  content: String,
  readAt: Date,
  deletedAt: Date,
  from: { type: db.Schema.Types.ObjectId, ref: 'User' },
  to: { type: db.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});


/**
 * a message can have followups
 */
UserMessagesSchema.add({
  followUps: [UserMessagesSchema]
});