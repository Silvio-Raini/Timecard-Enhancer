var nameIndexes = {
  'A': 'Arbeitsbeginn',
  'AW': 'Anwesenheit',
  'AB': 'Arbeitszeit',
  'P': 'Pausenzeit',
  'RP': 'restl. Pausenzeit',
  'L': 'Feierabend',
  'S': 'Sollarbeitszeit',
  'G': 'Gleitzeit',
  'R': 'Verbleibend',
}
var operatorSelectbox = '<select title="Operatoren auswählen"><option value="+" selected>+</option><option value="-">-</option></select>';

$(document).ready(async function() {
  resetEditor();
  await updatePanel();
  
  $('#alert').on('animationend', function() { // alert animation 
    $(this).removeClass('animate');
  });

  $(document).on('click', 'button[name="editSave"], button[name="save"]', async function() { // save
    $('div#editor').css('visibility','hidden');
    $('div#editor').css('opacity','0');
    await save();
  });

  $(document).on('change', 'div.input > div > select', function() { // time input
    if($(this).val() == 'time') {
      $(this).after('<input type="time" step="1"></input>');
      $(this).remove();
    }
  });

  $(document).on('click', 'button[name="add"]', function() { // add operator / variable
    if($('div.input > div').children().length % 2 == 0) {
       // even -> operator
      $(this).before(operatorSelectbox);
    }else {
      // uneven -> variable
      $(this).before(makeSelectbox);
    }
  });

  $(document).on('click', 'button[name="append"], button[name="edit"]', async function() {

    $('div#editor').html('<div class="input"><label for="editName" title="Bezeichnung des Moduls">Name*</label><input id="editName" name="editName" type="text"></div><div class="input"><label for="editBeschreibung" title="Beschreibung des Moduls">Beschreibung</label><input id="editBeschreibung" name="editBeschreibung" type="text"></div><div class="input" style="height: auto; padding-bottom: 1rem; min-height: auto;"><label title="Rechenweg des Moduls">Berechnung*</label><div>'+makeSelectbox()+'<button name="add"><i class="fa-solid fa-plus"></i></button></div></div><div class="input"><label for="editPosition" title="Position des Moduls">Position*</label><input id="editPosition" name="editPosition" type="number" step="1" min="1" value="1"></div>');
    $('div#editor').css('visibility', 'visible');
    $('div#editor').css('opacity', '1');

    if($(this).attr('name') == 'edit') {

      var editID = $(this).val();
      $('div#editor').append('<div><button name="editSave" title="Änderungen speichern"><i class="fa-solid fa-floppy-disk"></i></button> <button name="delete" value="'+$(this).val()+'" title="Entfernen"><i class="fa-solid fa-trash"></i></button></div>');
      $('button[name="editSave"]').attr('value', editID);

      var data = await readData('modules');
      console.log(data);
      var data = ((data['modules']) ? data['modules'] : []);
      $.each(data, function(key, value) {
        if(value['id'] == editID) {
          $('input[name="editName"]').val(value['title']);
          $('input[name="editBeschreibung"]').val(value['subtitle']);
          $('input[name="editPosition"]').val(value['position']);
          $('div.input > div select').remove();

          $(value['syntax']).each(function() {
            var res = '';
            if(this == 'A') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'AW') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'AB') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'P') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'RP') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'L') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'S') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'G') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == 'R') {
              res += makeSelectbox(key2val(this) + 1);
            }else if(this == '+') {
              res += '<select><option value="empty" disabled>Operator wählen</option><option value="+" selected>+</option><option value="-">-</option></select>';
            }else if(this == '-') {
              res += '<select><option value="empty" disabled>Operator wählen</option><option value="+">+</option><option value="-" selected>-</option></select>';
            }else {
              res += '<input type="time" step="1" value="'+this+'"></input>';
            }
            res += ' ';

            $('div.input > div').append(res);
            $('div.input > div button').insertAfter($('div.input > div > *:last-child'));
          });
        }else {
          console.log('no ID match');
        }
      });
    }else {
      $('div#editor').append('<div><button name="editSave" title="Änderungen speichern"><i class="fa-solid fa-floppy-disk"></i></button></div>');
    }
  });

  $(document).on('click', 'button[name="delete"]', function() {
    remove($(this).attr('value'));
  });

  $('body, body div:not(#editor), div:not(#editor) *').click((event) => { // close editor
    if($.contains($('div#editor')[0], event.target) || event.target.id == 'editor') {

    }else {
      if($('div#editor').css('visibility') == 'visible') {
        $('div#editor').css('visibility', 'hidden');
        $('div#editor').css('opacity', '0');
        resetEditor();
        $('#import').removeClass('visible');
        $('#export').removeClass('visible');
      }
    }
  });

  $(document).on('click', 'button[name="import"]', function() {
    $('#import').addClass('visible');
  });
  $(document).on('click', 'button[name="export"]', async function() {
    $('#export').addClass('visible');
    var data = await readData();
    $('#export > p').html(btoa(JSON.stringify(data)));
  });

  $(document).on('click', 'button[name="share"]', async function() {
    var id = $(this).val();
    console.log(id);
    var data = await readData('modules');
    data = ((data['modules']) ? data['modules'] : '');

    var json = '';
    $(data).each(function() {
      if(this['id'] == id) {
        json = JSON.stringify(this);
      }
    });
    if(json.length > 0) {
      $('#export > p').html(btoa(json));
    }
    $('#export').addClass('visible');
  });

  $(document).on('click', 'div#export, div#import', function(e) {
    if(e.target.id == 'import' || e.target.id == 'export') {
      $('#import').removeClass('visible');
      $('#export').removeClass('visible');
    }
  });
  $(document).on('click', '#export > p', function() {
    var value = $('#export > p').html();
    navigator.clipboard.writeText(value);

    $('#alert span').html('Daten kopiert');
    $('#alert').addClass('animate');
  });
  $(document).on('click', 'button[name="importSend"]', function() {
    var value = $('#import input[type="text"]').val();
    include(value);
  });

  $(document).keydown(function(e) {
    if(e.which == 13) {
      save();
    }else if(e.which == 118) {
      share();
    }else if(e.which == 119) {
      include();
    }
  });
});

