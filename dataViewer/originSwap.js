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
        baudRate: 57600
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

var computeDistance = function(point1, point2) {
  var x = point2.x - point1.x;
  var y = point2.y - point1.y;
  var temp = Math.pow(x, 2) + Math.pow(y, 2);
  return  Math.sqrt(temp);
};

var init = function(sp, io) {
<<<<<<< Updated upstream
  var isWireless = true;
  var room = genSpherePts(5000, 50);
=======
  var room = genSpherePts(1000, 50);
>>>>>>> Stashed changes
  
  var testPoints = room.vertices;
  var gridSize = room.max;


  // var eigens = testPoints.map(function(point) {
  //   // Eigen::Vector3f(-3.f, 2.f, 0.f)
  //   return ('Eigen::Vector3f(' + point.x + 'f, ' + point.y + 'f, ' + point.z + 'f)');
  // });

  // console.log(eigens.join(',\n'));
  // var quad1Pts = getQuadrantPts(room.vertices, 1);
  // var quad2Pts = getQuadrantPts(room.vertices, 2);
  // var quad3Pts = getQuadrantPts(room.vertices, 3);
  // var quad4Pts = getQuadrantPts(room.vertices, 4);

  // var triangles = [];
  // var data = [];

  // var minPts = Math.min.apply(null, [quad1Pts.length, quad2Pts.length, quad3Pts.length,
  //                                    quad4Pts.length]);

  // var triSample1 = 2;
  // var triSample2 = 20;
  // // find which quadrant has the least amount of points
  // for (var j = 0; j < quad1Pts.length; j+=triSample1) {
  //   for (var i = 0; i < minPts; i+=triSample2) {
  //     var triangle = [quad1Pts[j], quad2Pts[i], quad3Pts[i], quad1Pts[j]];
  //     var triangleData = {
  //       side1: computeDistance(quad1Pts[j], quad2Pts[i]),
  //       side2: computeDistance(quad2Pts[i], quad3Pts[i]),
  //       side3: computeDistance(quad3Pts[i], quad1Pts[j]),
  //       vertices: [quad1Pts[j], quad2Pts[i], quad3Pts[i], quad1Pts[j]]
  //     };
  //     data.push(triangleData);
  //     // triangles.push(triangle);
  //   };
  // };

  // for (var j = 0; j < quad2Pts.length; j+=triSample1) {
  //   for (var i = 0; i < minPts; i+=triSample2) {
  //     var triangle = [quad2Pts[j], quad3Pts[i], quad1Pts[i], quad2Pts[j]];
  //     var triangleData = {
  //       side1: computeDistance(quad1Pts[i], quad2Pts[j]),
  //       side2: computeDistance(quad2Pts[j], quad3Pts[i]),
  //       side3: computeDistance(quad3Pts[i], quad1Pts[i]),
  //       vertices: [quad2Pts[j], quad3Pts[i], quad1Pts[i], quad2Pts[j]]
  //     };
  //     data.push(triangleData);
  //     // triangles.push(triangle);
  //   };
  // };

  // for (var j = 0; j < quad3Pts.length; j+=triSample1) {
  //   for (var i = 0; i < minPts; i+=triSample2) {
  //     var triangle = [quad3Pts[j], quad1Pts[i], quad2Pts[i], quad3Pts[j]];
  //     var triangleData = {
  //       side1: computeDistance(quad1Pts[i], quad2Pts[i]),
  //       side2: computeDistance(quad2Pts[i], quad3Pts[j]),
  //       side3: computeDistance(quad3Pts[j], quad1Pts[i]),
  //       vertices: [quad3Pts[j], quad1Pts[i], quad2Pts[i], quad3Pts[j]]
  //     };
  //      data.push(triangleData);
  //     // triangles.push(triangle);
    // };
  // };

  // var uniqueTriangles = function(a, b) {
  //   return (a.side1 == b.side1 && a.side2 == b.side2 && a.side3 == b.side3);
  // };

  // var uniqueData = makeUnique(data, uniqueTriangles);

  // var sortedData = uniqueData.sort(function (a, b) {
  //   return a.side1 - b.side1;
  // });

  // console.log(uniqueData);

  // uniqueData.forEach(function (uniqueSet) {
  //   triangles.push(uniqueSet.vertices);
  // });

  // var mergedVertices = [].concat.apply([], triangles);

  // var uniqueVertices = makeUnique(mergedVertices, function(a, b) {
  //   return (a.x == b.x && a.y == b.y && a.z == b.z);
  // })
  // console.log(JSON.stringify(uniqueVertices, null, 2));

  if (sp) {
    isWireless = false;
    sp.on("open", function () {
      console.log('sp has opened');
      sp.flush();
    });

    sp.on('data', function(data) {
    console.log(data);
      var points = data.split(/\s/).filter(Boolean);
      if (points[0] <= 50) {
        var point = {
          x: points[0] * Math.cos(points[1]),
          y: points[0] * Math.sin(points[1]),
          z: 0
        };
        dataEmitter.emit('data', point);
      };
    });
  }
  io.on('connection', function (socket) {
    // recursiveUpdate(socket, testPoints, 0); // plot points
    plotGrid(socket, gridSize);
     dataEmitter.on('data', (data) => {
      console.log(data);
      socket.emit('addPoint', data);
      // console.log(data);
    });
    socket.emit('end'); // turn off updates
  });

<<<<<<< Updated upstream
  if (isWireless) {
    TCPserver = net.createServer(function(socket){
      console.log("Wirelessly connected to indoor-scanner.");
      socket.on('data', function(buffer){
        var data = buffer.toString();
        var points = data.split(/\s/).filter(Boolean);
        //dataEmitter.emit('data', points);
        return console.log("got data: " + points);
      });
      socket.on('close', function(data){
        console.log("CLOSED " + socket.remoteAddress + " " + socket.remotePort);
      });
    });
    TCPserver.listen(8001, ip.address());
  }

  // io.on('connection', function (socket) {
=======
  // var demo1 = function() {
  //   io.on('connection', function (socket) {
>>>>>>> Stashed changes
  //   recursiveUpdate(socket, testPoints, 0); // plot points
  //   plotGrid(socket, gridSize);
  //   // socket.emit('end'); // turn off updates
  //   });
  // };

  // var demo2 = function() {
  //   io.on('connection', function (socket) {
  //   recursiveUpdate(socket, uniqueVertices, 0); // plot points
  //   plotGrid(socket, gridSize);
  //   recursiveTriangles(socket, triangles, 0);
  //   // socket.emit('end'); // turn off updates
  //   });
  // };

  // demo1();
  
};

var genSquarePts = function(numPoints, max) {
  var pointsPerSide = Math.floor(numPoints / 4);
  var inc = max / pointsPerSide;
  var square = [];
  var start = max / 2;
  for (var i = 0; i <= pointsPerSide; i++) {
    var point = {
      x: start - inc * i,
      y: start,
      z: 0
    };
    square.push(point);
  }

  for (var i = 0; i <= pointsPerSide; i++) {
    var point = {
      x: start,
      y: start - inc * i,
      z: 0
    };
    square.push(point);
  }

  var square = square.concat(square.map(function (point) {
    var temp = {
      x: point.x * -1,
      y: point.y * -1,
      z: 0
    };
    return temp;
  }))
  return {
    vertices: square,
    max: max
  };
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

setSerialPort()
.then(function (serialOb) {
  init(serialOb, socketIo)
})
.catch(function (err) {
  console.log(err);
})

// init(serialOb = null, socketIo)
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


