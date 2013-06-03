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

var moment = require('moment');

var konter = require( __dirname+'/../konter' );

var auth = module.exports = {};

/**
 * check auth plugin middleware
 *
 * checks if a session exists, is valid and redirects
 * to /login if not.
 *
 * @api public
 */
auth.check = function checkAuth( req, res, next ){
  konter.db.models.User.findById( req.session.userId, function( err, user ){
    if( err ) req.flash('error', err );
    if( user ){
      req.user = user;
      if( user.lastRequest.createdAt.getTime() > moment().subtract('m', konter.config.session.timeout.mins ) ){
        user.lastRequest.createdAt = new Date();
        user.save( function( err ){
          if( err ) req.flash('error', err );
          res.locals.currentUser = user;
          next();
        })
      } else {
        req.session.userId = null;
        req.session.userIp = null;
        req.flash('error', res.locals.t('user.session_timeout', {timeout: konter.config.session.timeout.mins}));
        redirectToLogin( req, res );
      }
    } else {
      req.flash('error', res.locals.t('user.login_required') );
      redirectToLogin( req, res );
    }
  });
}

/**
 * login a user
 *
 * expects req.body.email and req.body.password to be valid.
 * the req.body.email field can also be used for the name.nick
 * field. It will be added to the user query looking up for a
 * valid user.
 *
 * if not valid, will redirect to /login
 *
 * @api public
 */
auth.login = function loginUser( req, res, next ){
  konter.db.models.User.findOne().or([ {email: req.body.email }, {'name.nick': req.body.email} ]).exec( function( err, user ){
    if( err ) req.flash('error', err);
    if( user && user.authenticate( req.body.password ) ){
      if(user.loginLog.length > 30)
        user.loginLog = user.loginLog.slice(0,30);
      user.loginLog.push( {ip: auth.getRemoteIP( req ) } );
      user.lastRequest = { createdAt: new Date(), ip: auth.getRemoteIP( req ) };
      user.save( function( err ){
        if( err ) req.flash('error', err);
        if( user ){
          req.session.userId = user.id.toString();
          req.session.userIp = auth.getRemoteIP( req );
          res.locals.currentUser = user;
        }
        next();
      })
    } else {
      req.flash('error', req.i18n.t('user.login_failed'));
      next();
    }
  });
}

/**
 * requires an admin user. If user is not in group admins
 * request will be redirected to /dashboard. In case of JSON
 * an { error: 'permission denied' } will be returend
 *
 * @api public
 */
auth.requireAdmin = function( req, res, next ){
  if( res.locals.currentUser && res.locals.currentUser.isAdmin() )
    return next();
  if( req.xhr )
    res.json({ error: 'permission denied' });
  else
    res.send(403, 'permission denied');
}

/**
 * get remote IP address
 * this function consideres being processed behind a proxy (e.g. nginx)
 *
 * @api private
 */
auth.getRemoteIP = function getRemoteIP( req ){
  var ipAddress = null;
  if(req.headers['x-forwarded-for'])
    ipAddress = req.headers['x-forwarded-for'];
  else
    ipAddress = req.connection.remoteAddress;
  return ipAddress;
}

/**
 * redirects to login. If a req.redirectToLogin property is present
 * it will be considered for redirection.
 *
 * req.redirectToLogin [function] - will be called with req, res
 * req.redirectToLogin [string] - will be treated as route path
 *
 * @api private
 */
function redirectToLogin( req, res ){

  if( req.redirectToLogin )
    if( typeof(req.redirectToLogin) === 'function' )
      req.redirectToLogin( req, res );
    else
      res.redirect( req.redirectToLogin );
  else{
    if( req.xhr )
      res.send(401)
    else
      res.redirect('/login');
  }
}