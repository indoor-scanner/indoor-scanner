const PORT = 8000;

var pug = require('pug');
var request = require('request');
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

const scansDir = './scans/';
server.listen(PORT);

console.log('Server is listening on port %d', PORT);

counter = 0;

var waiting = 0;

var lock = 0;

var numberOfShades = 50;
var roomSize = 30;

colormapOptions = {
  colormap: 'sunset',   // pick a builtin colormap or add your own 
  nshades: numberOfShades,       // how many divisions 
  format: 'rgbaString',     // "hex" or "rgb" or "rgbaString" 
  alpha: 1           // set an alpha value or a linear alpha mapping [start, end] 
};

var init = function(io) {
  lock = 0;
  return new Promise(function (resolve, reject) {
  // were assuming the serial port is always valid for now
    var pointCloudIndex = 0;
    var pointCloudString = 'point cloud data: ';

    io.on('connection', function (socket) {
      console.log('Client has connected');

      dataEmitter.on('data', (data) => {
        console.log(data);
        socket.emit('addPoint', data);
      });

    });

    // TODO: get rid of this
    console.log('Wating before resolving init function');
    setTimeout(function() {
      resolve();
    }, 3000);

  });
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
          dataViewerInit: 'js/data-viewer-init.js'
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
    recursiveWrite(lines, 0, colorArray);
    resolve();
  });
};

var recursiveWrite = function(pointCloudLines, index, colorArray) {
  if (index < pointCloudLines.length) {
    setTimeout(function() {
      var pointData = pointCloudLines[index].split(',').map(function (pointStuff) {
        return pointStuff.replace('\n', '');
      });
      var point = sphericalToCartesian(pointCloudLines[index].split(',').join(' '));
      console.log(point);
      point.color = mapPointColor(point, colorArray);
      dataEmitter.emit('data', point);
      recursiveWrite(pointCloudLines, index + 1, colorArray);
    }, 1);
  }
  else {
    return 0;
  }
};

// --------------------------------------------------
// main
// --------------------------------------------------
var scansList = fs.readdirSync(scansDir);
var inputFile = scansList.indexOf(process.argv[2]) >= 0 ? scansDir + process.argv[2] : 'scans/cave_4.csv';  
var colorScheme = [ 'jet', 'cool', 'portland', 'YIGnBu', 'inferno', 'spring' ];
var colorChoice = colorScheme.indexOf(process.argv[3]) >= 0 ? process.argv[3] : 'jet';
roomSize = process.argv[4] || roomSize;

colormapOptions = {
  colormap: colorChoice,
  nshades: numberOfShades,
  format: 'rgbaString',
  alpha: 1           
};

serverInit()
.then(function () {
  return init(socketIo);
})
.then(function () {
  return readScanFile(inputFile);
})
.catch(function (err) {
  console.log(err);
});
