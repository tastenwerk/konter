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
 
var mongoose = require( 'mongoose' );

var logger = require( __dirname+'/../../../logger' );

var sortArray = function sortArray( arr, sortOptions ){
  var sort;
  if( typeof(sortOptions) === 'undefined' || !sortOptions )
    sort = {name: 'asc'};
  else if( sortOptions instanceof String )
    sortOptions.split(' ').forEach( function(so){
      if( so.substring(0,1) === '-' )
        sort[so] = 'desc';
      else
        sort[so] = 'asc';
    })
  else
    sort = sortOptions;
  arr.sort( function( a, b ){
    for( var i in sort )
      if( ( a[i] && b[i] && a[i] < b[i] ) || !a[i] && b[i] )
        return ( sort[i] === 'asc' ? -1 : 1 );
      else if( ( a[i] && b[i] && a[i] > b[i] ) || a[i] && !b[i] )
        return ( sort[i] === 'asc' ? 1 : -1 );
      else
        return 0;
  });
  var a = []
  for( var i in arr )
    a.push( arr[i].name + ':' + arr[i].pos );
  return arr;
};

var mongodbAdapter = module.exports = {

  connect: function( options ){
    var connection = mongoose.connect( 'mongodb://'+options.host+':'+options.port+'/'+options.name ); //mongoose.createConnection( options.host, options.name, options.port );
    if( logger.getLevel() > 2 )
      mongoose.set('debug', true);
    logger.info('connection established to', options.adapter+'://'+options.host+':'+options.port+'/'+options.name);
    return connection;
  },

  disconnect: function( callback ){
    return mongoose.disconnect( callback );
  },

  Schema: mongoose.Schema,

  ObjectId: mongoose.Types.ObjectId,

  models: mongoose.models,

  model: function(){
    return mongoose.model.apply( mongoose, Array.prototype.slice.call(arguments) )
  },

  firstAnyWithUser: function( user, query, options, callback ){

    this.findAnyWithUser( user, query, options, function( err, res ){

      if( typeof( callback ) === 'undefined' ){
        if( typeof( options ) === 'undefined' )
          callback = query;
        else
          callback = options;
        options = null;
      }

      if( err )
        callback( err );
      else if( res.length > 0 )
        callback( null, res[0]);
      else
        callback( null, null );
    });
  },

  findAnyByIdWithUser: function( user, id, callback ){
    var count = 0;

    function findInNextModel(){
      if( Object.keys(mongoose.models).length > count )
        mongoose.model( Object.keys(mongoose.models)[count++] ).findById( id, function( err, doc ){
          if( err )
            return callback( err );
          if( doc ){
            doc.holder = user;
            return callback( null, doc );
          }
          findInNextModel();
        });
      else
        callback( null, null );
    }

    findInNextModel();

  },

  findAnyWithUser: function(user, query, options, callback ){

    var count = 0
      , childrenArr = []
      , self = this
      , resultsArr = []
      , childrenCount = 0
      , models = mongoose.models
      , collectionsLength = Object.keys(models).length;


    function runInitChild(){
      var item = childrenArr[childrenCount++];
      models[item._type].findById( item._id ).execWithUser( user, function( err, child ){
        if( child ){
          child.holder = user;
          resultsArr.push( child );
        }
        if( childrenCount < childrenArr.length )
          runInitChild();
        else
          callback( null, sortArray( resultsArr, options && options.sort ) );
      })
    }

    function runCallback(){
      if( ++count === collectionsLength )
        if( childrenArr.length > 0 )
          runInitChild();
        else
          callback( null, [] );
    }

    if( typeof( callback ) === 'undefined' ){
      if( typeof( options ) === 'undefined' )
        callback = query;
      else
        callback = options;
      options = null;
    }

    // setup query
    var q = {};
    if( query )
      for( var i in query )
        q[i] = query[i];

    for( var i in mongoose.connection.collections ){
      mongoose.connection.collections[i].find(q, function( err, cursor ){
        if( err ){
          callback( err );
          return;
        } else{
          cursor.toArray(function(err, items) {
            if( err ){
              callback( err );
              return;
            }
            items.forEach( function( item ){
              if( item._type )
                childrenArr.push( item );
            });
            runCallback();
          });
        }
      });
    }

  },

  /**
   * find a document in all known collections
   *
   * @returns a valid mongoose query object which can be used
   * to fill it with additional queries as usual, but the exec
   * function is overridden and will call the actual exec function
   * on every defined model collection
   *
   * @api public
   */  
  findAny: function findAny(conditions, fields, options, callback){

    if ( typeof(conditions) === 'function' ) {
      callback = conditions;
      conditions = {};
      fields = null;
      options = null;
    } else if ( typeof(fields) === 'function' ) {
      callback = fields;
      fields = null;
      options = null;
    } else if ( typeof(options) === 'function' ) {
      callback = options;
      options = null;
    }
    var query = new mongoose.Query( conditions, options );
    query.exec = function(){ _execNextCollection( 0, [], query, callback ); }

    if ('undefined' === typeof callback)
      return query;

    this._applyNamedScope(query);
    return query.find(callback);

  }

};

