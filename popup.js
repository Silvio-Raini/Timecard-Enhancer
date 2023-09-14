window.addEventListener('load', function() {
  chrome.storage.local.get('usualPauseTime', function(result) {
    if(chrome.runtime.lastError) {
      console.error('Error reading usualPauseTime from local storage: '+chrome.runtime.lastError);
    }else {
      if(typeof result.usualPauseTime !== 'undefined') {
        var usualPauseTime = result.usualPauseTime;
        document.getElementById('usualPauseTime').value = result.usualPauseTime;
      }else {
        console.log('Variable is empty');
      }
    }
  });
  var usualPauseTime = readData('usualPauseTime');
  console.log(usualPauseTime);

  chrome.storage.local.get('usualPauseStart', function(result) {
    if(chrome.runtime.lastError) {
      console.error('Error reading usualPauseStart from local storage: '+chrome.runtime.lastError);
    }else {
      if(typeof result.usualPauseStart !== 'undefined') {
        var usualPauseStart = result.usualPauseStart;
        document.getElementById('usualPauseStart').value = result.usualPauseStart;
      }else {
        console.log('Variable is empty');
      }
    }
  });

  chrome.storage.local.get('modules', function(result) {
    if(chrome.runtime.lastError) {      
      console.error('Error reading usualPauseStart from local storage: '+chrome.runtime.lastError);
    }else {
      if(typeof result.modules !== 'undefined') {
        var modules = result.modules;
        $.each(modules, function(key, value) {
          $(value).each(function() {
            var id = this['id'];
            var id = 1;
            var title = this['title'];
            var subtitle = this['subtitle'];
            var position = this['position'];
            var syntax = [];
            $.each(this['syntax'], function(step, val) {
              syntax.push(val);
            });
            var res = '';
            $(syntax).each(function() {
              if(this == 'A') {
                res += 'Arbeitsbeginn';
              }else if(this == 'P') {
                res += 'Pausenzeit';
              }else if(this == 'L') {
                res += 'Feierabend';
              }else if(this == 'G') {
                res += 'Gleitzeit';
              }else if(this == 'R') {
                res += 'Verbleibend';
              }else {
                res += this;
              }
              res += ' ';
            });
  
            $('div.list').append('<div class="order'+position+'"><span class="title" title="'+title+'">'+title+'</span><span class="subtitle" title="'+subtitle+'">'+subtitle+'</span><span class="syntax" title="'+res+'">'+res+'</span><button name="edit" value="'+id+'">Bearbeiten</button></div>');
          });
            
        });
      }else {
        console.log('Variable is empty');
      }
    }
  });
  
  console.log($('div.list > div'));
});

// document.querySelector('#save').addEventListener("click", function() {
//   var usualPauseTime = document.getElementById('usualPauseTime').value;
//   var usualPauseStart = document.getElementById('usualPauseStart').value;
//   var modules = {
//     0: {
//       "title": "Gehen",
//       "subtitle": "frühestens",
//       "syntax": {
//         0: "A",
//         1: "+",
//         2: "8:00:00",
//         3: "+",
//         4: "P",
//         5: "-",
//         6: "G",
//       },
//       'position': 25,
//     },
//     1: {
//       "title": "Gehen",
//       "subtitle": "vorraussichtlich",
//       "syntax": {
//         0: "A",
//         1: "+",
//         2: "8:00:00",
//         3: "+",
//         4: "P"
//       },
//       'position': 5,
//     },
//     2: {
//       "title": "Pause",
//       "subtitle": "spätestens",
//       "syntax": {
//         0: "A",
//         1: "+",
//         2: "6:00:00",
//       },
//       'position': 10,
//     },
//     3: {
//       "title": "Verbleibend (h)",
//       "subtitle": "",
//       "syntax": {
//         0: "R",
//       },
//       'position': 12,
//     }
//   }

//   chrome.storage.local.set({'usualPauseTime': usualPauseTime},function() {
//     if(chrome.runtime.lastError) {
//       console.error('Error saving usualPauseTime to local storage: '+ chrome.runtime.lastError);
//       $('#alert span').html('Speichern fehlgeschlagen');
//     }else {
//       $('#alert span').html('Gespeichert');
//     }
//   });
//   chrome.storage.local.set({'usualPauseStart': usualPauseStart},function() {
//     if(chrome.runtime.lastError) {
//       console.error('Error saving usualPauseStart to local storage: '+ chrome.runtime.lastError);
//       $('#alert span').html('Speichern fehlgeschlagen');
//     }else {
//       $('#alert span').html('Gespeichert');
//     }
//   });
//   chrome.storage.local.set({'modules': modules},function() {
//     if(chrome.runtime.lastError) {
//       console.error('Error saving usualPauseStart to local storage: '+ chrome.runtime.lastError);
//       $('#alert span').html('Speichern fehlgeschlagen');
//     }else {
//       $('#alert span').html('Gespeichert');
//     }
//   });

