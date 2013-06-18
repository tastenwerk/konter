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
  
  konter.db.models.User.findById( req.params.id, function( err, user ){
    if( err ) konter.log.error('when trying to fetch user from database', err );
    req.user = res.locals.user = user;
    next();
  });

}