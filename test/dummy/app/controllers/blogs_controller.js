var Controller = require( __dirname + '/../../../../lib/router/controller' );

var AuthMiddleware = require( __dirname+'/auth_middleware');

var BlogsController = module.exports = new Controller({

  before: {
    all: [ AuthMiddleware.checkDummy ],
    index: [ function dummy2(){} ]
  },

  index: function( req, res ){},

  show: function( req, res ){},

  new: function( req, res ){}

});