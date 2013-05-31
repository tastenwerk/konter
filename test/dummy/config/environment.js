/**
 * application config
 */

var konter = require( __dirname+'/../../../lib/konter' );

konter.config.port = 3000;

konter.config.log.level = 3;

konter.config.db.name = 'konter-test';

konter.config.site.title = 'konter test';