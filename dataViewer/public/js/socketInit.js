var socket = io.connect('http://localhost:8000');

var loaded = 0;
var locationText = '';

initSocket();
getLocation();
function initSocket() {
  socket.on('addImage', addImage);
  socket.on('addLurkButton', addLurkButton);

  socket.on('sauronStart', function() {
    disableLurk();
    var loadingText = [
      'Accessing Sauron Api :....',
      'Accessing Sauron Api .:...',
      'Accessing Sauron Api ..:..',
      'Accessing Sauron Api ...:.',
      'Accessing Sauron Api ....:'
    ];
    textRecursion(loadingText, 0);
  });

  socket.on('sauronEnd', function () {
    loaded = 1;
  });

  socket.on('googleStart', function() {
    var loadingText = [
      'Getting Location Via Google Maps :....',
      'Getting Location Via Google Maps .:...',
      'Getting Location Via Google Maps ..:..',
      'Getting Location Via Google Maps ...:.',
      'Getting Location Via Google Maps ....:'
    ];
    textRecursion(loadingText, 0);
  });

  socket.on('googleEnd', function() {
    loaded = 1;
  });

  socket.on('imagesLoaded', function (headerText) {
    document.querySelector('h1').innerText = headerText;
  });

  socket.on('noImages', function (headerText) {
    document.querySelector('h1').innerText = 'No Images Available';
  });

  socket.on('errorMsg', function (errorMsg) {
    loaded = 1;
    setTimeout(function() {
      document.querySelector('h1').innerText = errorMsg;
      loaded = 0;
    }, 500);
  });

  // allows the lurk button to be clicked
  socket.on('end', enableLurk);
};

function addImage(imageHtml) {
  var ul = document.querySelector('#image-list');
  ul.innerHTML += imageHtml;
  initImages();
};

function addLurkButton(buttonHtml) {
  document.body.innerHTML += buttonHtml;
};

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var coords = {
       latitude: position.coords.latitude,
       longitude: position.coords.longitude,
      };
      socket.emit('geo', coords);
    });
  } 
  else {
    alert("Geolocation is not supported by this browser.");
  }
};

function textRecursion(textArr, index) {
var header = document.querySelector('h1');
  if (index >= textArr.length) {
    index = 0;
  }

  if (!loaded) {
    setTimeout(function() {
      header.innerText = textArr[index];
      textRecursion(textArr, index + 1);
    }, 250);
  }
  else {
    loaded = 0;
    return 0;  
  }
};

function enableLurk() {
  var lurkButton = document.querySelector('a img#lurk-button');
  lurkButton.onclick = random;
};

function disableLurk() {
  var lurkButton = document.querySelector('a img#lurk-button');
  lurkButton.onclick = 'false';
};

function random() {
  disableLurk();
  var images = document.querySelectorAll('li');
  for (var i = 0; i < images.length; i++) {
    images[i].remove();
  }
  var coords = {
    latitude: getRandomInRange(-90, 90, 4),
    longitude: getRandomInRange(-180, 180, 4)
  };
  socket.emit('geo', coords);
};

function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
};

