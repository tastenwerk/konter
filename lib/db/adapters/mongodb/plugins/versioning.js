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

/**
 * a version schema defines
 * holds a copy of this document and additional information
 */
var VersionSchema = new mongoose.Schema({
  _createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed },
  comment: String,
  revision: { type: Number },
  current: { type: Boolean, default: false }
});


var VersioningPlugin = function VersioningPlugin( schema, options ){

  schema.add({
    versions: [VersionSchema],
    deletedAt: { type: Date, default: null },
    _deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date }
  });

  /**
   * trash a document
   *
   * mark the document deleted
   * with the mine operator
   * it won't show up in the results any more
   *
   * @param {function(callback)} [optional] if passed, save operation will be performend
   * and callback passed to it.
   *
   * can only be found with the trashed operator
   */
  schema.method('trash', function( callback ){
    this.deletedAt = new Date();
    if( typeof(callback) === 'function' )
      this.save( callback );
    this._deletedBy = this._holder || null;
  });

  /**
   * restore a document
   *
   * removes 'deletedAt' switch from document
   *
   * @param {function(callback)} [optional] if passed, save operation will be performend
   * and callback passed to it.
   *
   */
  schema.method('restore', function( callback ){
    this.deletedAt = null;
    if( typeof( callback ) === 'function' )
      this.save( callback );
  });

  /**
   * set version attributes
   *
   * @param {Array} [attrs] - a list of attributes to be considered
   * for versioning
   */
  schema.statics.setVersionAttrs = function setVersionAttrs( attrs ){
    this.versionAttrs = attrs;
  }

  /**
   * create a new version
   *
   * @param {Object} [options] - available options are:
   * * comment: {String} - a comment to be stored with this version
   *
   *
   */
  schema.method('createVersion', function( options ){

    options = options || {};

    var revision = 0;

    if( this.versions.length > 0 ){
      var sortedVersions = this.versions.reverse().sort(function(a,b){
        if( a.revision < b.revision )
          return 1;
        if( a.revision > b.revision )
          return -1;
        return 0;
      });

      revision = sortedVersions[0].revision+1;
    }

    var version = { _createdBy: this._holder || null,
                    data: {},
                    comment: options.comment || null,
                    revision: revision };

    if( !this.constructor.versionAttrs )
      throw new Error('no versionAttrs defined. Please define for your model using Model.setVersionAttrs({ your: attrs }); ');

    for( var i=0,attr;attr=this.constructor.versionAttrs[i];i++ )
      version.data[attr] = this[attr];

    this.versions.push( version );
    this.markModified('versions');

  });

  /**
   * restores a version
   *
   * @param {Number} [idx] - index of version to be restored
   * @param {Object} [object] - the object
   *
   */
  schema.method('switchVersion', function( idx, options ){
    options = options || {};

    var rev
      , current;

    for( var i in this.versions ){
      if( this.versions[i].revision === idx )
        rev = this.versions[i];
      if( this.versions[i].current )
        current = this.versions[i];
    }

    if( !current || options.saveCurrent )
      this.createVersion();

    if( rev ){

      if( current ) current.current = false;
      rev.current = true;
      for( var i in rev.data )
        this[i] = rev.data[i] || null;

    }

    return rev;

  });

  /**
   * deletes a version
   *
   * @param {Number} [idx] - index of version to be restored
   *
   * @returns {Version} - returns deleted version
   *
   */
  schema.method('deleteVersion', function( idx ){

    var actualIndex
      , rev;

    for( var i in this.versions )
      if( this.versions[i].revision === idx ){
        rev = this.versions[i];
        actualIndex = i;
      }

    if( rev )
      this.versions.splice( actualIndex, 1 );

    return rev;

  });
}

module.exports = exports = VersioningPlugin;