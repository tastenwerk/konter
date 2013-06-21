(function(){
  
  var root = this;
  root.konter = root.konter || {};

  root.konter.users = root.konter.users || {};

  /**
   * show and render user details
   * form in container
   *
   * @param {String|Object} [uId] if a string, getJSON will call uId and load object
   *
   * @api public
   */
  root.konter.users.showDetails = function showUserDetails( uId ){

    if( typeof( uId ) === 'object' )
      _showDetails( uId );
    else
      konter.cache.get( '/users/'+uId+'.json', function( userJSON ){
        _showDetails( userJSON );
      });

  }

  function setUserGroups( e ){
    console.log('setusergroups');
  }

  function setUserRoles( e ){
    console.log('setusergroups');
  }

  /**
   * does the actual render work
   *
   * @api private
   */ 
  function _showDetails( user ){

    konter.requireTmpl( '/users/tmpls/details.html', function(){
      $('#content-wrapper').html( '<div class="user-details user-details-container default-content" data-bind="template: { name: \'user-details-tmpl\' }"></div>' );
      ko.applyBindings( user, $("#content-wrapper .user-details").get(0) );
      $('#select-user-groups').kendoMultiSelect({ change: setUserGroups }).data('kendoMultiSelect');
      $('#select-user-roles').kendoMultiSelect({ change: setUserRoles }).data("kendoMultiSelect");
    });

  }

}).call();