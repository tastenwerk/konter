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

var mongoose = require('mongoose');

var db = require( __dirname+'/../../../../db' );

/**
 * the Tree Plugin enables the following features:
 *
 * * hierarchical organisation of documents
 * * documents can be stored in multiple other documents (redundant tree)
 * * creates a new collection where ids and paths are stored (redundantly)
 *
 */
var TreePlugin = module.exports = function TreePlugin( schema, options ){

  schema.add({
    path: String,
    pos: Number
  });

  schema.virtual('absPath').get( function(){
    var abs = this.path || '';
    return abs + '/' + this._type + ':' + this._id;
  });

}
