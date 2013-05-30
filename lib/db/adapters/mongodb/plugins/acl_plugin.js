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

var mongoose = require('mongoose');
 
var logger = require( __dirname+'/../../../../logger' );

var ACLPlugin = module.exports = function ACLPlugin( schema, options ){

  schema.method('share', function( user, privileges, callback ){
    var self = this;
    if( !(user instanceof mongoose.models.User ) && !(user instanceof mongoose.models.Group ) )
      logger.throwError('given object is not a valid user or group');
    // don't add same document to acl twice
    var found = false;
    if( user.acl && user.acl instanceof Array && user.acl.length > 0 )
      user.acl.forEach( function( acl ){
        if( acl.documentId && self._id && acl.documentId.toString() === self._id.toString() )
          found = true;
      });
    var aclEntry = { documentId: this._id, documentType: this._type, _createdBy: this.holder, _createdAt: (new Date()), privileges: privileges }
    if( !found )
      user.acl.push( aclEntry );
    if( typeof( callback ) === 'function' )
      return user.save( callback );
    this._modifiedUsers = this._modifiedUsers || [];
    this._modifiedUsers.push( user );
  });

}