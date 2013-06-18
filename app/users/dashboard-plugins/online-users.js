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
  , async = require('async');

var konter = require( __dirname+'/../../../lib/konter' );

var plugin = module.exports = {};

plugin.name = 'Online Users';

plugin.tmplAbsPath = path.join( __dirname+'/online-users.jade' );

plugin.before = {};
plugin.before.render = function beforeRenderGetOnlineUsers( locals, done ){

  async.series([
    function( next ){
      konter.db.models.UserStat.find().gte('date', moment().subtract('d',7).toDate()).sort({ date: 1 }).exec( next );
    }
  ], function( err, results ){
      if( err ) konter.logger.error('trying to fetch online users', require('util').inspect(err));
      locals.onlineUserStat = results[0].map( function mapOnlineUsers( userstat ){ return [ userstat.date.getTime(), userstat.online.length ] } );
      locals.registeredUserStat = results[0].map( function mapRegisteredUsers( userstat ){ return [ userstat.date.getTime(), userstat.registered.length ] } );
      locals.totalUsers = results[0].map( function mapTotalUsers( userstat ){ return [userstat.date.getTime(), userstat.total ]} );
      done( locals );
  });
}

