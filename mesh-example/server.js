var events = require('events');
var dataEmitter = new events.EventEmitter();
var fs = require('fs');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io')(server);

app.use(express.static(process.cwd()));

server.listen(3000);

