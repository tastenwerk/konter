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

  app.get( '/logout', renderLogout );

  app.get( '/forgot_password', renderGetForgotPassword );
  app.post( '/forgot_password', renderPostForgotPassword );

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
 * GET /logout
 *
 * render logout
 *
 * @api public
 */
function renderLogout( req, res ){
  req.session.userId = null;
  req.session.userIp = null;
  req.flash('notice', res.locals.t('You have been logged off successfully!'));
  res.locals.flash = req.flash();
  res.render( konter.views.get('/auth/login.jade'))
}

/**
 * GET /forgot_password
 *
 * render forgotten password view
 *
 * @api public
 */
function renderGetForgotPassword( req, res ){
  res.locals.flash = {}
  res.render( konter.views.get('auth/forgot_password.jade') );
}

/**
 * POST /forgot_password
 *
 * posts an email address.
 *
 * the given address will be validated. If it exists in the system,
 * a link will be sent to the user account
 *
 * @api public
 */
function renderPostForgotPassword( req, res ){

  var crypto = require('crypto');

  var confirmationKey = crypto.createHash('sha1').update((new Date()).toString(32)).digest('hex');

  konter.db.models.User.findOne( {email: req.body.email}, function( err, user ){
    if( user ){
      user.update({ confirmation: { key: confirmationKey,
                                    expires: moment().add('d',3).toDate(),
                                    ipAddr: konter.plugins.auth.getRemoteIP( req ),
                                    tries: 3 } }, function( err ){
        if( err ){
          req.flash('error', err);
          console.log(err);
          res.render( konter.views.get( 'auth/forgot_password.jade' ), { flash: req.flash() } );
        } else {
          konter.plugins.mailer.deliver({ 
            to: req.body.email,
            subject: '['+konter.config.site.title+'] '+res.locals.t('Password reset request'),
            text: req.i18n.t('You (or somebody else) has requested to reset your password. If this was not your intention, you can ignore this email (respectively report an abuse) - your password will remain untouched. If you whish to continue, please click on the link below.') +
                  "http://" + konter.config.site.domain + "/users/"+ user._id + "/reset_password?key=" + confirmationKey +
                  res.locals.t('bye', {site: konter.config.site.title})
            },
            function( err, response ){
              if( err ){
                console.log( err );
                req.flash('error', err);
              } else
                req.flash('notice', res.locals.t('Password reset request has been sent!'));
              res.render( konter.views.get( 'auth/login.jade' ), { flash: req.flash() } );
          });
        }

      });
    } else {
      req.flash('error', res.locals.t('Email unknown') );
      res.render( konter.views.get( 'auth/forgot_password.jade' ), { flash: req.flash() } );
    }
  });
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