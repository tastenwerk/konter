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
 
var konter = require( __dirname+'/../../lib/konter' );

module.exports = function authRoutes( app, socket ){

  app.get( '/login', renderGetLogin );
  app.post( '/login', konter.plugins.auth.login, renderPostLogin );

  app.get( '/initial-setup', renderGetInitialSetup );
  app.post( '/initial-setup', renderPostInitialSetup );

}

/**
 * GET /login
 *
 * render login form
 *
 * @api public
 */
function renderGetLogin( req, res ){
  res.locals.flash = req.flash();
  res.render( konter.views.get('auth/login.jade') );
}

/**
 * POST /login
 *
 * render post login form
 *
 * @api public
 */
function renderPostLogin( req, res ){
  if( res.locals.currentUser )
    res.redirect( '/dashboard' );
  else
    res.render( konter.views.get( 'auth/login.jade' ), { flash: req.flash() } );
}

/**
 * GET /konter-initial-setup
 *
 * render initial setup form if no user was
 * found in the database up till now
 *
 * @api public
 */
function renderGetInitialSetup( req, res ){
  konter.db.model('User').find({}, function( err, users ){
    if( users.length > 0 )
      return res.redirect( '/login' );
    req.flash();
    res.render( konter.views.get('auth/initial-setup.jade'), { flash: req.flash() } );
  });
}

/**
 * POST /konter-initial-setup
 *
 * perform initial setup if no user is present until now
 *
 * @api public
 */
function renderPostInitialSetup( req, res ){

  // check if a user exists
  konter.db.model('User').find({}, function( err, users ){

    if( users.length > 0 )
      return res.redirect( '/login' );

    createNextGroup( 0, ['admins', 'editors', 'users'], [], req, res );

  });

}

/**
 * create groups turn by turn
 *
 * @param {Number} [count] - our current position of group creation
 * @param {Array} [groupIdxs] - an array of strings (group names) to be created
 * @param {Array} [groups] - an empty array (will be filled with actual group objects)
 * @param {Object} [expressjs res object]
 *
 * @api private
 */
function createNextGroup( count, groupIdxs, groups, req, res ){

  if( count >= groupIdxs.length-1 )
    return createAdmin( groups, req, res );

  konter.db.models.Group.create({ name: groupIdxs[count] }, function(err, group){
    if( err ) konter.log.throwError('Could not create group', groupIdxs[count], 'err:', require('util').inspect(err));
    if( !group ) konter.log.throwError('Could not create group. Did not get a valid group object when trying to create group', groupIdxs[count]);
    groups.push( group );
    createNextGroup( ++count, groupIdxs, groups, req, res );
  });

}

/**
 * create the admin user
 *
 * @param {Array} [groups] - an array with Group objects
 * @param {Object} [expressjs res object]
 *
 * @api private
 */
function createAdmin( groups, req, res ){

  konter.db.model('User').create({ name: { nick: req.body.user.name },
                                 email: req.body.user.email || req.body.user.name + '@' + 'konter.site.domain',
                                 password: req.body.user.password,
                                 groups: groups }, 
                                 function( err, user ){
                                    if( err ) konter.log.throwError('could not create user admin', require('util').inspect(err));
                                    if( !user ) konter.log.throwError('could not create user admin');
                                    req.flash('notice', res.locals.t('Initial setup completed successfully!', {name: req.body.user.name}));
                                    res.redirect('/login');
                                }
  );
}