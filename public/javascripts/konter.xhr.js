$(document).ready( function(){

  /**
   * forms are submitted by serializing their
   * form fields and attaching
   * the konter._csrf hash
   *
   */
  $(document).on('submit', '.xhr-form', function(e){
    e.preventDefault();
    var data = $(this).serializeArray();
    $.ajax({ url: $(this).attr('action'),
            data: data,
            dataType: $(this).attr('data-type') || 'script',
            type: $(this).attr('method') || 'POST'
    });
  /**
   * links are submitted with the konter._csrf
   * has if their method is different than 'get'
   * or not present
   */
  }).on('click', '.xhr-link', function(e){
    e.preventDefault();
    if( $(this).attr('data-method') && $(this).attr('data-method').toLowerCase() !== 'get' ){
      if( $(this).attr('data-confirm') ){
        if( !confirm( $(this).attr('data-confirm') ) )
          return false;
      }
      $.ajax({ url: $(this).attr('href'),
               data: { _csrf: ioco._csrf },
               type: $(this).attr('data-method'),
               dataType: 'script' });

    } else
      $.getScript( $(this).attr('href') );
  });

});