var socket = io.connect('http://localhost:8000');

function init() {
  socket.on('serial-list', function (serialPorts) {
    appendSerialPorts(serialPorts);
    console.log('here are the serial ports', serialPorts);
  });

  socket.on('serial-error', function () {
    window.location = 'http://localhost:8000';
  });

};

function appendSerialPorts(items) {
  for (var i = 0; i < items.length; i++) {
    var o = new Option(items[i].text, items[i].value);
    $(o).html(items[i].text);
    $("#serial").append(o);
  }
};

function removeSerialPorts() {
  $("#serial").empty();
};

init();