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

var path = require('path')
  , moment = require('moment')
var konter = require( __dirname+'/../../../lib/konter' );

var plugin = module.exports = {};

plugin.name = 'Online Users';

plugin.tmplAbsPath = path.join( __dirname+'/online-users.jade' );

plugin.before = {};
plugin.before.render = function beforeRenderGetOnlineUsers( locals, done ){
  konter.db.models.UserStat.find().gte('date', moment().subtract('d',7).toDate()).sort({ date: 1 }).exec( function( err, userstats ){
    if( err ) konter.logger.error('trying to fetch online users', require('util').inspect(err));
    locals.onlineUserStat = userstats.map( function mapOnlineUsers( userstat ){ return [ moment(userstat.date).toDate(), userstat.online ] } );
    locals.registeredUserStat = userstats.map( function mapRegisteredUsers( userstat ){ return [ moment(userstat.date).toDate().getTime(), userstat.registered ] } );
    console.log(locals.onlineUserStat);
    done( locals );
  })
}

