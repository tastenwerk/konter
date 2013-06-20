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

var usersPlugin = module.exports = {};

/**
 * get a user by it's id
 *
 * generates: res.locals.user
 * or
 * nothing
 *
 * reports error to konter.log
 */
usersPlugin.getById = function getUserById( req, res, next ){
  
  konter.db.models.User.findById( req.params.id ).populate('groups').exec( function( err, user ){
    if( err ) konter.log.error('when trying to fetch user from database', err );
    if( user ){
      user.groupIds = user.groups.map( function(group){ return group._id.toString() } );
      req.user = res.locals.user = user;
    }
    next();
  });

}