var should = require('should')
  , konter = require('../lib/konter')
  , helper = require('./test_helper');

var path = require('path');

describe('Tree plugin', function(){

  before( function( done ){
    helper.definePlainModel();
    helper.definePlainBModel();
    helper.cleanUp( done );
  });

  describe('attaches a document to another document\'s path', function(done){

    var docA, docB;

    before( function( done ){
      require('async').series([
        function( next ){ helper.createValidDoc( 'PlainDoc', 'plainA', function( err, _docA ){ docA = _docA; next( err ); } ); },
        function( next ){ helper.createValidDoc( 'PlainDoc', 'plainB', { path: docA.absPath }, function( err, _docB ){ docB = _docB; next( err ); } ); }
      ], done );
    });

    it('returns absPath of itself', function(){
      should.not.exist( docA.path );
      docA.absPath.should.eql( '/'+docA._type+':'+docA._id );
    });

    it('docB is attached to docA', function(){
      docB.path.should.eql( docA.absPath );
    });

    it('returns absPath of docB', function(){
      docB.absPath.should.eql( docA.absPath + '/'+docB._type+':'+docB._id );
    });

  });

});