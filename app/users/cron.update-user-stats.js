/**
 * konter
 *
 * a web solid small web framework basement
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */
 
var moment = require('moment');

var konter = require( __dirname+'/../../lib/konter' );

/**
 * cronJob to update
 * userstats database collection
 *
 * it can be quite helpful if you provide a memorizable function name
 * it will be used in the konter.logger logs
 *
 * @api private
 */
var cronJob = module.exports = function updateUserStats( done ){
  var conditions = {
    $and: [ 
      { date: { $gte: moment().subtract('h',24).startOf('day').toDate() } },
      { date: { $lte: moment().startOf('day').toDate() } }
    ]
  }
  konter.db.models.UserStat.findOne(conditions, function( err, userStat ){
    if( err ) return done( err );
    if( userStat ) return done( null );
    
    var usersOnline, usersRegistered;

    conditions = {
      'lastRequest.createdAt': { $gte: moment().subtract('h', 24).startOf('day').toDate() }
    };

    konter.db.models.User.find( conditions, function( err, users ){
      if( err ) return done( err );
      usersOnline = users;

      conditions = {
        _createdAt: { $gte: moment().subtract('h', 24).startOf('day').toDate() }
      };

      konter.db.models.User.find( conditions, function( err, users ){
        if( err ) return done( err );
        usersRegistered = users;

        konter.db.models.UserStat.create({ date: moment().subtract('d',1).startOf('day').toDate(),
                                           online: usersOnline,
                                           registered: usersRegistered }, done );
      });
    });

  });

}