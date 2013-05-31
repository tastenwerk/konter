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

var config = require( __dirname+'/../config' );

var defaultsMiddleware = module.exports = function( req, res, next ){

  res.locals.konter = res.locals.konter || {};

  res.locals.konter.config = config;

  res.locals.moment = req.moment = moment;
  res.locals._csrf = req.session._csrf;
  res.locals._honeypot_csrf = require('crypto').createHash('sha1').update('ioco-honeypot').digest('hex');

  next();

};