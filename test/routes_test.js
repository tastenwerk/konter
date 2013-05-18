/**
 * konter
 *
 * a web solid small web framework basement
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */
 
var should = require('should')
  , testHelper = require( __dirname+'/test_helper' )
  , konter = require( __dirname + '/../lib/konter' );

describe('router', function(){

  var BlogsController = require( __dirname+'/dummy/app/controllers/blogs_controller' );

  describe('defines a new route to a blogs controller (in dummy/apps)', function(){

    konter.routes.register('blogs');

    it('GET /blogs', function(){
      konter.routes.list().get.should.have.property('/blogs');
      konter.routes.list().get['/blogs'].should.eql(BlogsController.methods.index);
    });

    it('GET /blogs/:id - SHOW', function(){
      konter.routes.list().get.should.have.property('/blogs/:id');
      konter.routes.list().get['/blogs/:id'].should.eql(BlogsController.methods.show);
    });

    it('GET /blogs/new', function(){
      konter.routes.list().get.should.have.property('/blogs/new');
      konter.routes.list().get['/blogs/new'].should.eql(BlogsController.methods.new);
    })

  });

});