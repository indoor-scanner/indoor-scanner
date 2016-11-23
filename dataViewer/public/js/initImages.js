function initImages() {
  $('ul li a').click(function(event){
    event.preventDefault();

    var href =  $(this).children('img').attr('src');
    $('#overlay img').attr('src', href);

    var labels = ['Title: ', 'Date: ', 'Description: ', 'Views: '];

    for (var i = 0; i < classesToAdd.length; i++) {
      var newText = $(this).children('img').attr(classesToAdd[i]);
      newText = typeof (newText !== 'undefined') || (newText.replace('/\s/g', '').length > 0) ? (labels[i] + newText) : (labels[i] + 'None');
      $('.' + classesToAdd[i]).text(newText);
    }
    
    $overlay.addClass('show').removeClass('hidden');
    $overlay.velocity("transition.shrinkIn");
  });
};