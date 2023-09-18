function save() {
  readData()
    .then((data) =>  {
      var usualPauseTime = document.getElementById('usualPauseTime').value;
      var usualPauseStart = document.getElementById('usualPauseStart').value;
      var modules = ((data['modules']) ? data['modules'] : {});

      if($(modules).length > 0) {
        var newModules = [];
        var editedModule = getEdit();
        var newIsEdit = false;
        var highestID = 0;

        $.each(modules, function(key, value) {
          $(value).each(function() {
            var id = ((this['id']) ? this['id'] : 1);
            var title = ((this['title']) ? this['title'] : '');
            var subtitle = ((this['subtitle']) ? this['subtitle'] : '');
            var position = ((this['position']) ? this['position'] : 1);

            if(id > highestID) {
              highestID = id;
            }

            var syntax = [];
            $.each(this['syntax'], function(step, val) {
              syntax.push(val);
            });
            
            var module = {
              "id": id,
              "title": title,
              "subtitle": subtitle,
              "position": position,
              "syntax": syntax
            }
            console.log(editedModule);
            if(editedModule['id'] == id && editedModule['title'].length > 0) {
              console.log('edited');
              newIsEdit = true;
              module['title'] = editedModule['title'],
              module['subtitle'] = editedModule['subtitle'],
              module['position'] = editedModule['position'],
              module['syntax'] = editedModule['syntax']
            }

            newModules.push(module);
          });
        });

        if(!newIsEdit && editedModule['syntax'].length > 0) {
          editedModule['id'] = highestID + 1; // keep unique
          newModules.push(editedModule);
          console.log('added');
        }else {
          console.log('no changes?');
        }

        var newData = {
          "usualPauseStart": usualPauseStart,
          "usualPauseTime": usualPauseTime,
          "modules": newModules
        };
        console.log(newData);
        clearData();
        writeData(newData);

        $('div#editor').html('');
        // updatePanel();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

     function getEdit(readable = false) {
  var id = $('button[name="editSave"]').attr('value');
  console.log(id);
  var module = {
    'id':$('button[name="editSave"]').attr('value'),
    'title':$('input[name="editName"]').val(),
    'subtitle': $('input[name="editBeschreibung"]').val(),
    'syntax':'',
    'position':$('input[name="editPosition"]').val(),
  };
  var syntax = [];
  iteration = 0;
  $('div.input > div').children().each(function() {
    if($(this).is('select') || $(this).is('input')) {
      iteration++;

      if(readable) {
        var res = '';
        var val = $(this).val();
        if(val == 'A') {
          res = 'Arbeitsbeginn';
        }else if(val == 'P') {
          res = 'Pausenzeit';
        }else if(val == 'L') {
          res = 'Feierabend';
        }else if(val == 'G') {
          res = 'Gleitzeit';
        }else if(val == 'R') {
          res = 'Verbleibend';
        }else {
          res = this;
        }

        syntax.push(res);
      }else {
        syntax.push($(this).val());
      }
    }
  });

  if(syntax.length % 2 == 0) {
    syntax.pop(); // no extra operators if not needed
  }

  module['syntax'] = syntax;
  console.log(module);
  return module;
}

function readData(key = null) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function(data) {
      if(chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }else {
        if(data !== null && data !== undefined) {
          if(key !== null && data[key] !== undefined) {
            resolve(data[key]);
          }else {
            resolve(data);
          }
        }else {
          $('#alert span').html('Lesen fehlgeschlagen');
          $('#alert').addClass('animate');
          reject('Lesen fehlgeschlagen');
        }
      }
    });
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
function clearData() {
  cD(function(response) {
    if(response) {
      console.log('clear success');
    }else {
      console.log('clear failed');
    }
  });
}
function wD(data, callback) {
  chrome.storage.local.set(data, function() {
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError); // logs error you see on other screenshot 
      callback(false); 
    }else {
      callback(true);
    }
  });
}
function cD(callback) {
  chrome.storage.local.clear(function() {
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      callback(false);
    }else {
      callback(true);
    }
  });
}

function updatePanel() {
  var data = {
    'usualPauseStart': '00:00:00',
    'usualPauseTime': '00:00:00',
    'modules': {
      0: {
        "id": 1,
        "title": "Gehen",
        "subtitle": "frühestens",
        "syntax": {
          0: "A",
          1: "+",
          2: "08:00:00",
          3: "+",
          4: "P",
          5: "-",
          6: "G",
        },
        'position': 5,
      },
      1: {
        "id": 2,
        "title": "Gehen",
        "subtitle": "vorraussichtlich",
        "syntax": {
          0: "A",
          1: "+",
          2: "08:00:00",
          3: "+",
          4: "P"
        },
        'position': 5,
      },
      2: {
        "id": 3,
        "title": "Pause",
        "subtitle": "spätestens",
        "syntax": {
          0: "A",
          1: "+",
          2: "06:00:00",
        },
        'position': 10,
      },
      3: {
        "id": 4,
        "title": "Verbleibend (h)",
        "subtitle": "Total",
        "syntax": {
          0: "R",
        },
        'position': 12,
      },
      4: {
        "id": 5,
        "title": "Verbleibend (h)",
        "subtitle": "Arbeitszeit",
        "syntax": {
          0: "R",
        },
        'position': 12,
      }
    },
  };
  
  // clearData();
  // writeData(data);
  $('div.list').html('<div class="step"><button name="append">+ Modul erstellen</button></div>');

  // proof everything is broken
  chrome.storage.local.get(null, function(data) {
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      $('#alert > span').html('<span style="max-width: 80%; font-size: 0.8rem;display:block; margin:0 auto;">'+chrome.runtime.lastError['message']+'</span>');
      $('#alert').addClass('animate');
    }else {
      console.log(data);
    }
  });

  // readData()
  //   .then((data) => {
  //     var usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : '00:30:00');
  //     var usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : '04:00:00');
  //     var modules = ((data['modules']) ? data['modules'] : {});
  //     document.getElementById('usualPauseStart').value = usualPauseStart;
  //     document.getElementById('usualPauseTime').value = usualPauseTime;

  //     if($(modules).length > 0) {
  //       $.each(modules, function(key, value) {
  //         $(value).each(function() {
  //           var id = ((this['id']) ? this['id'] : 1);
  //           var title = ((this['title']) ? this['title'] : '');
  //           var subtitle = ((this['subtitle']) ? this['subtitle'] : '');
  //           var position = ((this['position']) ? this['position'] : 1);

  //           var syntax = [];
  //           $.each(this['syntax'], function(step, val) {
  //             syntax.push(val);
  //           });
  //           var res = '';
  //           $(syntax).each(function() {
  //             if(this == 'A') {
  //               res += 'Arbeitsbeginn';
  //             }else if(this == 'P') {
  //               res += 'Pausenzeit';
  //             }else if(this == 'L') {
  //               res += 'Feierabend';
  //             }else if(this == 'G') {
  //               res += 'Gleitzeit';
  //             }else if(this == 'R') {
  //               res += 'Verbleibend';
  //             }else {
  //               res += this;
  //             }
  //             res += ' ';
  //           });
  
  //           $('div.list').append('<div class="order'+position+'"><span class="title" title="'+title+'">'+title+'</span><span class="subtitle" title="'+subtitle+'">'+subtitle+'</span><span class="syntax" title="'+res+'">'+res+'</span><button name="edit" value="'+id+'">Bearbeiten</button></div>');
  //         });
  //       });
  //     }

  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   }); 
}