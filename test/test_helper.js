
/**
 * konter
 *
 * [c->k]ontent repository [core] for team collaboration
 *
 * Copyright 2013 by TASTENWERK
 *
 */

var konter = require( __dirname + '/../lib/konter' );

process.env.NODE_ENV = 'test';

konter.config.appsDir = 'test/dummy/app';
konter.config.db.name = 'konter-test';
konter.config.log.level = 0;

konter.server.start();

var helper = module.exports = {};

helper.user_defaults = { name: { first: 'Richard', last: 'Gloucester', nick: 'richie' }, email: 'richard@gloucester.site' };

/**
 * clean up all models
 *
 */
helper.cleanUp = function( callback ){

  cleanUpNextModel( 0, callback );

}

/**
 * create a valid user object
 *
 */
helper.createValidUser = function( name, opts, callback ){
  if( typeof( opts ) === 'function' ){
    callback = opts;
    opts = {};
  }
  var options = { name: { first: name, last: name }, email: name+'@local.site' };

  for( var i in opts )
    options[i] = opts[i];

  konter.db.models.User.create( options , callback );
}

/**
 * create a valid group object
 *
 */
helper.createValidGroup = function( name, opts, callback ){
  if( typeof( opts ) === 'function' ){
    callback = opts;
    opts = {};
  }
  var options = { name: name };
  for( var i in opts )
    options[i] = opts[i];

  konter.db.models.Group.create( options, callback );
}

/**
 * create a valid document
 *
 */
helper.createValidDoc = function( type, name, opts, callback ){
  if( typeof( opts ) === 'function' ){
    callback = opts;
    opts = {};
  }
  var options = { name: name };
  for( var i in opts )
    options[i] = opts[i];
  konter.db.models[ type ].create( options, callback );
}

/**
 * define a plain document model
 *
 */
helper.definePlainModel = function( options ){
  options = options || {};
  if( konter.db.models.PlainDoc )
    return;
  var PlainSchema = konter.db.Schema( options );
  PlainSchema.plugin( konter.db.plugins.default );
  PlainSchema.plugin( konter.db.plugins.acl );
  PlainSchema.plugin( konter.db.plugins.tree );
  konter.db.model( 'PlainDoc', PlainSchema );
}

/**
 * define a plain document model
 *
 */
helper.definePlainBModel = function( options ){
  options = options || {};
  if( konter.db.models.PlainBDoc )
    return;
  var PlainBSchema = konter.db.Schema( options );
  PlainBSchema.plugin( konter.db.plugins.default );
  PlainBSchema.plugin( konter.db.plugins.tree );
  konter.db.model( 'PlainBDoc', PlainBSchema );
}

function cleanUpNextModel( doneCollections, callback ){
  if( doneCollections >= Object.keys(konter.db.models).length )
    return callback( null );

  konter.db.models[ Object.keys(konter.db.models)[ doneCollections ] ].remove({}, function( err ){
    if( err ){
      console.log('error when removing users', err);
      return callback( err );
    }
    cleanUpNextModel( ++doneCollections, callback );
  });

}
