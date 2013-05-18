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

var WikiPlugin = function WikiPlugin( schema, options ){

  schema.add({
    revisions: { type: mongoose.Schema.Types.Mixed, default: { master: { content: '' } } },
    activeRevision: { type: String, default: 'master' },
    lang: String
  });

  schema.method('setContent', function setWikiContent( revision, content ){
    if( arguments.length < 2 ){
      content = revision;
      revision = 'master';
    }
    this.revisions[revision].content = content;
    this.markModified('revisions');
  });

  schema.virtual('content').get(function(){
    return this.revisions[this.activeRevision].content;
  });

}

module.exports = exports = WikiPlugin;