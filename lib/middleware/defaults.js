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
  , konter = require( __dirname + '/../konter' )
  , Globalize = require('globalize');

var config = require( __dirname+'/../config' );

var defaultsMiddleware = module.exports = function( req, res, next ){

  res.locals.konter = res.locals.konter || {};
  res.locals.konter.env = konter.env;
  res.locals.konter.config = config;

  res.locals.moment = moment;
  res.locals._csrf = req.session._csrf;
  res.locals._honeypot_csrf = require('crypto').createHash('sha1').update('konter-honeypot').digest('hex');

  res.remoteIP = konter.plugins.auth.getRemoteIP( req );

  var culture = 'de';
  // setup globalize localization
  if( res.currentUser && res.currentUser.preferences && res.currentUser.preferences.common && res.currentUser.preferences.common.culture )
    culture = res.currentUser.preferences.culture

  res.locals.culture = culture;
  res.locals.t = function( str ){
    var trans = Globalize.localize( str, culture );
    return trans ? trans : str;
  }

  moment.lang( culture );

  next();

};
