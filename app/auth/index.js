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

  app.get( '/konter-initial-setup', renderGetInitialSetup );

  app.post( '/konter-initial-setup', renderPostInitialSetup );

}

/**
 * GET /login
 *
 * render login form
 *
 * @api public
 */
function renderGetLogin( req, res ){
  res.render( konter.views.get('auth/login.jade') );
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
    res.render( __dirname+'/views/initial-setup.jade', { flash: req.flash() } );
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

    createNextGroup( 0, ['admins', 'editors', 'users'], [], res );

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
function createNextGroup( count, groupIdxs, groups, res ){

  if( count >= groupIdxs.length-1 )
    return createAdmin( groups, res );

  konter.db.models.Group.create({ name: groupIdxs[count] }, function(err, group){
    if( err ) konter.log.throwError('Could not create group', groupIdxs[count], 'err:', require('util').inspect(err));
    if( !group ) konter.log.throwError('Could not create group. Did not get a valid group object when trying to create group', groupIdxs[count]);
    groups.push( group );
    createNextGroup( ++count, groupIdxs, groups, res );
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
function createAdmin( groups, res ){

  konter.db.model('User').create({ name: { nick: req.body.user.name },
                                 email: req.body.user.email || req.body.user.name + '@' + 'konter.site.domain',
                                 password: req.body.user.password,
                                 groups: groups }, 
                                 function( err, user ){
                                    if( err ) konter.log.throwError('could not create user admin', require('util').inspect(err));
                                    if( !user ) konter.log.throwError('could not create user admin');
                                    req.flash('notice', req.i18n.t('initial_setup.done', {name: req.body.user.name}));
                                    res.redirect('/login');
                                }
  );
}