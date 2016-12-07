function navigateDataViewer() {
  socket.emit('viewer-options', retrieveFormValues());
  window.location = 'http://localhost:8000/dataviewer';
};

function goToDemo() {
  sendFileName();
  socket.emit('start-demo');
  window.location = 'http://localhost:5000/dataviewer';
};

function formValidation() {
  $('.ui.form')
    .form({
      on: 'blur',
      fields: {
        empty: {
          identifier  : 'project-name',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter a value'
            },
            {
              type   : 'regExp[/^[a-zA-Z].*/]',
              prompt  : 'Please enter a valid file name'
            }
          ]
        },
        serial: {
          identifier  : 'dropdown-serial',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please select a valid serial port'
            }
          ]
        },
        color: {
          identifier  : 'dropdown-color',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please select a color scheme'
            }
          ]
        },
        checkbox: {
          identifier  : 'checkbox',
          rules: [
            {
              type   : 'checked',
              prompt : 'Please check the checkbox'
            }
          ]
        }
      },
      onSuccess: function(event, fields) {
        console.log('onSuccess');
        event.preventDefault();
        navigateDataViewer();
        // verifySerialPort();
      } 
    })
  ;
};

function retrieveFormValues() {
  var $form = $('.ui.form');
  // get one value
  var serialPort = $form.form('get value', 'dropdown-serial');
  var allFields = $form.form('get values');
  var color = { colorScheme: 'sunset' };
  return Object.assign({} , allFields, color);
};

function verifySerialPort() {
  socket.emit('viewer-options', retrieveFormValues());
};

$('.ui.inline.dropdown').dropdown({on: 'click'});
formValidation();




