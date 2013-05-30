var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');

describe('Simple application based acl', function(){

  var sol, luna, admins, users;

  before( function( done ){
    require('async').series([
      helper.cleanUp,
      function( next ){ helper.createValidGroup( 'admins', { allowedApps: [ 'base' ] }, function( err, group ){ admins = group; next( err ); } ); },
      function( next ){ helper.createValidGroup( 'users', { allowedApps: [ 'base' ] }, function( err, group ){ users = group; next( err ); } ); },
      function( next ){ helper.createValidUser( 'sol', { groups: admins }, function(err, user){ sol = user; next(err); } ); },
      function( next ){ helper.createValidUser( 'luna', function( err, user ){ luna = user; next(err); } ); }
    ], done );
  });

  describe('a user belonging to a group can access the allowedApps defined in the group', function(done){

    it(' sol can access "base" app', function( done ){
      sol.allowedApps( function( err, apps ){
        apps.should.include('base');
        done();
      });
    });

    it(' luna cannot access "base" app', function( done ){
      luna.allowedApps( function( err, apps ){
        apps.should.not.include('base');
        done();
      });
    });

    it( 'if luna gets membership to group "users", she can access "base" too', function( done ){
      luna.groups.push(users);
      luna.save( function( err ){
        if( err ) console.log(err);
        konter.db.models.User.findById( luna._id, function( err, luna ){
          luna.allowedApps( function( err, apps ){
            apps.should.include('base');
            done();
          });
        });
      })
    });

  });

});