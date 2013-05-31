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
  , fs = require('fs')
  , logger = require( __dirname+'/logger' );

var views = module.exports = {};

views._views = [];

/**
 * add a directory to the views path
 *
 *
 * @api public
 */
views.add = function addView( pth ){
  if( !fs.existsSync( pth ) )
    logger.throwError('path', pth, 'does not exist');
  views._views.push( pth );
  logger.info( 'views path', pth, 'recognized');
}

/**
 * finds a corresponding view by parsing
 * through the _views list in the order specified
 *
 * @api public
 */
views.get = function getView( relPath ){
  var found;
  for( var i=0, pth; pth = this._views[i]; i++ ){
    var absPth = path.join( pth, relPath );
    if( fs.existsSync( absPth ) )
      return (found = absPth);
  }
  if( found ) return found;
  logger.throwError('could not find view', relPath, 'in none of the directories specified', this._views);
}