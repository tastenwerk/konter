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

var DefaultPlugin = module.exports = function DefaultPlugin( schema, options ){

  schema.add({ 
    _type: String,
    name: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    _createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    updatedAt: { type: Date },
    _updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
  });

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  /**
   * update creator and updater if
   * holder is given
   * if not only dates will be updated
   *
   * @api private
   */
  schema.pre('save', function( next ){
    this.updatedAt = new Date();
    if( !this._holder )
      return next();
    if( this.isNew )
      this._createdBy = this._holder;
    this._updatedBy = this._holder;
    next();
  });

  /**
   * holder of this content object
   * there should never be an access to the
   * database without filling this virtual property
   *
   * @returns {User} - the holder user object
   *
   */
  schema.virtual('holder').get( function(){
    return this._holder;
  });

  /**
   * set the holder of this content object.
   *
   * @param {User} - the user object to be holding this
   * content object
   */
  schema.virtual('holder').set( function( holder ){
    this._holder = holder;
  });
  /**
   * save the modelname along with the database
   *
   * @api private
   */
  schema.pre('save', function setupModelName( next ){
    if( this.isNew )
      this._type = this.constructor.modelName;
    next();
  });

}