/**
 * execWithUser
 *
 * execute a query with given user
 *
 * @param {User|String} - a User object or a string (will be understood as public)
 *
 * @param {Object} - an options object containing the user object from above
 *
 *
 * @example
 *
 * MyDocument.where({}).execWithUser( myUser, function( err, mydoc ){
 *  // do something with mydoc
 * });
 *
 * MyDocument.findById(myDocId).sort('createdAt').execWithUser( { holder: myUser, trashed: true }, function( err, mydoc ){
 *  // do something with mydoc
 * });
 */ 
mongoose.Query.prototype.execWithUser = function execWithUser( user, callback ){
  this.exec( function( err, doc ){
    if( err )
      return callback( err );
    else if( !doc )
      return callback( null, null );

    if( doc instanceof Array ){
      var res = [];
      doc.forEach( function(d){ 
        if( canAccessDoc( d, user )){
          d.holder = user;
          res.push( d );
        }
      });
      callback( null, res );
    } else{
      if( canAccessDoc(doc, user) )
        doc.holder = user;
      else
        doc = null;
      callback( null, doc );
    }
  });
};

/**
 * check if given document is in user's ACL
 *
 * @param {Object} doc - the document
 * @param {User} user - the user object
 *
 * @api private
 */
function canAccessDoc( doc, user ){
  if( doc._createdBy ){
    if( doc._createdBy._id ){
      if( doc._createdBy._id.toString() === user._id.toString() )
        return true;
    } else{
      if( doc._createdBy.toString() === user._id.toString() )
        return true;
    }
  }
  var paths = doc.paths || [];
  paths = paths.concat(doc._type+':'+doc._id.toString());
  for( var key in user.acl ){
    if( doc._id.toString() === key ) return true;
    var allow = false;
    paths.forEach( function( pth ){
      if( pth.indexOf( key ) >= 0 )
        allow = true;
    });
    if( allow ) return true;
  }
  if( user.groups && user.groups.length > 0 && user.groups[0] instanceof mongoose.models.Group )
    for( var i in user.groups )
      if( canAccessDoc( doc, user.groups[i] ) )
        return true;  
  return false;
}


/**
 * execute next collection with given query
 * and fill res object
 * if finished, callback will be initiated
 *
 * @api private
 */
function _execNextCollection( count, res, query, callback ){
  if( count >= mongoose.models.length )
    return callback( null, res );
  var q = mongoose.models[ Object.keys(mongoose.models)[count] ].find();
  for( var i in query )
    if( i !== 'exec' )
      q[i] = query[i];
  q.exec( function( err, _res ){
    if( err ) return callback( err );
    _execNextCollection( ++count, res.concat( _res ), query, callback );
  });
}
