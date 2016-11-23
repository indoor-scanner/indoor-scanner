position=0;
var interval = setInterval(function () {
position -= 1;
$(".image-view").css({ "background-position":+ position +"px 0px" }) },50 );

var $overlay = $('<div id="overlay"></div>');
var $image = $('<img>');

var classesToAdd = ['title', 'date', 'imgDes', 'views'];

for (var i = 0; i < classesToAdd.length; i++) {
  var $para = $('<p class="' + classesToAdd[i] + '"></p>');
  $overlay.append($para);
  $overlay.append('<br></br>');
};

$overlay.append($image);
$('body').append($overlay);

$overlay.click(function(){
  $(this).removeClass('show').addClass('hidden')
  $overlay.velocity("transition.shrinkOut");                 
});