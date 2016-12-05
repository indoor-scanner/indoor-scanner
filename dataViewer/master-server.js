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

const A = 0.034;
const B = 0.074;

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
  var finishedString = 'finished scanning';

  socket.emit('addGrid', 20);

  socket.on('disconnect', () => {
    scanner.close( () => {
      console.log('Closing connection to dataviewer');
    });
  })

  scanner.on('data', function(data) {
    console.log('-- Arduino --\n\t' + data);
    pointCloudIndex = data.toLowerCase().indexOf(pointCloudString);
    finishedIndex = data.toLowerCase().indexOf(finishedString);
    if (pointCloudIndex >= 0) {
      var pointString = data.slice(pointCloudString.length);
      // TODO: implement file names with current time
      var point = sphericalToCartesian(compensateForArm(A, B, pointString));
      fs.appendFile(plotSettings.filename, point.join(',') + '\n');
      point.color = mapPointColor(point, plotSettings.colors, plotSettings.roomSize);
      socket.emit('addPoint', point);
    } else if (finishedIndex >= 0) {
      potreeConverter(plotSettings.filename, plotSettings.filename + '_potree');
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

var compensateForArm = function(a, b, pointString) {
  var point = pointString.split(' ').filter(Boolean).map((val) => parseFloat(val));
  var L = point[0] + b;
  var radius = Math.sqrt(L*L + a*a);
  var theta  = point[1];
  var phi    = point[2] - Math.asin(a / radius);
  return [radius, theta, phi].join(' ')
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

  app.get('/scan', function (req, res) {
    res.rende
  })

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
        options.projectName = scansDir + options.projectName + '.csv.xyz';
        roomSize = options.roomSize;
        fs.writeFileSync(options.projectName, '', 'utf8');
        scannerInit(options, socket);
      });
    });
  });
};

var readScanFile = function(filename, socket) {
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

var potreeConverter = function(filename, newfilename, callback) {
  child_process.exec('PotreeConverter', (err, stdout, stderr) => {
    if (err) { // Check if PotreeConverter is installed
      return err;
    }
    var command    = util.format('PotreeConverter %s -o %s', filename, newfilename);
    var logMessage = util.format('Converting %s to potree format', filename);
    console.log(logMessage);
    console.log(command);
    if (callback == null) {
      console.log(child_process.execSync(command).toString());
    } else {
      console.log(child_process.exec(command, callback).toString());
    }
    return null;
  })
};

var start = function() {
  serverInit();
  clientInit();
};

// main
start();
