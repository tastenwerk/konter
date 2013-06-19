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

var groupsPlugin = module.exports = {};

/**
 * get a user by it's id
 *
 * generates: res.locals.groups
 * or
 * nothing
 *
 * reports error to konter.log
 */
groupsPlugin.getAll = function getUserById( req, res, next ){
  
  konter.db.models.Group.find().exec( function( err, groups ){
    if( err ) konter.log.error('when trying to fetch user from database', err );
    if( groups )
      req.groups = res.locals.groups = groups;
    next();
  });

}