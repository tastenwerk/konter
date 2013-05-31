/**
 * konter.core.js
 *
 * main features and wrappers for the konter eco system
 *
 * (c) TASTENWERK 2013
 *
 * web: http://konterjs.org
 *
 */
( function(){


  /**
   * draw a nice windows like loader
   */
  var loader = '<div class="loader"><div class="circle" /><div class="circle" /><div class="circle" /><div class="circle" /><div class="circle" /></div>';

  var _required = [];

  // used for global datasources namespace (knockoutjs or kendoui datasources for example)
  var sources = {};

  /**
   * log a string to the console
   *
   * Examples:
   *
   *     konter.log('error', 'something has gone wrong');
   *
   *
   * @param {String} - code: e.g.: 'error' (optional)
   * @param {String} - message
   * @api public
   */
  function logger( message ){
    var args = Array.prototype.slice.call(arguments);
    try{
      console.log.apply( this, ['[konter]'+ args );
    } catch(e){ alert('logging not supported')}

  }

  /**
   * add a notification message to the
   * notification system
   */
  function notify( msg, type ){
    if( typeof(msg) === 'object' ){
      if( msg.error && msg.error instanceof Array && msg.error.length > 0 )
        msg.error.forEach( function( err ){
          konter.notify( err, 'error' );
        });
      if( msg.notice && msg.notice instanceof Array && msg.notice.length > 0 )
        msg.notice.forEach( function( notice ){
          konter.notify( notice );
        });
      return;
    }

    if( typeof(msg) === 'undefined' || msg.length < 1 )
      return;


    konter.logger.info('notifcation not implemented yet');
  };

  
  /**
  * adds a blocking modal box to the whole
  * screen
  *
  * @param {String} [html] the html string to be rendered to this modal
  * also, action strings are valid:
  *
  * @param {Object} [options] options are:
  * * height: desired height of modal window
  * * before: callback function, before modal will be shown
  * * completed: callback function, after modal has been shown and is visible
  * * html: the html content (optional can be passed as first argument)
  * * $content: a dom object to be appended
  *
  * to the user.
  * * url: remote url, if this modal should be loaded from url
  * * on:
  *   new callback function. specify exact action by parsing the parameter
  *   on('close', function( $modal ) )
  *
  * @param {Function} [callback] the callback that should be triggered
  * after modal has been rendered.
  *
  * @example
  * konter.modal('close')
  * closes the modal.
  */
  function modal( html, options ){

    function closeModal(){
      if( options && typeof(options.on) === 'function' )
        options.on('close', $('#konter-modal') );
      $('.konter-modal').fadeOut(300);
      setTimeout( function(){
        $('.konter-modal').remove();
      }, 300);
      $(window).off( 'resize', checkModalHeight );
    }

    function checkModalHeight(){
      if( $('#konter-modal').height() > $(window).height() - 40 )
        $('#konter-modal').animate({ height: $(window).height() - 40 }, 200);
      else
        $('#konter-modal').animate({ height: $('#konter-modal').data('origHeight') }, 200);
    }

    function setupModalActions(){
      if( $('#konter-modal .modal-sidebar').length > 0 ){
        $('#konter-modal .modal-sidebar > .sidebar-nav li').on('click', function(){
          $(this).closest('ul').find('.active').removeClass('active');
          $('#konter-modal .sidebar-content > div').hide();
          $($('#konter-modal .sidebar-content > div')[$(this).index()]).show();
          $(this).addClass('active');
        }).first().click();
      }
      if( options && options.completed && typeof(options.completed) === 'function' )
        setTimeout(function(){ options.completed( $('#konter-modal') ); }, 500 );
    }

    if( html === 'close' )
      return closeModal();
    else if( typeof(html) === 'object' ){
      options = html;
      html = null;
    }

    $('.konter-modal').remove();
    $('body').append('<div id="konter-modal-overlay" class="konter-modal"/>')
      .append('<div id="konter-modal" class="konter-modal"><div class="modal-inner-wrapper" /></div>');
    var closeModalBtn = $('<a class="close-icn">&times;</a>');
    $('#konter-modal').prepend(closeModalBtn);
    if( options.windowControls ){
      var countWinCtrlBtns = 1;
      for( ctrl in options.windowControls ){
        var winCtrlBtn = $('<a winCtrl="'+ctrl+'" class="modal-win-ctrl live-tipsy" href="#" original-title="'+options.windowControls[ctrl].title+'"><span class="icn '+options.windowControls[ctrl].icn+'" /></a>');
        winCtrlBtn.css( { right: 16*(countWinCtrlBtns++)+32 } );
        $('#konter-modal').prepend(winCtrlBtn);
        winCtrlBtn.on('click', function(e){
          e.preventDefault();
          options.windowControls[$(this).attr('winCtrl')].callback( $('#konter-modal') );
        })
      }
    }
    closeModalBtn.on('click', closeModal);
    $('#konter-modal-overlay').fadeIn(200).on('click', closeModal);
    if( options && options.title )
      $('#konter-modal').prepend('<span class="modal-title">'+options.title+'</span>');


    // height configuration
    if( options && options.height && typeof(options.height) === 'number' )
      $('#konter-modal').css( 'height', options.height );
    $('#konter-modal').data('origHeight', $('#konter-modal').height());

    checkModalHeight();
    $(window).on( 'resize', checkModalHeight );

    if( options.url ){
      $('#konter-modal .modal-inner-wrapper').load( options.url, function(){
        if( options && options.before && typeof(options.before) === 'function' )
          options.before( $('#konter-modal') );
        $('#konter-modal').fadeIn( 200 );
        setupModalActions();
      });
    } else {
      html = html || options.data || options.html;
      if( options.$content )
        $('#konter-modal .modal-inner-wrapper').append( options.$content );
      else if( html )
        $('#konter-modal .modal-inner-wrapper').html( html ).fadeIn(200);

      if( options && options.before && typeof(options.before) === 'function' )
        options.before( $('#konter-modal') );
      setupModalActions();
    }

  };


  var root = this; // window of browser

  if( !root.konter || typeof( root.konter ) !== 'object' )
    root.konter = {};
  root.konter.notify = notify;
  root.konter.loaderHtml = loader;
  root.konter.require = require;
  root.konter.sources = sources;
  root.konter.logger = {};
  root.konter.logger.info = logger;
  root.konter.modal = modal;

  $(document).ready(function(){
    root.konter._csrf = $('#_csrf').val();
  });

})();

// Avoid "console" errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
      method = methods[length];

      // Only stub undefined methods.
      if (!console[method]) {
          console[method] = noop;
      }
    }
}());