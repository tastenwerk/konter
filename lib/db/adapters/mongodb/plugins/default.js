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

var DefaultPlugin = function DefaultPlugin( schema, options ){

  schema.add({ 
    name: { type: String, required: true, index: true },
    pos: { type: Number },
    _type: String,
    _subtype: { type: String, index: true },
    properties: { type: db.Schema.Types.Mixed, default: { p: 0 } },
    createdAt: { type: Date, default: Date.now },
    _createdBy: { type: db.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date },
    _updatedBy: { type: db.Schema.Types.ObjectId, ref: 'User' }
  });

  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });

  schema.pre('save', function( next ){
    if( !this._holder )
      return next();
    if( this.isNew )
      this._createdBy = this._holder;
    this._updatedBy = this._holder;
    this.updatedAt = new Date();
    next();
  });


}

module.exports = exports = DefaultPlugin;