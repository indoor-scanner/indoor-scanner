const PORT = 8000;
const exec = require('child_process').exec;

const pug = require('pug');
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const server = require('http').Server(app);
const colormap = require('colormap');
const fs = require('fs');
const serialport = require("serialport");
const SerialPort = serialport.SerialPort; 

server.listen(PORT);

console.log('Server is listening on port %d', PORT);

const numberOfShades = 50;
const scansDir = 'scans/';

// globals :(
var socketIo = require('socket.io')(server);
var lock = 0;

var scannerInit = function(options, socket) {
  var colormapOptions = {
    colormap: 'jet',
    nshades: numberOfShades,
    format: 'rgbaString',  
    alpha: 1     
  };

  var plotSettings = {
    filename : options.projectName,
    colors   : colormap(colormapOptions),
    roomSize : options.roomSize  
  };

  var scanner = new SerialPort(options.serialPort, {
    parser: serialport.parsers.readline("\n"),
    baudRate: 57600
  }, (err) => {
    if (err) {
      socket.emit('serial-error');
      console.log(err);
    }
  });
  // TODO: Figure out a way to check if the portId matches the one of the scanner
  scanner.on('open', function () {
    console.log('Serial port has been opened');
    scanner.flush();
  });

  socketIo.on('connection', (dataViewerSocket) => {
    console.log('Data-Viewer loaded');
    initDataViewer(scanner, dataViewerSocket, plotSettings);
  });
};

var initDataViewer = function(scanner, socket, plotSettings) {
  // TODO: implement soft reset in arduino
  lock = 0
  var pointCloudIndex = 0;
  var pointCloudString = 'point cloud data: ';

  socket.emit('addGrid', 20);

  socket.on('disconnect', () => {
    scanner.close( () => {
      console.log('Closing connection to dataviewer');
    });
  })

  scanner.on('data', function(data) {
    console.log('-- Arduino --\n\t' + data);
    pointCloudIndex = data.toLowerCase().indexOf(pointCloudString);
    if (pointCloudIndex >= 0) {
      var pointString = data.slice(pointCloudString.length);
      // TODO: implement file names with current time
      fs.appendFile(plotSettings.filename, pointString.split(' ').join(',') + '\n');
      var point = sphericalToCartesian(pointString);
      point.color = mapPointColor(point, plotSettings.colors, plotSettings.roomSize);
      socket.emit('addPoint', point);
    }
  });

  socket.on('disconnect', () => {
    // a hacky way to restart the chain
    socketIo = require('socket.io')(server);
    start();
  });

  socket.on('reset', function() {
    if (!lock) {
      lock = 1;
      scanner.write('0 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
            console.log('Resetting Scanner');
            lock = 0;
          });
        }, 50);
      });
    }
  });    

  socket.on('begin-scan', function() {
    console.log('basdf');
    if (!lock) {
      lock = 1;
      scanner.write('1 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
            console.log('Starting Scan');
            lock = 0;
          });
        }, 50);
      });
    }
  });

  socket.on('custom-scan', function() {
    if (!lock) {
      lock = 1;
      scanner.write('2 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
            console.log('Starting Custom Scan');
            lock = 0;
          });
        }, 50);
      });
    }
  });

  socket.on('pan-left', function() {
    if (!lock) {
      lock = 1;
      scanner.write('3 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
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
      scanner.write('4 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
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
      scanner.write('5 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
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
      scanner.write('6 s', function() {
        setTimeout(function() {
          scanner.drain(function() {
            console.log('Tilting up');
            lock = 0;
          });
        }, 100);
      });
    }
  });
};

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

// initializes options for the server
var serverInit = function() {
  app.set('view engine', 'pug');
  app.set('views', './views')
  app.use(favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.static(__dirname + '/public'));

  app.get('/', function (req, res) {  
    res.render('start', 
      {
        title: 'Data-Viewer',
        header: 'We doin business',
      }
    );
  });

  app.get('/dataviewer', function (req, res) {
    res.render('index',
      {
        title: 'Data-Viewer',
        header: 'We ready'
      }
    );
  });

  // app.get('/Pug', function (req, res) {
  //   res.render('pug-view',
  //     {
  //       title: 'Pug-Viewer',
  //       header: 'We ready'
  //     }
  //   );
  // });
};

var calculateDistance = function(point) {
  return Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) + Math.pow(point.z, 2) );
};

var mapPointColor = function(point, colorArray, roomSize) {
  var distance = calculateDistance(point);
  var index = Math.floor( (numberOfShades / roomSize).toFixed(2) * distance);
  return colorArray[index];
};

var clientInit = () => {
  socketIo.on('connection', (socket) => {
    SerialPort.list((error, ports) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      var serialPorts = ports.map((port) => {
        return {value: port.comName, text: port.comName};
      }).filter((serialObj) => {
        return serialObj.value.toLowerCase().includes("usb")
      });
      socket.emit('serial-list', serialPorts);
      socket.on('viewer-options', function(options) {
        options.projectName = scansDir + options.projectName + '.csv';
        roomSize = options.roomSize;
        fs.writeFileSync(options.projectName, '', 'utf8');
        scannerInit(options, socket);
      });
    });
  });
};

var readScanFile = function(filename) {
  return new Promise(function (resolve, reject) {
    var colorArray = colormap(colormapOptions);
    var lines = fs.readFileSync(filename, 'utf8').split('\n');
    lines.forEach(function (line) {
      var pointData = line.split(',').map(function (pointStuff) {
        return pointStuff.replace('\n', '');
      });
      var point = { x: pointData[0], y: pointData[1], z: pointData[2] };
      point.color = mapPointColor(point, colorArray);
      dataEmitter.emit('data', point);
    });
    resolve();
  });
};

var start = function() {
  serverInit();
  clientInit();
};

// main
start();
