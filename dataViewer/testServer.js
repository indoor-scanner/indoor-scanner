var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/firstExample'));
server.listen(8000);

io.on('connection', function (socket) {
  recursiveY(socket);
  recursiveX(socket);
  points = genSpherePts(200);
  addCube(socket, points, 200-1);
});

var recursiveY = function(socket) {
  setTimeout(function() {
    socket.emit('rotatey', 'rotating y');
    recursiveY(socket);
  }, 25);
};

var recursiveX = function(socket) {
  setTimeout(function() {
    socket.emit('rotatex', 'rotating x');
    recursiveX(socket);
  }, 25);
};

var addCube = function(socket, points, index) {
  if (index > 0) {
    var newPos = points[index].map(function(point) {return point * 10});
    //console.log(newPos);
    setTimeout(function() {
      socket.emit('addCube', newPos);
      addCube(socket, points, index-1);
    }, 100);
  }
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
