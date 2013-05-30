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
  , crypto = require('crypto')
  , moment = require('moment');

var UserMessagesSchema = require( __dirname+'/user_messages_schema' )
  , UserACLSchema = require( __dirname+'/user_acl_schema' )
  , UserLoginLogSchema = require( __dirname+'/user_login_log_schema' );

var UserSchema = db.Schema({
  name: {
    first: String,
    last: String,
    nick: { type: String, lowercase: true, index: { unique: true } }
  },
  hashedPassword: String,
  salt: String,
  preferences: {type: db.Schema.Types.Mixed, default: { common: { locale: 'en', hosts: [] }, docklets: [ 'notification_service/docklets/summary' ] } },
  messages: {
    inbox: [ UserMessagesSchema ],
    outbox: [ UserMessagesSchema ]
  },
  email: {type: String, 
          lowercase: true,
          required: true,
          index: { unique: true },
          match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i },
  loginLog: [ UserLoginLogSchema ],
  friends: [{ type: db.Schema.Types.ObjectId, ref: 'User' }],
  acl: [ UserACLSchema ],
  lastRequest: {
    createdAt: Date,
    ip: String
  },
  roles: {type: Array, default: []},
  groups: [{ type: db.Schema.ObjectId, ref: 'Group' }],
  confirmation: {
    key: String,
    expires: Date,
    tries: Number
  },
  _createdAt: { type: Date, default: Date.now },
  suspended: { type: Boolean, default: false }
});

/**
 * computes the user's full name
 * to display
 * in worst case, this is the user's email
 * address
 */
function getUserFullName(){
  if( this.name.first && this.name.last )
    return this.name.first + ' ' + this.name.last;
  else if( this.name.first )
    return this.name.first;
  else if( this.name.last )
    return this.name.last;
  else if( this.name.nick )
    return this.name.nick;
  else
    return this.email;
}

/**
 * name.full virtual
 *
 * constructs a string which is definitely not null
 * and represents a (not unique) name of this user
 */
UserSchema.virtual('name.full').get( getUserFullName ).set( function( name ){
  if( name.split(' ') ){
    this.name.first = name.split(' ')[0];
    this.name.last = name.split(' ')[1];
  } else
    this.name.first = name;
});

/**
 * allowedApps
 *
 * fills callback arg1 with allowed apps the user can access through their
 * group membership (allowedApps is stored in groups only)
 *
 * @api public
 */
UserSchema.method('allowedApps', function( callback ){
  var allowed = [];
  this.getGroups( function( err, groups ){
    for( var i in groups )
      for( var j in groups[i].allowedApps )
        if( allowed.indexOf( groups[i].allowedApps[j] ) < 0 )
          allowed.push( groups[i].allowedApps[j] );
    callback( err, allowed );
  })
});

/**
 * getGroups
 *
 * loads membership groups of the user from the database and
 * caches groups, if they have been loaded once.
 *
 * @param {Object} options
 * * cache: false (do not use cache) 
 * 
 * @api public
 *
 */
UserSchema.method('getGroups', function( options, callback ){
  if( typeof(options) === 'function' ){
    callback = options;
    options = {};
  }
  options.cache = options.cache || false;

  if( this.cachedGroups && options.cache )
    return callback( null, this.cachedGroups );

  if( this.groups && this.groups.length > 0 && this.groups[0].allowedApps ){
    this.cachedGroups = this.groups;
    return callback( null, this.cachedGroups );
  }

  if( this.groups.length > 0 )
    loadNextGroup.call( this, 0, callback );
  else
    callback( null, [] );

});

/**
 * loads next Groups, until this.cachedGroups object is filled with
 * this.groups or returns error
 *
 * @api private
 */
function loadNextGroup( count, callback ){
  var self = this;
  if( this.cachedGroups && this.cachedGroups.length >= this.groups.length )
    return callback( null, this.cachedGroups );
  this.cachedGroups = this.cachedGroups || [];
  db.models.Group.findById( this.groups[count], function( err, group ){
    if( err )
      return callback( err );
    if( group )
      self.cachedGroups.push( group );
    else
      return callback( 'could not find group with id', this.groups[count] );
    loadNextGroup.call( self, ++count, callback );
  });
}

