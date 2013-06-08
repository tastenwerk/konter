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

var path = require('path');
var konter = require( __dirname+'/../../../lib/konter' );

var plugin = module.exports = {};

plugin.name = 'Online Users';

plugin.tmplAbsPath = path.join( __dirname+'/online-users.jade' );

plugin.before = {};
plugin.before.render = function( locals, done ){
  konter.db.models.User.find().gte('lastRequest.createdAt', moment().subtract('m',10).toDate()).exec( function( err, users ){
    if( err ) konter.logger.error('trying to fetch online users', require('util').inspect(err));
    locals.users = users || [];
    done( locals );
  })
}

