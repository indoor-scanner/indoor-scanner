var events = require('events');
var dataEmitter = new events.EventEmitter();
var fs = require('fs');
var favicon = require('serve-favicon');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);
var net = require('net');
var ip = require('ip')

var conn;

app.use(express.static(__dirname + '/keyboardCommands'));

server.listen(8000);
TCPserver = net.createServer(function(socket){
  conn = socket;
  // console.log(JSON.stringify(conn, null, 2));
  console.log("Wirelessly connected to indoor-scanner.");
  socket.on('data', function(buffer){
    var data = buffer.toString();
    var point = data.split(/\s/).filter(Boolean);
    dataEmitter.emit('data', point);
  });
  socket.on('close', function(data){
    console.log("CLOSED " + socket.remoteAddress + " " + socket.remotePort);
  });
});

counter = 0;

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var waiting = 0;

var lock = 0;

var setSerialPort = function() {
  return new Promise(function (resolve, reject) {
    serialport.list(function (err, ports) {
      if (err) { reject(err); }
      // var arduinoPort = ports.find(function (port) {
      //   return port.pnpId.includes('Arduino');
      // })
      // var portName = typeof arduinoPort !== 'undefined' ? arduinoPort.comName : '/dev/ttyUSB1';
      // var returnVar = new SerialPort(portName, {
      //   parser: serialport.parsers.readline("\n"),
      //   baudRate: 57600
      // });
      resolve(null);
    });
  });  
};

var init = function(sp, io) {
  return new Promise(function (resolve, reject) {
  // were assuming the serial port is always valid for now
    var isWireless = true;
    var pointCloudIndex = 0;
    var pointCloudString = 'point cloud data: ';

    if (sp) {
      conn = sp
      isWireless = false;
      sp.on('data', function(data) {
        console.log('-- Arduino --\n\t' + data);
        pointCloudIndex = data.toLowerCase().indexOf(pointCloudString);
        if (pointCloudIndex >= 0) {
          var pointString = data.slice(pointCloudString.length);
          var point = sphericalToCartesian(pointString);
          dataEmitter.emit('data', point);
        }
      });

      sp.on("open", function () {
        console.log('sp has opened');
        sp.flush();
      });
    }

    if (isWireless) {
      TCPserver.listen(8001, ip.address());
    }

    io.on('connection', function (socket) {
      console.log('Client has connected');

      plotGrid(socket, 20);
        dataEmitter.on('data', (data) => {
        console.log(data);
        socket.emit('addPoint', data);
      });

      // TODO: unlock 'lock' variable after scan
      // has completed
      socket.on('begin-scan', function() {
        if (!lock) {
          lock = 1;
          console.log(counter++);
          sendCommand(conn, 'begin-scan', function (err) { 
            if (err) {
              throw(err)
            }
            lock = 0
          });
          /*
          sp.write('2 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Starting Scan');
                lock = 0;
              });
            }, 100);
          });
          */
        }
      });

      socket.on('pan-left', function() {
        if (!lock) {
          lock = 1;
          console.log(counter++);
          sp.write('4 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Panning left');
                lock = 0;
              });
            }, 50);
          });
        }
      });

      socket.on('pan-right', function() {
        if (!lock) {
          lock = 1;
          console.log(counter++);
          sp.write('5 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Panning right');
                lock = 0;
              });
            }, 50);
          });
        }
      });

      socket.on('tilt-up', function() {
        if (!lock) {
          lock = 1;
          console.log(counter++);
          sp.write('6 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Tilting up');
                lock = 0;
              });
            }, 100);
          });
        }
      });

      socket.on('tilt-down', function() {
        if (!lock) {
          lock = 1;
          console.log(counter++);
          sp.write('7 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Tilting up');
                lock = 0;
              });
            }, 100);
          });
        }
      });

      dataEmitter.on('data', (data) => {
        console.log(data);
      });
    });

    // TODO: get rid of this
    console.log('Wating before resolving init function');
    setTimeout(function() {
      resolve(sp);
    }, 3000);

  });
};

var makeUnique = function(arr, is_equal) {
 var unique = [];
 for (var i = arr.length - 1; i >= 0; i--) {
   var el = arr[i];
   var is_unique = true;
   for (var j = unique.length - 1; j >= 0; j--) {
     var uniqueEl = unique[j];
     if(is_equal(el, uniqueEl)) {
       is_unique = false;
       break;
     }
   };
   if(is_unique) {
     unique.unshift(el);
   }
 };
 return unique;
};

var sendCommand = function(conn, message, callback) {
  conn.write(command, function(err) {
    if(err) {
      callback(err)
    }
    setTimeout(function() {
      if(conn.drain) {
        conn.drain();
      }
      console.log("Command sent: ", message);
      callback();
    }, 100);
  });
}

var startPlot = function(socket) {
  socket.emit('start');
};

var recursiveWrite = function(serialOb, index) {
  if (index <= 15) {
    setTimeout(function() {
      serialOb.write(index + ' test', function() {
        serialOb.drain(function() {
          recursiveWrite(serialOb, index + 1);
        });
      });
    }, 20);
  }
  else {
    return 0;
  }
}

var sphericalToCartesian = function(pointString) {
  var stringArr = pointString.split(' ').filter(Boolean);
  var radius = stringArr[0];
  var phi = stringArr[1] * Math.PI / 180;
  var point = {
    x: radius * Math.sin(Math.PI/2) * Math.cos(phi),
    y: radius * Math.sin(Math.PI/2) * Math.sin(phi),
    z: radius * Math.cos(Math.PI/2) // TODO: fix later for varying theta
  };
  return point;
};

var plotGrid = function(socket, gridSize) {
  socket.emit('addGrid', gridSize);
};

setSerialPort()
.then(function(serial) {
  return init(serial, socketIo);
})
.catch(function (err) {
  console.log(err);
});


