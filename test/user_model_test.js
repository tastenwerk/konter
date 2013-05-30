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

      describe('#name.full', function(){

        it('should have a full property', function(){
          user.should.have.property('name').with.property('full');
        });

        it('fullname returns firstname[space]lastname', function(){
          user.name.full.should.eql(user.name.first + ' ' + user.name.last);
        });

        it('will return firstname if no lastname is given (without a space)', function(){
          user.name.last = null;
          user.name.first.should.eql(user.name.full);
        });

        it('will return lastname if no firstname is given (without a space)', function(){
          user.name.first = null;
          user.name.last = 'v.';
          user.name.last.should.eql(user.name.full);
        });

        it('will return nickname if neither firstname nor lastname is given', function(){
          user.name.last = user.name.first = null;
          user.name.nick.should.eql(user.name.full);
        });

        it('will return email address if none of the above attributes is given', function(){
          user.name.last = user.name.first = user.name.nick = null;
          user.email.should.eql(user.name.full);
        });

      });


    });

  });

  describe('required fields', function(){

    it('must have an email address set', function( done ){
      var user = new konter.db.models.User({});
      user.save( function( err ){
        err.errors.email.type.should.eql('required');
        done();
      });
    });

    it('must have a valid email address', function( done ){
      var user = new konter.db.models.User({ email: 'henry' });
      user.save( function( err ){
        err.errors.email.type.should.eql('regexp');
        done();
      });
    });

  });

  describe( 'pre save methods', function(){


    var user = new konter.db.model('User')( helper.user_defaults );

    before(function( done ){
      user.name.nick = null;
      user.save( function( err ){
        if( err ) console.log(' ------------------------ ERROR: ', err);
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

    describe('hashed password if no password', function(){

      it('has a hahsed password if no password has been set', function(){
        user.hashedPassword.should.be.lengthOf(40);
      })

    })

  });

});
