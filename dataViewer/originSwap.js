var events = require('events');
var dataEmitter = new events.EventEmitter();
var fs = require('fs');
var favicon = require('serve-favicon');
var ip = require('ip');
var net = require('net');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);

app.use(express.static(__dirname + '/originExample'));
app.use(favicon(__dirname + '/originExample/images/favicon.ico'));

server.listen(8000);
TCPserver = net.createServer(function(socket){
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

var getQuadrantPts = function(vertices, quadrant) {
  // works for xy plane objects only
  switch (quadrant) {
    case 1: return is_quad1(vertices);
    case 2: return is_quad2(vertices);
    case 3: return is_quad3(vertices);
    case 4: return is_quad4(vertices); 
    default:
      throw ('Error in getQuadrantPts: Incorrect quadrant value.');
  };
};

var is_quad1 = function(vertices) {
  var newVertices = vertices.filter(function (vertex) {
    return (vertex.x >= 0 && vertex.y >= 0);
  });
  return newVertices;
};

var is_quad2 = function(vertices) {
  var newVertices = vertices.filter(function (vertex) {
    return (vertex.x <= 0 && vertex.y >= 0);
  });
  return newVertices;
};

var is_quad3 = function(vertices) {
  var newVertices = vertices.filter(function (vertex) {
    return (vertex.x <= 0 && vertex.y <= 0);
  });
  return newVertices;
};

var is_quad4 = function(vertices) {
  var newVertices = vertices.filter(function (vertex) {
    return (vertex.x >= 0 && vertex.y <= 0);
  });
  return newVertices;
};


var init = function(sp, io) {
  var isWireless = true;
  var room = genSpherePts(5000, 50);
  
  var testPoints = room.vertices;
  var gridSize = room.max;

  var quad1Pts = getQuadrantPts(room.vertices, 1);
  var quad2Pts = getQuadrantPts(room.vertices, 2);
  var quad3Pts = getQuadrantPts(room.vertices, 3);
  var quad4Pts = getQuadrantPts(room.vertices, 4);

  var triangles = [];

  var minPts = Math.min.apply(null, [quad1Pts.length, quad2Pts.length, quad3Pts.length,
                                     quad4Pts.length]);

  // find which quadrant has the least amount of points
  for (var i = 0; i < minPts; i++) {
    var triangle = [quad1Pts[i], quad2Pts[i], quad3Pts[i], quad4Pts[i], quad1Pts[i]];
    triangles.push(triangle);
  };

  if (sp) {
    isWireless = false;
    sp.on("open", function () {
      console.log('sp has opened');
      sp.flush();
    });

    sp.on('data', function (data) {
      var points = data.split(/\s/).filter(Boolean);
  
      dataEmitter.emit('data', points);
    });
  }

  if (isWireless) {
    TCPserver.listen(8001, ip.address());
  }

  // io.on('connection', function (socket) {
  //   recursiveUpdate(socket, testPoints, 0); // plot points
  //   plotGrid(socket, gridSize);
  //   recursiveTriangles(socket, triangles, 0);
  //   // socket.emit('end'); // turn off updates
  // });

  var demo1 = function() {
    io.on('connection', function (socket) {
    recursiveUpdate(socket, testPoints, 0); // plot points
    plotGrid(socket, gridSize);
    // socket.emit('end'); // turn off updates
    });
  };

  var demo2 = function() {
    io.on('connection', function (socket) {
    recursiveUpdate(socket, testPoints, 0); // plot points
    plotGrid(socket, gridSize);
    recursiveTriangles(socket, triangles, 0);
    // socket.emit('end'); // turn off updates
    });
  };

  demo2();
  
};

var genSpherePts = function(numPoints, scale) {
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2.0 / numPoints;
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
    
    point.x = x * scale;
    point.y = y * scale;
    point.z = z * scale;
    sphere.push(point);
  };

  var room = {
    vertices: sphere,
    max: scale
  };

  return room;
};

var genCirclePts = function(numPoints, radius) {
  var inc = 360 / numPoints;

  var room = {
    vertices: [],
    max: 0
  };

  var points = [];
  var x, y;
  for (var i = 0; i < numPoints; i++) {
    x = radius * Math.cos(inc * i);
    y = radius * Math.sin(inc * i);
    var point = {
      x: x,
      y: y,
      z: 0
    };
    points.push(x);
    points.push(y);
    room.vertices.push(point);
  };

  room.max = Math.max.apply(null, points);
  return room;
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

var plotGrid = function(socket, gridSize) {
  socket.emit('addGrid', gridSize);
};

var recursiveTriangles = function(socket, vertices, index) {
  if (index < vertices.length) {
    setTimeout(function() {
      socket.emit('plotTriangles', vertices[index]);
      recursiveTriangles(socket, vertices, index + 1);
    }, 0);
  }
};

var startPlot = function(socket) {
  socket.emit('start');
};


