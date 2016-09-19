var events = require('events');
var dataEmitter = new events.EventEmitter();

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/firstExample'));
server.listen(8000);

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var setPorts = function() {
  return new Promise(function (resolve, reject) {
    var portName = 'lol';
    serialport.list(function (err, ports) {
      if (err) { reject(err); }
      ports.forEach(function(port) {
        if (port.pnpId) {
          portName = port.pnpId.includes('Arduino') ? port.comName : '/dev/ttyACM0';
        }
      });
      var returnVar = new SerialPort(portName, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 115200
      });
      resolve(returnVar);
    });
    // console.log(portName);

  });  
};

var sp;


var init = function() {
  sp.on("open", function () {
    console.log('sp has opened');
    sp.flush();
  });

  sp.on('data', function(data) {
  // console.log('data');
  var points = data.split(/\s/).filter(Boolean);

  dataEmitter.emit('data', points);
  });

  io.on('connection', function (socket) {
    dataEmitter.on('data', (data) => {
      data = data.map(function (pt) {
        return pt * 10;
      });
      socket.emit('addCube', data);
      console.log(data);
    });
    var size = 1000;
    points = genSpherePts(size);
  });
};

var genSpherePts = function(size) {
  var pts = [];
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2.0 / size;
  var x, y, z, r, phi;

  for(var k = 0; k < size; k++) {
    y = k * off - 1 + (off / 2);
    r = Math.sqrt(1 - y * y);
    phi = k * inc;
    x = Math.cos(phi) * r;
    z = Math.sin(phi) * r;

    pts.push([x, y, z])
  }

  return pts;
};

setPorts()
.then(function (serialOb) {
  sp = serialOb;
})
.then(init)
.catch(function (err) {
  console.log(err);
})