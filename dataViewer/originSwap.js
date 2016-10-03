var events = require('events');
var dataEmitter = new events.EventEmitter();

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);

app.use(express.static(__dirname + '/originExample'));
server.listen(8000);

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var setSerialPort = function() {
  return new Promise(function (resolve, reject) {
    serialport.list(function (err, ports) {
      if (err) { reject(err); }
      var arduinoPort = ports.find(function (port) {
        return port.pnpId.includes('Arduino');
      })
      var portName = typeof arduinoPort !== 'undefined' ? arduinoPort.comName : '/dev/ttyACM0';
      var returnVar = new SerialPort(portName, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 115200
      });
      resolve(returnVar);
    });
  });  
};

var init = function(sp, io) {
  var testPoints = genSpherePts(1000000);

  if (sp) {
    sp.on("open", function () {
      console.log('sp has opened');
      sp.flush();
    });

    sp.on('data', function(data) {
      var points = data.split(/\s/).filter(Boolean);
  
      dataEmitter.emit('data', points);
    });
  }

  io.on('connection', function (socket) {
    recursiveUpdate(socket, testPoints, 0);
    // console.log(testPoints);
  });
  
};

var genSpherePts = function(numPoints) {
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2.0 / numPoints;
  var scale = 50;
  var x, y, z, r, phi;

  var sphere = [];

  for(var k = 0; k < numPoints; k++) {
    y = k * off - 1 + (off / 2);
    r = Math.sqrt(1 - y * y);
    phi = k * inc;
    x = Math.cos(phi) * r;
    z = Math.sin(phi) * r;

    var point = {
      x: 0,
      y: 0,
      z: 0
    };
    
    point.x = x;
    point.y = y;
    point.z = z;
    sphere.push(point);
  }

  return sphere;
};

// setSerialPort()
// .then(function (serialOb) {
//   init(serialOb, socketIo)
// })
// .catch(function (err) {
//   console.log(err);
// })


init(serialOb = null, socketIo)
// .then(function (plotOb) {
//   var scaledPoints = plotOb.pointsToPlot.map(function (point) {
//     var temp = [];
//     point.forEach(function (point) {
//       temp.push(point * 7);
//     })
//     return temp;
//   })
//   recursiveUpdate(plotOb.socket, scaledPoints, 0);
//   // console.log(scaledPoints);
// })

var recursiveUpdate = function(socket, points, index) {
  if (index < points.length) {
    setTimeout(function() {
      socket.emit('addPoint', points[index]);
      recursiveUpdate(socket, points, index + 1);
    }, 0);  
  }
  else {
    socket.emit('end');
  }
};

var startPlot = function(socket) {
  socket.emit('start');
};