var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("/dev/ttyACM0", {
  parser: serialport.parsers.readline("\n"),
  baudRate: 9600
  // set the buffer here!
});

// var dataLock = 0;

sp.on("open", function () {
  console.log('sp has opened');
  sp.flush();
});

sp.on('data', function(data) {
  console.log(data);
});

var listPorts = function() {
  serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });
  });
};

var writeData = function(data) {
  return new Promise(function (resolve, reject) {
    console.log(data);
    resolve();
  });
};