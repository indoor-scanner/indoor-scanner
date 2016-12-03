var Key = {
  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40,
  SPACE:  32,
  L    :  76
};

function _addEventListener(evt, element, fn) {
  if (window.addEventListener) {element.addEventListener(evt, fn, false);}
  else {element.attachEvent('on'+evt, fn);}
}

function onInputKeydown(evt) {
  if (!evt) { evt = window.event; }
  var keycode = evt.keyCode || evt.which; 
  if (keycode == Key.LEFT) {
    socket.emit('pan-left');
  }
  else if (keycode == Key.UP) {
    socket.emit('tilt-up');
  }
  else if (keycode == Key.RIGHT) {
    socket.emit('pan-right');
  }
  else if (keycode == Key.DOWN) {
    socket.emit('tilt-down');
  }
  else if (keycode == Key.SPACE) {
    socket.emit('begin-scan');
  }
  else if (keycode == Key.L) {
    if (keyboardLock) {
      keyboardLock = false;
      controls.enableControls();
    }
    else {
      keyboardLock = true;
      controls.mouseX = 0;
      controls.mouseY = 0;
      controls.disableControls();
    }
  }
}

function addevt() {
  _addEventListener('keydown', document, onInputKeydown);
}