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
 
var fs = require('fs')
  , path = require('path')
  , logger = require( __dirname+'/logger' )
  , views = require( __dirname+'/views' )
  , Globalize = require('globalize')
  , config = require( __dirname+'/config' );
  
require(__dirname+'/../node_modules/globalize/lib/cultures/globalize.cultures.js');

var router = module.exports = {};

var app
  , socket;

router.Definition = function(){}

/**
 * use given module, absPath or filename in apps directory
 * as the next route
 *
 * @param {String} [filename] - the module name (valid for require), an absolute path
 * or a filename/filename_routes.js file inside the app/ directory
 *
 * @example
 *
 *     router.use( 'konter' )
 *     => defines the konter modules to be used. The required module needs to have
 *        a routes property which is treated as a function which can be called with
 *        app, socket
 *
 *     router.use( 'blogs' )
 *     => a blogs_routes.js file is exptected in app/blogs directory. The file should
 *        consist of a function taking app, socket as two arguments
 *
 * @api public
 */
router.use = function( filename ){

  if( filename === 'konter' )
    return setupKonterRoutes();
  try{
    var mod = require(filename);
    logger.warn('not implemented to init an external module');
  } catch(e){

    // if error is different from module not fond, throw it
    if( e.code !== 'MODULE_NOT_FOUND' )
      throw e;

    var orig = filename;

    if( !fs.existsSync( filename ) )
      filename = path.join( process.cwd(), config.appsDir, filename );

    if( fs.existsSync( path.join(filename,'index.js') ) ){
      require( filename )( app, socket );
      logger.info( 'route', path.basename(filename.replace(path.extname(filename),'')), 'initialized.');
    }

    var viewsPath = path.join( process.cwd(), config.appsDir, orig, 'views' );
    if( fs.existsSync( viewsPath ) )
      views.add( viewsPath );

    var culturesPath = path.join( process.cwd(), config.appsDir, orig, 'cultures' );
    if( fs.existsSync( culturesPath ) ){
      fs.readdirSync( culturesPath ).forEach( function( culture ){
        Globalize.addCulture( culture.replace('.js',''), require( path.join( culturesPath, culture ) ) );
      });
    }

  }
}

/**
 * setup the routes
 *
 * parses the application's config/routes.js file and loads
 * routes in given order
 *
 * @api private
 */
router.setupRoutes = function setupRoutes( _app, _socket ){

  app = _app;
  socket = _socket;

  var configRoutes = require( path.join( process.cwd(), config.appsDir, '..', 'config', 'routes' ) );
  configRoutes( this );

  // by default add app/views path
  // to default views
  views.add( path.join( process.cwd(), config.appsDir, 'views' ) );

}

/**
 * setup a default error handler
 *
 * the error message can be overridden by adding
 * a app/errors/views/errors/404|500|403.jade page
 *
 * @api private
 */
router.setupErrorHandler = function setupErrorHandler(){

  app.use(function(err, req, res, next){

    logger.error(err.stack);
    if (req.xhr) {
      res.send(500, { error: err });
    } else {
      res.render( views.get('errors/500.jade'), { error: err } );
    }
  });

}

/**
 * setup konter default routes
 *
 * @api private
 *
 */
function setupKonterRoutes(){
  var konterAppsDir = __dirname + '/../app';
  fs.readdirSync( konterAppsDir ).forEach( function( entry ){

    // require models
    var modelsDir = path.join( konterAppsDir, entry, 'models' );
    if( fs.existsSync( modelsDir ) )
      fs.readdirSync( modelsDir ).forEach( function( model ){
        require( path.join( modelsDir, model ) );
      });
    
    // setup actual routes
    if( fs.existsSync( path.join(konterAppsDir, entry, 'index.js') ) ){
      require( path.join(konterAppsDir, entry ) )( app, socket );
      logger.info( 'konter [intern] route\x1b[32m', entry, '\x1b[0minitialized.');
    }

    // setup cultures
    var culturesPath = path.join( konterAppsDir, entry, 'cultures' );
    if( fs.existsSync( culturesPath ) ){
      fs.readdirSync( culturesPath ).forEach( function( culture ){
        Globalize.addCultureInfo( culture.replace('.js',''), require( path.join( culturesPath, culture ) ) );
        logger.info( 'konter [intern] route\x1b[32m', entry, '\x1b[0mculture', culture.replace('.js',''), 'added' );
      });
    }

  });

  views.add( path.join( konterAppsDir, 'views' ) );

}