async function readData(key = null) {
  var result = await chrome.storage.local.get(key);

  if(chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  }
    
  return result;
}

async function writeData(data) {
  if(typeof data !== undefined) {
    await chrome.storage.local.set(data);

    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      $('#alert span').html('Speichern fehlgeschlagen');
    }else {
      $('#alert span').html('Gespeichert');
    }
    $('#alert').addClass('animate');
     

    return;
  }
}
/* function clearData() 
async function clearData() {
  await chrome.storage.local.clear();

  if(chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    $('#alert span').html('Leeren fehlgeschlagen');
  }else {
    $('#alert span').html('Leeren erfolgreich');
  }
  $('#alert').addClass('animate');
   

  return;
}*/

async function remove(deleteID) {
  if(deleteID !== undefined && typeof(deleteID == 'number')) {
    var data = await readData();
    var modules = ((data['modules']) ? data['modules'] : []);

    var newModules = [];
    if($(modules).length > 0) {
      $.each(modules, function(key, value) {
        if(this['id'] != deleteID) {
          newModules.push(this);
        }else {
          console.log('Delete ID found, and dropped:');
          console.log(this);
        }
      });
    }

    data['modules'] = newModules;

    $('div#editor').css('visibility','hidden'); 
    $('div#editor').css('opacity', '0');
    $('button[name="edit"][value="'+deleteID+'"]').parent().remove();
    writeData(data);
  }
}

async function save() {
  var data = await readData();

  var usualPauseTime = '00:30:00';
  var usualPauseStart = '12:00:00';
  // var usualPauseTime = document.getElementById('usualPauseTime').value;
  // var usualPauseStart = document.getElementById('usualPauseStart').value;
  var modules = ((data['modules']) ? data['modules'] : []);

  var newModules = [];
  var editedModule = getEdit(); // gets addition or edit data
  var newIsEdit = false;
  var highestID = 1;

  if(editedModule != undefined) {

    if($(modules).length > 0) {
      $.each(modules, function(key, value) {
        $(value).each(function() {
          if(this['id'] > highestID) {
            highestID = this['id'];
          }
  
          if(editedModule['id'] == this['id']) {
            newIsEdit = true;
            this['title'] = editedModule['title'];
            this['subtitle'] = editedModule['subtitle'];
            this['position'] = editedModule['position'];
            this['syntax'] = editedModule['syntax'];
          } 
          newModules.push(this);
        });
      });
  
      if(newIsEdit == false && editedModule['title'] !== undefined && editedModule['syntax'].length > 0) { // when appending to existing
        editedModule['id'] = highestID + 1;
        newModules.push(editedModule);
      }
    }else {
      if(editedModule['title'].length > 0) {
        editedModule['id'] = highestID;
        newModules.push(editedModule);
      }
    }
  
    var newData = {
      'usualPauseStart': usualPauseStart,
      'usualPauseTime': usualPauseTime, 
      'modules': newModules
    };
    writeData(newData);    
  
    $('div#editor').html('');
    updatePanel();
    resetEditor();
  }else {
    var newData = {
      'usualPauseStart': usualPauseStart,
      'usualPauseTime': usualPauseTime,
      'modules': modules 
    };
    writeData(newData); 
  }
}

