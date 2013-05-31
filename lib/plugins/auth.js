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
var auth = module.exports = {};

auth.check = function( req, res, next ){
  console.log('auth middle');
  next();
}