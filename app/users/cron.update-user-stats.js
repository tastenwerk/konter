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
 
var async = require('async')
  , moment = require('moment');

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

  async.series([

    function getOnlineUsers( next ){
      var conditions = {
        'lastRequest.createdAt': { $gte: moment().subtract('h', 24).startOf('day').toDate() }
      };
      konter.db.models.User.find( conditions, next );
    },

    function getRegisteredUsers( next ){
      var conditions = {
        _createdAt: { $gte: moment().subtract('h', 24).startOf('day').toDate() }
      };
      konter.db.models.User.find( conditions, next );
    },

    function getTotalUsers( next ){
      konter.db.models.User.count( next );
    },

    function checkDuplicateStatsEntry( next ){
      var conditions = {
        $and: [
          { date: { $gte: moment().subtract('h',24).startOf('day').toDate() } },
          { date: { $lte: moment().startOf('day').toDate() } }
        ]
      }
      konter.db.models.UserStat.findOne(conditions, next );

    }
  ],

  function completeAsyncSeries( err, results ){
    if( err ) konter.logger.throwError('could not complete cronjob userstats', require('util').inspect( err ) );
    var usersOnline = results[0]
      , usersRegistered = results[1]
      , usersTotal = results[2];

    if( results[3] )
      return konter.logger.info('skipping creation. Entry already exists');

    konter.db.models.UserStat.create({
      date: moment().subtract('d',1).startOf('day').toDate(),
      online: usersOnline,
      registered: usersRegistered,
      total: usersTotal
    }, done );

  });

}