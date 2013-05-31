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
( function(){

  this.kendo.data.binders.css = this.kendo.data.Binder.extend( {
    refresh: function() {
      if( this.bindings.css ){
        var path = this.bindings.css.path;
        for( var i in path ){
          if( path[i] in this.bindings.css.source ){
            var res = this.bindings.css.source[path[i]];
            if( typeof(res) === 'function' )
              res = res();
            if( res )
              $(this.element).addClass(i);
            else
              $(this.element).removeClass(i);
          } else{
            console.log('error:', path[i], 'is not defined for', this.bindings.css.source );
            throw new Error(path[i]+' is not defined');
          }
        }
      }

    }
  });

})();