// });

$(document).ready(function() {
  $('#alert').on('animationend', function() {
    $(this).removeClass('animate');
  });

  $('div.input > div > input[type="time"]:after').on('click', function(e) { // switching from TIME input to SELECT input
    console.log('X');
    $(this).parent().html('<select><option value="A">Arbeitsbeginn</option><option value="P">Pausenzeit</option><option value="L">Feierabend</option><option value="G">Gleitzeit</option><option value="R">Verbleibend</option><option value="time" selected>Zeit</option></select>');
  });

  $(document).on('change', 'div.input > div > select', function() { // switching from SELECT input to TIME input (also maybe handle other events)
    switch($(this).val()) {
      default:
      case 'time':
        $(this).after('<input type="time" step="1"></input>');
        $(this).remove();
        break;
      case 'A':
        break;
      case 'P':
        break;
      case 'L':
        break;
      case 'G':
        break;
      case 'R':
        break;
      case '+':
        break;
      case '-':
        break;
    }
  });

  $('button[name="add"]').click(function() { // when add step clicked append it.
    if($('div.input > div').children().length % 2 == 0) {
      // even -> operator
        $(this).before('<select><option value="empty" disabled selected>Operator wählen</option><option value="+">+</option><option value="-">-</option></select>');
      }else {
      // uneven -> variable
      $(this).before('<select><option value="empty" disabled selected>Variable wählen</option><option value="A">Arbeitsbeginn</option><option value="P">Pausenzeit</option><option value="L">Feierabend</option><option value="G">Gleitzeit</option><option value="R">Verbleibend</option><option value="time">Zeit</option></select>');
    }
  });

  $(document).on('click', 'button[name="append"], button[name="edit"]', function() { // open modal
    var data = readData();
    console.log(data);

    $('div#editor').css('visibility', 'visible');
    if($(this).attr('name') == 'edit') {
      console.log('edit');
      $('button[name="editSave"]').attr('value', $(this).value);
      // read;
    }
  });

  $('button[name="editSave"]').click(function() { // save edit
    var module = {
      'id':$(this).attr('value'),
      'title':$('input[name="editName"]').val(),
      'subtitle':(($('input[name="editBeschreibung"]').val().length > 0) ? $('input[name="editBeschreibung"]').val() : ''),
      'syntax':'',
      'position':$('input[name="editPosition"]').val(),
    };
    var syntax = [];
    iteration = 0;
    $('div.input > div').children().each(function() {
      if($(this).is('select') || $(this).is('input')) {
        iteration++;
        syntax.push($(this).val());
      }
    });

    if(syntax.length % 2 == 0) {
      syntax.pop();
    }

    module['syntax'] = syntax;
    console.log(module);
    
    var read = readData('usualPauseTime');
    console.log('read: '+read);
  });

});

// function readData(parameter) {
//   chrome.storage.local.get(parameter, function(result) {
//     if(result) {
//       return result;
//     }
//   });
// }

// function saveData(parameter) {
//   chrome.storage.local.set('{'+parameter+'}',function() {
//     if(chrome.runtime.lastError) {
//       $('#alert span').html('Speichern fehlgeschlagen');
//     }else {
//       $('#alert span').html('Gespeichert');
//     }
//   });
// }

function readData(key = null) {
  rD(key, function(data) {
    if(data !== null) {
      if(key !== null) {
        switch(key) {
          default: 
          case 'usualPauseStart':
            var result =  {
              'usualPauseStart': data.usualPauseStart
            };
            break;
          case 'usualPauseTime':
            var result =  {
              'usualPauseTime': data.usualPauseTime 
            };
            break;
          case 'modules':
            var result =  {
              'modules': data.modules 
            };
            break;
        }
        return result;
      }else{
        var result = {
          'usualPauseStart': data.usualPauseStart,
          'usualPauseTime': data.usualPauseTime,
          'modules': data.modules
        };
        console.log(result);
        return result
      }

    }else {
      $('#alert span').html('Lesen fehlgeschlagen');
      $('#alert').addClass('animate');
    }
  });
}
function writeData(data) {
  if(data) {
    wD(data, function(response) {
      if(response) {
        $('#alert span').html('Gespeichert');
      }else {
        $('#alert span').html('Speichern fehlgeschlagen');
      }
      $('#alert').addClass('animate');
    });
  }
}

function rD(key, callback) {
  chrome.storage.local.get(key, function(data) {
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      callback(null);
    }else {
      callback(data);
    }
  });
}
function wD(data, callback) {
  chrome.storage.local.set(data, function() {
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      callback(false);
    }else {
      callback(true);
    }
  });
}


// BIG ERROR SAVING AND READING PLS FIX FUTURE