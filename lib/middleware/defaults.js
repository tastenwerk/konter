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
 
var moment = require('moment')
  , Globalize = require('globalize');

var config = require( __dirname+'/../config' );

var defaultsMiddleware = module.exports = function( req, res, next ){

  res.locals.konter = res.locals.konter || {};

  res.locals.konter.config = config;

  res.locals.moment = req.moment = moment;
  res.locals._csrf = req.session._csrf;
  res.locals._honeypot_csrf = require('crypto').createHash('sha1').update('ioco-honeypot').digest('hex');

  res.remoteIP = getRemoteIP( req );

  // setup globalize localization
  if( res.currentUser && res.currentUser.preferences && res.currentUser.preferences.common && res.currentUser.preferences.common.culture )
    Globalize.culture( res.currentUser.preferences.culture );
  else
    Globalize.culture( 'de' );

  res.locals.t = function( str ){
    console.log('translating', str, Globalize.culture().name, Globalize.localize( str, Globalize.culture().name ) );
    return Globalize.localize( str, Globalize.culture().name );
  }

  next();

};

/**
 * get remote IP address
 * this function consideres being processed behind a proxy (e.g. nginx)
 *
 * @api private
 */
function getRemoteIP( req ){
  var ipAddress = null;
  if(req.headers['x-forwarded-for'])
    ipAddress = req.headers['x-forwarded-for'];
  else
    ipAddress = req.connection.remoteAddress;
  return ipAddress;
}