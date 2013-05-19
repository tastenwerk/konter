var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');

describe('environment config', function(){

  describe('defaults to port', function(){

    it('port exists and is set to 3000', function(){
      konter.config.port.should.eql( 3000 );
    });

  });

  describe('defualts to appsDir', function(){

    it('appsDir is set to process.cwd()+/dummy/test/app', function(){
      konter.config.appsDir.should.eql( 'test/dummy/app' );
    });

  });

  describe('db defaults', function(){

    it('name is "konter-teest"', function(){
      konter.config.db.name.should.eql( 'konter-test' );
    });

  });

});