async function updatePanel() {
  $('div.list').html(''); 

  var data = await readData();
  if(typeof data == 'object') {
    var usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : '00:30:00');
    // document.getElementById('usualPauseTime').value = usualPauseTime;

    var usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : '04:00:00');
    // document.getElementById('usualPauseStart').value = usualPauseStart;

    var modules = ((data['modules']) ? data['modules'] : {});

    if($(modules).length > 0) {
      $.each(modules, function(key, value) {
        $(value).each(function() {
          var id = ((this['id']) ? this['id'] : 1);
          var title = ((this['title']) ? this['title'] : '');
          var subtitle = ((this['subtitle']) ? this['subtitle'] : '');
          var position = ((this['position']) ? this['position'] : 1);
          var syntax = ((this['syntax']) ? this['syntax'] : []);

          var res = '';
          $(syntax).each(function() {
            res += makeReadable(this);
            res += ' ';
          });
  
          $('div.list').append('<div class="order'+position+'"><span class="title" title="'+title+'">'+title+'</span><span class="subtitle" title="'+subtitle+'">'+subtitle+'</span><span class="syntax" title="'+res+'">'+res+'</span><button name="edit" value="'+id+'" title="Modul bearbeiten"><i class="fa-solid fa-pen"></i></button><button name="share" value="'+id+'" title="Modul exportieren"><i class="fa-solid fa-arrow-down-to-line"></i></button></div>');
        });
      });
    }
  }

  $('div.list').append('<div class="step"><button name="append" title="Modul erstellen"><i class="fa-solid fa-plus"></i> Modul erstellen</button></div>'); 
}

function key2val(param) {
  var iteration = 0;
  var result = 0;

  $(nameIndexes).each(function() {
    $.each(this, function(key, value) {
      if(key == param) {
        result = iteration;
      }
      iteration++;
    });
  });
  return result;
}

function getEdit(readable = false) {
  var id = $('button[name="editSave"]').attr('value');
  var module = {
    'id': ((id) ? id : null),
    'title': $('input[name="editName"]').val(),
    'subtitle': $('input[name="editBeschreibung"]').val(),
    'syntax':'',
    'position':$('input[name="editPosition"]').val(),
  };

  var syntax = [];
  var iteration = 0;

  $('div.input > div').children().each(function() {
    if($(this).is('select') || $(this).is('input')) {
      iteration++;

      if(readable) {
        syntax.push(makeReadable($(this).val()));
      }else {
        syntax.push($(this).val());
      }
    }
  });

  if(syntax.length % 2 == 0) {
    syntax.pop(); // removes last operator if overflow
  }

  module['syntax'] = syntax;
  
  resetEditor();

  if(typeof module['title'] === 'string' && module['title'].trim().length > 0 && module['syntax'].length > 0 && module['syntax'][0] !== null && module['position'].trim().length > 0) {
    return module;
  }else {
    return undefined;
  }
}

function makeReadable(val) {
  var res = '';

  $(nameIndexes).each(function() {
    $.each(this, function(key, value) {
      if(val == key) {
        res = value;
      }
    });
  });

  if(res == '') {
    res = val;
  }

  return res;
}

function makeSelectbox(selected = 0) {
  // var result = '<select><option value="empty" disabled selected>Variable wählen</option><option value="A">Arbeitsbeginn</option><option value="AW">Anwesenheit</option><option value="P">Pausenzeit</option><option value="L">Feierabend</option><option value="G">Gleitzeit</option><option value="R">Verbleibend</option><option value="time">Zeit</option></select>';
  var result = '';
  result += '<select title="Variable auswählen">';
  if(selected == 0) {
    result += ' <option value="empty" disabled'+((selected == 0) ? ' selected' : '')+'>Variable wählen</option>';
  }

  var iteration = 0;
  $(nameIndexes).each(function() {
    $.each(this, function(key, value) {
      iteration ++;
      result += ' <option value="'+key+'"'+((selected == iteration) ? ' selected' : '')+'>'+value+'</option>';
    });
  });

  result += ' <option value="time">Zeit</option>';
  result += '</select>';

  return result;
}

