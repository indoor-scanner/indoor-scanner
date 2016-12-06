const PORT = 8000;

var pug = require('pug');
var request = require('request');
var async = require('async');
var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);
var colormap = require('colormap');

var events = require('events');
var dataEmitter = new events.EventEmitter();
dataEmitter.setMaxListeners(1);
var fs = require('fs');
var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

server.listen(PORT);

console.log('Server is listening on port %d', PORT);

counter = 0;

var waiting = 0;

var lock = 0;

var numberOfShades = 50;
var roomSize = 20;

colormapOptions = {
  colormap: 'jet',   // pick a builtin colormap or add your own 
  nshades: numberOfShades,       // how many divisions 
  format: 'rgbaString',     // "hex" or "rgb" or "rgbaString" 
  alpha: 1           // set an alpha value or a linear alpha mapping [start, end] 
};

var setSerialPort = function() {
  return new Promise(function (resolve, reject) {
    serialport.list(function (err, ports) {
      if (err) { reject(err); }
      // var arduinoPort = ports.find(function (port) {
      //   return port.pnpId.includes('Arduino');
      // })
      var portName = typeof arduinoPort !== 'undefined' ? arduinoPort.comName : '/dev/cu.usbserial-12345678';
      var returnVar = new SerialPort(portName, {
        parser: serialport.parsers.readline("\n"),
        baudRate: 57600
      });
      resolve(returnVar);
    });
  });  
};

var init = function(sp, io) {
  lock = 0;
  return new Promise(function (resolve, reject) {
  // were assuming the serial port is always valid for now
    var pointCloudIndex = 0;
    var pointCloudString = 'point cloud data: ';

    if (sp != null) {
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

      dataEmitter.on('data', (data) => {
        console.log(data);
        socket.emit('addPoint', data);
      });

      // TODO: unlock 'lock' variable after scan
      // has completed
      socket.on('begin-scan', function() {
        if (sp != null) {
          lock = 1;
          console.log(counter++);
          sp.write('2 s', function() {
            setTimeout(function() {
              sp.drain(function() {
                console.log('Starting Scan');
                lock = 0;
              });
            }, 50);
          });
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
  console.log(pointString);
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

// initializes options for the server
var serverInit = function() {
  return new Promise(function (resolve, reject) {
    app.set('view engine', 'pug');
    app.set('views', './views')
    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.static(__dirname + '/public'));

    app.get('/', function (req, res) {  
      res.render('index', 
        {
          title: 'Data-Viewer',
          header: 'We doin business',
        }
      );
      resolve();
    });
  });
};

var calculateDistance = function(point) {
  return Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) + Math.pow(point.z, 2) );
};

var mapPointColor = function(point, colorArray) {
  var distance = calculateDistance(point);
  var index = Math.floor( (numberOfShades / roomSize).toFixed(2) * distance);
  return colorArray[index];
};

var readScanFile = function(filename) {
  return new Promise(function (resolve, reject) {
    var colorArray = colormap(colormapOptions);
    var lines = fs.readFileSync(filename, 'utf8').split('\n');
    lines.forEach(function (line) {
      
      var pointData = line.split(',').map(function (pointStuff) {
        return pointStuff.replace('\n', '');
      });

      var point = sphericalToCartesian(line.split(',').join(' '));
      console.log(point);
      // var point = { x: pointData[0], y: pointData[1], z: pointData[2] };
      point.color = mapPointColor(point, colorArray);
      dataEmitter.emit('data', point);
    });
    resolve();
  });
};
// main
serverInit()
.then(function () {
  return init(null, socketIo);
})
.then(function () {
  return readScanFile('scans/metro_2.csv');
})
.catch(function (err) {
  console.log(err);
});
// .then(setSerialPort)
// .then(function(serial) {
//   return init(serial, socketIo);
// })
// .catch(function (err) {
//   console.log(err);
// });