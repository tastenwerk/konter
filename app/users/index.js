/**
 * konter
 *
 * a rock solid and small content repository and web framework
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */
 
var konter = require( __dirname+'/../../lib/konter' )
  , jade = require('jade')
  , fs = require('fs');

konter.dashboard.plugins.push( require(__dirname+'/dashboard-plugins/online-users') );
konter.cron.jobs.push( require(__dirname+'/cron.update-user-stats') );

konter.plugins.users = require(__dirname+'/users-plugin');

module.exports = function userRoutes( app, socket ){

  app.get( '/users', konter.plugins.auth.check, renderGetUsers );

  app.get( '/users/:id', konter.plugins.auth.check, renderGetUser );

}

/**
 * GET /users
 *
 * lists users
 *
 * authenticated users only
 *
 * @api public
 */
function renderGetUsers( req, res ){

  res.render( konter.views.get('users/index.jade') );

}

/**
 * GET /users/:id
 *
 * get a specific user by it's id
 *
 * authenticated users only
 *
 * @api public
 */
function renderGetUser( req, res ){

  res.format({
    html: function(){ res.render( konter.views.get('users/show.jade') ); },
    js: function(){ 
      //
      // TODO: ABSTRACT THIS METHOD WITH SIMPLE CALL !!!
      //
      var contentFilename = konter.views.get('users/show.jade');
      res.locals.content = jade.compile( fs.readFileSync( contentFilename ), { filename: contentFilename } )( res.locals );
      res.render( konter.views.get('users/show.ejs') ); 
    }
  })

}