/**
 * setup name.nick with name.first and name.last
 * if not given
 *
 * @api private
 */
UserSchema.pre('validate', function( next ){
  if( !this.isNew ) return next();
  if( !this.name.nick && (this.name.first || this.name.last ) )
    if( this.name.first && this.name.last )
      this.name.nick = this.name.first.substr(0,1) + '.' + this.name.last;
    else if( this.name.last )
      this.name.nick = this.name.last;
    else if( this.name.first )
      this.name.nick = this.name.first;
  next();
});

/**
 * check if password wants to be set. If not
 * set a hashed password to an arbitrary value
 *
 * @api private
 */
UserSchema.pre('save', function( next ){
  if( this.isNew ){
    if( !this.password && !this.hashedPassword ){
      this.password = (new Date()).getTime().toString(32);
    }
    this.confirmation = {
      key: crypto.createHmac('sha1','konter').update((new Date()).getTime().toString(32)).digest('hex'),
      expires: moment().add('h', 24).toDate(),
      tries: 3
    };
  }
  next();
});

/**
 * show the number of unread messages
 *
 */
UserSchema.virtual('unreadMessages').get( function(){
  var unread = 0;
  this.messages.inbox.forEach( function( message ){
    if( !message.readAt ) unread+=1;
  });
  return unread;
});;

/**
 * set hashedPassword
 *
 * @param {String} password - the unencrypted password to be set
 */
UserSchema.virtual('password').set(function( password ) {
    this._password = password;
    this.salt = this.generateSalt();
    this.hashedPassword = this.constructor.encryptPassword(password, this.salt);
})

/**
 * get unenrypted password
 *
 * @return {String} the unencrypted password (exists only for the time of obejct
 * creation)
 */
UserSchema.virtual('password').get(function() { 
  return this._password; 
});

/**
 * returns if user is admin (in group admins)
 *
 */
UserSchema.method('isAdmin', function(){
  return this.roles.indexOf('manager') >= 0;
});

/**
 * authenticate user
 *
 * compares hashed password with given plain text password
 *
 * @param {String} plainTextPassword the plain text password which
 * will be hase-compared against the original password saved to
 * the database
 */
UserSchema.method('authenticate', function(plainTextPassword) {
  return this.constructor.encryptPassword(plainTextPassword, this.salt) === this.hashedPassword;
});

/**
 * generate salt
 *
 * generate the password salt
 */
UserSchema.method('generateSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

/**
 *
 * encrypt password
 *
 * @param {String} password - clear text password string
 * to be encrypted
 */
UserSchema.statics.encryptPassword = function(password, salt) {
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

/**
 * anybody user id
 */
UserSchema.statics.anybodyId = 'a00000000000000000000000';

/**
 * the anybody user
 * is similar to publishing something. If anybody user has
 * access to an object, it will be schown to the public.
 *
 */
UserSchema.statics.anybody = { name: { full: 'anybody', nick: 'anybody' }, _id: UserSchema.statics.anybodyId };

/**
 * system user id
 */
UserSchema.statics.systemId = 's00000000000000000000000';

/**
 * the system user
 * is used to create content from public access (without a user
 * being logged in)
 *
 */
UserSchema.statics.system = { name: { full: 'system', nick: 'system'}, _id: UserSchema.statics.systemId };

/**
 * everybody user id
 */
UserSchema.statics.everybodyId = 'e00000000000000000000000';

/**
 * the everybody user
 * if a content object is shared with the everybody user, 
 * any logged in user can access this content with the
 * given privileges.
 *
 * An everybody-shared content cannot be shared with other
 * users ( would avoid everybody access, if removed later )
 * nor can everybody-user get deletion privileges
 *
 */
UserSchema.statics.everybody = { name: {full: 'everybody', nick: 'everybody'}, _id: UserSchema.statics.everybodyId };

var jsonSelect = require('mongoose-json-select');
UserSchema.plugin(jsonSelect, '-hashedPassword -salt -confirmation -loginLog');

module.exports = db.model('User', UserSchema);