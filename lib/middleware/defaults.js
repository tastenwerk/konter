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
 
var config = require( __dirname+'/../config' );

var defaultsMiddleware = module.exports = function( req, res, next ){

  res.locals.konter = res.locals.konter || {};

  res.locals.konter.config = config;

  next();

};