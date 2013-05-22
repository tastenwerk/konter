var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');

describe('User Model', function(){

  before( function( done ){
    helper.cleanUp( done );
  });

  var user = new konter.db.model('User')( helper.user_defaults );

  describe( 'properties', function(){

    describe('has a name object', function(){

      describe('with a firstname property', function(){

        it( 'has name.first set to ' + helper.user_defaults.name.first, function(){
          user.name.first.should.eql( helper.user_defaults.name.first );
        });

        it( 'has name.last set to ' + helper.user_defaults.name.last, function(){
          user.name.last.should.eql( helper.user_defaults.name.last );
        });

        it( 'has virtual name.full compiled of name.first name.last', function(){
          user.name.full.should.eql( helper.user_defaults.name.first + ' ' + helper.user_defaults.name.last );
        });

      });

    });

  });

  describe( 'pre save methods', function(){

    before(function( done ){
      user.save( function( err ){
        konter.db.model('User').findById( user._id, function( err, _u ){
          user = _u;
          done();
        });
      });
    });

    describe('nick name setup', function(){

      it( 'has name.nick set to ' + helper.user_defaults.name.first.substr(0,1).toLowerCase()+'.'+helper.user_defaults.name.last.toLowerCase(), function(){
        user.name.nick.should.eql( helper.user_defaults.name.first.substr(0,1).toLowerCase()+'.'+helper.user_defaults.name.last.toLowerCase() );
      });

    });

    describe('confirmation hash', function(){

      it( 'has confirmation.key set to a valid hash value', function(){
        user.confirmation.key.should.be.lengthOf(40);
      });

    });

  });

});
