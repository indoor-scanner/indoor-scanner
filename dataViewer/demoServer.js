var events = require('events');
var dataEmitter = new events.EventEmitter();

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);

app.use(express.static(__dirname + '/secondExample'));
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
  var testPoints = genSpherePts(5000);

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
  // io.on('connection', function (socket) {
  //   dataEmitter.on('data', (data) => {
  //     data = data.map(function (pt) {
  //       return pt * 7;
  //     });
  //     socket.emit('addCube', data);
  //     console.log(data);
  //   });
  // });

  var scaledPoints = testPoints.map(function (point) {
    var temp = [];
    point.forEach(function (point) {
      temp.push(point * 7);
    })
    return temp;
  })
  io.on('connection', function (socket) {
    recursiveUpdate(socket, scaledPoints, 0);
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
      socket.emit('addCube', points[index]);
      recursiveUpdate(socket, points, index + 1);
    }, 5);  
  }
};