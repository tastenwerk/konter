var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');
var sol, luna, users, martedi;

describe('Basic ACL plugin', function(){

  before( function( done ){
    helper.definePlainModel();
    require('async').series([
      helper.cleanUp,
      function( next ){ helper.createValidUser( 'sol', function(err, user){ sol = user; next(err); } ); },
      function( next ){ helper.createValidUser( 'luna', function( err, user ){ luna = user; next(err); } ); },
      function( next ){ helper.createValidGroup( 'users', { allowedApps: [ 'base' ] }, function( err, group ){ users = group; next( err ); } ); },
      function( next ){ helper.createValidUser( 'martedi', function(err, user){ 
        user.groups.push( users );
        user.save( function( err ){
          if( err ) console.log(err);
          martedi = user; 
          next(err); 
        });
      }); 
    },
    ], done );
  });

  describe('creating a document', function(){

    describe('with ownership', function(){
      it('put given "holder" user object into createdBy', function(done){
        konter.db.models.PlainDoc.create({ name: 'test', holder: sol }, function( err, doc ){
          should.not.exist(err);
          doc._createdBy.should.eql( sol._id );
          done();
        });
      });
      it('can access created object withUser', function(done){
        konter.db.models.PlainDoc.findOne({name:'test'}).execWithUser( sol, function( err, doc ){
          should.exist(doc);
          should.not.exist(err);
          doc.name.should.eql('test');
          done();
        });
      })
    });

    describe('without ownerhsip', function(){
      it('doesn\'t set ownership, user is locked out if access withUser', function( done ){
        konter.db.models.PlainDoc.create({ name: 'test2' }, function( err, doc ){
          should.not.exist(err);
          should.not.exist(doc._createdBy);
          done();
        });
      });

      it('cannot access created object withUser', function(done){
        konter.db.models.PlainDoc.findOne({name:'test2'}).execWithUser( sol, function( err, doc ){
          should.not.exist(err);
          should.not.exist(doc);
          done();
        });
      });
    });

  });

  describe('finding a document by another user', function(){

    describe('a document with only ownership by owner', function(){

      it('will not find a document without any access privileges', function(done){
        konter.db.models.PlainDoc.find().execWithUser( luna, function( err, doc ){
          should.not.exist(err);
          doc.should.be.lengthOf(0);
          done();
        });
      });

    });

  });

  describe('sharing a document with another user', function(){

    var doc;

    before( function(done){
      konter.db.models.PlainDoc.findOne({name:'test'}).execWithUser( sol, function( err, _doc ){
        doc = _doc;
        done();
      });
    });

    it('#share adds document\'s absPath to the added user\'s acl', function(){
      luna.acl.should.be.lengthOf(0);
      doc.share( luna, 'rwsd' );
      luna.acl.should.be.lengthOf(1);
      luna.acl[0].documentId.toString().should.eql( doc._id.toString() );
    });

    it('#share a second time the same settings does not add a new entry', function(){
      luna.acl.should.be.lengthOf(1);
      doc.share( luna, 'rw' );
      luna.acl.should.be.lengthOf(1);
    });

    it('#share with callback stores user\'s acl settings', function( done ){
      doc.share( luna, 'rw', function( err ){
        should.not.exist(err);
        done();
      });
    });

  });

  describe('finds a document if it has been shared with user', function(){

    it('luna finds document', function( done ){
      konter.db.models.PlainDoc.findOne({name:'test'}).execWithUser( luna, function( err, doc ){
        should.not.exist(err);
        doc.name.should.eql('test');
        done();
      });
    });

    it('martedi still does not find same document', function( done ){
      konter.db.models.PlainDoc.findOne({name:'test'}).execWithUser( martedi, function( err, doc ){
        should.not.exist(err);
        should.not.exist(doc);
        done();
      });
    });

  });

  describe('shares a document with a group', function(){

    it('#share with group', function( done ){
      konter.db.models.PlainDoc.findOne({name:'test'}).execWithUser( sol, function( err, doc ){
        doc.share( users, 'r', function( err ){
          should.not.exist(err);
          done();
        });
      });
    });

  });

  describe('finds a document because of group membership', function(){

    before( function( done ){
      martedi.populate('groups', function( err, user ){
        martedi = user;
        done();
      });
    });

    it('finds the document', function( done ){
      konter.db.models.PlainDoc.findOne({name: 'test' }).execWithUser( martedi, function( err, doc ){
        should.not.exist(err);
        doc.name.should.eql('test');
        done();
      });
    });

  });

});