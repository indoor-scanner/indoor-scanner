var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/firstExample'));
server.listen(8000);

io.on('connection', function (socket) {
  recursiveY(socket);
  recursiveX(socket);
  addCube(socket, 0);
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

var addCube = function(socket, pos) {
  if (pos < 200) {
    var newPos = pos % 20;
    setTimeout(function() {
      socket.emit('addCube', newPos);
      addCube(socket, pos+2);
    }, 0);
  }
};