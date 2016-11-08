$("#nav").hover(function() {
  $("#container").toggleClass('menu-push-toright');
  $("#nav").toggleClass('menu-open');
});
$("#nav a").click(function() {
  $("#nav a").removeClass('active');
  $(this).addClass('active');
});