function resetEditor() {
  $('div#editor').html('<div class="input"><label for="editName" title="Bezeichnung des Moduls">Name*</label><input id="editName" name="editName" type="text"></div><div class="input"><label for="editBeschreibung" title="Beschreibung des Moduls">Beschreibung</label><input id="editBeschreibung" name="editBeschreibung" type="text"></div><div class="input" style="height: auto; padding-bottom: 1rem; min-height: auto;"><label title="Rechenweg des Moduls">Berechnung*</label><div>'+makeSelectbox()+'<button name="add"><i class="fa-solid fa-plus"></i></button></div></div><div class="input"><label for="editPosition" title="Position des Moduls">Position*</label><input id="editPosition" name="editPosition" type="number" step="1" min="1" value="1"></div><div><button name="editSave" title="Änderungen speichern"><i class="fa-solid fa-floppy-disk"></i></button></div>');
  $('input[name="editName"]').val('');
  $('input[name="editBeschreibung"]').val('');
  $('input[name="editPosition"]').val('');
  $('div#editor div.input > div').html('');
  $('div#editor').html('<div class="input"><label for="editName" title="Bezeichnung des Moduls">Name*</label><input id="editName" name="editName" type="text"></div><div class="input"><label for="editBeschreibung" title="Beschreibung des Moduls">Beschreibung</label><input id="editBeschreibung" name="editBeschreibung" type="text"></div><div class="input" style="height: auto; padding-bottom: 1rem; min-height: auto;"><label title="Rechenweg des Moduls">Berechnung*</label><div>'+makeSelectbox()+'<button name="add"><i class="fa-solid fa-plus"></i></button></div></div><div class="input"><label for="editPosition" title="Position des Moduls">Position*</label><input id="editPosition" name="editPosition" type="number" step="1" min="1" value="1"></div><div><button name="editSave" title="Änderungen speichern"><i class="fa-solid fa-floppy-disk"></i></button></div>');
}

/**
 * 
 */
async function share() {
  var data = await readData();
  console.log(btoa(JSON.stringify(data)));
}

/**
 * 
 * @param {string} input = btoa(JSON.stringify(obj))
 */
async function include(input) {
  var json = atob(input);
  if(isJson(json)) {
    var including_data = JSON.parse(json);
    var success = true;
    var highestID = 1;

    var usualPauseStart = await readData('usualPauseStart');
    var usualPauseTime = await readData('usualPauseTime');
    var modules = ((including_data['modules']) ? including_data['modules'] : including_data);
    console.log(including_data);
    console.log(modules);

    if($(modules.length > 0)) {
      var data = await readData('modules');
      data['modules'] = ((data['modules']) ? data['modules'] : []);

      $(data).each(function() {
        $.each(this, function() {
          $(this).each(function() {
            if(highestID < this['id']) {
              highestID = this['id'];
            }
          });
        });
      });
      
      $(modules).each(function() {
        highestID++;

        var appendingModule = {
          'id': highestID,
          'title': ((this['title'] && this['title'].length > 0) ? this['title'] : undefined),
          'subtitle': ((this['subtitle'] && this['subtitle'].length > 0) ? this['subtitle'] : ''),
          'syntax': ((this['syntax'] && $(this['syntax']).length > 0) ? this['syntax'] : undefined),
          'position': ((this['position'] && this['position'].length > 0) ? this['position'] : undefined)
        };

        if(appendingModule['title'] == undefined || appendingModule['syntax'] == undefined || appendingModule['position'] == undefined && success == true) {
          success = false;
        }else if(success == true) {
          console.log(data['modules']);
          console.log(appendingModule);
          data['modules'].push(appendingModule);
        }
      });


      var obj = {
        'usualPauseTime': ((usualPauseTime['usualPauseTime']) ? usualPauseTime['usualPauseTime'] : '00:30:00'),
        'usualPauseStart': ((usualPauseStart['usualPauseStart']) ? usualPauseStart['usualPauseStart'] : '12:00:00'),
        'modules': data['modules']
      };

      console.log(obj);
      writeData(obj);
      updatePanel();
    }

    if(success) {
      $('#alert span').html('Import erfolgreich!');
    }else {
      $('#alert span').html('Import fehlgeschlagen / unvollständig');
    }
    $('#alert').addClass('animate');
  }else {
    $('#alert span').html('Import-Daten sind Korrupt');
    $('#alert').addClass('animate');
  }

  // var data = await readData();
  // console.log(JSON.stringify(data));
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch(e) {
    return false;
  }
  return true;
}