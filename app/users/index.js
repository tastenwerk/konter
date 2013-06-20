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
  , fs = require('fs')
  , path = require('path');

konter.dashboard.plugins.push( require(__dirname+'/dashboard-plugins/online-users') );
konter.cron.jobs.push( require(__dirname+'/cron.update-user-stats') );
konter.tmpls.push( konter.jadeCompile( __dirname+'/../views/users/tmpls/details.jade', { 
  t: function( str ){ require('globalize').localize( str, 'de' ); }
}) );

konter.plugins.users = require(__dirname+'/users-plugin');

module.exports = function userRoutes( app, socket ){

  app.get( '/users', konter.plugins.auth.check, renderGetUsers );

  app.get( '/users/:id', konter.plugins.auth.check, konter.plugins.users.getById, konter.plugins.groups.getAll, renderGetUser );

  app.get( '/users/:id/avatar:format*', konter.plugins.auth.check, konter.plugins.users.getById, renderGetUserAvatar );

}

/**
 * GET /users
 *
 * lists users
 *
 * authenticated users only
 *
 * @api public (login)
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
 * @api public (login)
 */
function renderGetUser( req, res ){

  res.format({
    json: function(){ res.json( res.locals.user ) },
    js: function(){ 
      //
      // TODO: ABSTRACT THIS METHOD WITH SIMPLE CALL !!!
      //
      //var contentFilename = konter.views.get('users/show.jade');
      res.locals.roles = konter.config.roles;
      //res.locals.content = jade.compile( fs.readFileSync( contentFilename ), { filename: contentFilename } )( res.locals );
      res.render( konter.views.get('users/show.ejs') ); 
    }
  });

}

/**
 * GET /users/:id/avatar
 *
 * returns a url to the user's avatar or the
 * konter's default avatar
 *
 * @api public (login)
 */

function renderGetUserAvatar( req, res ){

  var filepath = path.join( konter.config.datastore.absolutePath, 'users', res.locals.user._id.toString(), 'profile_'+req.query.size || 'orig.jpg' );
  var defaultAvatar = process.cwd() + '/public/images/user_150x150.jpg';
  if( !fs.existsSync( konter.config.datastore.absolutePath ) )
    filepath = defaultAvatar;
  if( fs.existsSync( path.join( konter.config.datastore.absolutePath, 'users' ) ) ){
    if( !fs.existsSync( path.dirname(filepath) ) )
      filepath = defaultAvatar;
  } else
    filepath = defaultAvatar;

  if ( filepath === defaultAvatar )
    if( !fs.existsSync( filepath ) )
      filepath = path.join( konter.root, '/public/images/user_150x150.jpg' );

    console.log('returning', filepath );

  res.sendfile( filepath );

}