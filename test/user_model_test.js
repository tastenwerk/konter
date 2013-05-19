var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');

describe('User Model', function(){

  describe( 'properties', function(){

    var user = new konter.db.model('User')( helper.user_defaults );

    describe('has a name object', function(){

      describe('with a firstname property', function(){

        it( 'has name.first set to ' + helper.user_defaults.name.first, function(){
          user.name.first.should.eql( helper.user_defaults.name.first );
        });

        it( 'has name.last set to ' + helper.user_defaults.name.last, function(){
          user.name.last.should.eql( helper.user_defaults.name.last );
        });

      });

    });

  });

});
