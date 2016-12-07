var socket = io.connect('http://localhost:5000');

function sendFileName() {
  var $form = $('.ui.form');
  var fileToRead = $form.form('get value', 'filename');
  socket.emit('read-file', fileToRead);
};
