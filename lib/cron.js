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

var logger = require( __dirname+'/logger' )
var cron = module.exports = {};

cron.jobs = [];

/**
 * run cron jobs
 *
 * this command is meant to be run from command line 
 * (usually an automated cron-job-daemon).
 *
 * to register something to be run with this run,
 * register a function by pushing it to
 * the konter.cron.jobs array object
 *
 * @param {function( err )} [ callback ] - a callback function to be executed
 * after all jobs have been finished
 *
 * @example
 *     konter.cron.jobs.push( function myCronJob( done ){ // do something; done(); } );
 *
 * @api public
 */
cron.run = function runCronJobs( callback ){
  runNextCronJob( 0, callback );
}

function runNextCronJob( count, callback ){
  if( count >= cron.jobs.length )
    return callback( null );
  cron.jobs[ count ]( function( err ){
    if( err ){
      konter.logger.error('cron job', cron.jobs[count].name, 'failed!');
      return callback( err );
    }
    logger.info('cron job', cron.jobs[count].name, 'has been completed successfully!');
    runNextCronJob( ++count, callback );
  });
}