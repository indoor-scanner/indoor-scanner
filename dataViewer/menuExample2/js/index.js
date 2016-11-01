//Javascript for adding and removing the css classes
$(".burger").on("click", function(e) {
  var pos = $(".main-content").position();
  var position = pos.left;
  if (position >= 240) {

    $(".side-menu").addClass("hide-menu");
    $(".side-menu h3").addClass("hide-menu");
    $(".main-content").addClass("hide-menu");
  } else {

    $(".side-menu").removeClass("hide-menu");
    $(".side-menu h3").removeClass("hide-menu");
    $(".main-content").removeClass("hide-menu");
  }

  $('.side-menu li').each(function(i) {
    var t = $(this);
    if (position >= 240) {
      setTimeout(function() {
        t.addClass('hide-menu');
      }, (i + 1) * 10);
    } else {
      setTimeout(function() {
        t.removeClass('hide-menu');
      }, (i + 1) * 30);
    }
  });

});