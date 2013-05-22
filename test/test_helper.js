
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

konter.server.start();


var helper = module.exports = {};

helper.user_defaults = { name: { first: 'Richard', last: 'Gloucester' }, email: 'richard@gloucester' };

helper.cleanUp = function( callback ){
  konter.db.model('User').remove({}, function( err ){
    if( err ) console.log('error when removing users', err);
    callback();
  })
}
