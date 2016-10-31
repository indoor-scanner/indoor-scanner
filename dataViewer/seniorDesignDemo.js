var events = require('events');
var dataEmitter = new events.EventEmitter();
var fs = require('fs');
var favicon = require('serve-favicon');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);

app.use(express.static(__dirname + '/keyboardCommands'));

server.listen(8000);

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
      var portName = typeof arduinoPort !== 'undefined' ? arduinoPort.comName : '/dev/ttyUSB0';
      var returnVar = new SerialPort(portName, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 57600
      });
      resolve(returnVar);
    });
  });  
};

var openFile = function(fileName) {
  return new Promise(function (resolve, reject) {
    var contents = fs.readFileSync(fileName, 'utf-8').split('\n');
    resolve(contents);
  });
};

var init = function(sp, io, fileLines) {
  lock = 0;
  return new Promise(function (resolve, reject) {
  // were assuming the serial port is always valid for now
    var pointCloudIndex = 0;
    var pointCloudString = 'point cloud data: ';

    if (sp) {
      sp.on('data', function(data) {
        console.log('-- Arduino --\n\t' + data);
        pointCloudIndex = data.toLowerCase().indexOf(pointCloudString);
        if (pointCloudIndex >= 0) {
          var pointString = data.slice(pointCloudString.length);
          fs.appendFile('scan4.txt', pointString + '\n');
          var point = sphericalToCartesian(pointString);
          dataEmitter.emit('data', point);
        }
      });

      sp.on("open", function () {
        console.log('sp has opened');
        sp.flush();
      });
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
        fileLines.forEach(function (line) {
          var point = sphericalToCartesian(line);
          socket.emit('addPoint', point);
        });
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
            }, 100);
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
            }, 100);
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

      resolve();
    });

    // TODO: get rid of this
    // console.log('Wating before resolving init function');
    // setTimeout(function() {
    //   resolve(sp);
    // }, 3000);

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
  var radius = stringArr[0] * 0.01;
  var theta = stringArr[1] * Math.PI / 180; 
  var phi = stringArr[2] * Math.PI / 180;
  var point = {
    z: radius * Math.sin(phi) * Math.cos(theta),
    x: radius * Math.sin(phi) * Math.sin(theta),
    y: radius * Math.cos(phi) // TODO: fix later for varying theta
  };
  return point;
};

var plotGrid = function(socket, gridSize) {
  socket.emit('addGrid', gridSize);
};

openFile('scan.txt')
.then(function(lines) {
  return init(null, socketIo, lines);
})
.catch(function (err) {
  console.log(err);
});
