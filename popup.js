// configurations
const nameIndexes = {
  'A': 'Arbeitsbeginn',
  'AW': 'Anwesenheit',
  'AB': 'Arbeitszeit',
  'P': 'Pausenzeit',
  'RP': 'restl. Pausenzeit',
  'GP': 'Pausenbeginn',
  'L': 'Feierabend',
  'S': 'Sollarbeitszeit',
  'G': 'Gleitzeit',
  'R': 'Verbleibend',
}
const operatorSelectbox = '<select title="Operatoren auswählen"><option value="+" selected>+</option><option value="-">-</option></select>';
const blankEditor = '<div class="input"><label for="editName" title="Bezeichnung des Moduls">Name*</label><input id="editName" name="editName" type="text"></div><div class="input"><label for="editBeschreibung" title="Beschreibung des Moduls">Beschreibung</label><input id="editBeschreibung" name="editBeschreibung" type="text"></div><div class="input" style="height: auto; padding-bottom: 1rem; min-height: auto;"><label title="Rechenweg des Moduls">Berechnung*</label><div>'+makeSelectbox()+'<button name="add" class="hover1"><i class="fa-solid fa-plus"></i></button></div></div><div class="input"><label for="editPosition" title="Position des Moduls">Position*</label><input id="editPosition" name="editPosition" type="number" step="1" min="1" value="1"></div>';
const editorAddAppend = '<div><button name="editSave" title="Änderungen speichern" class="hover1 hoverhop"><i class="fa-solid fa-floppy-disk"></i></button></div>';
const editorEditAppend = '<div><button name="editSave" title="Änderungen speichern" class="hover1 hoverhop"><i class="fa-solid fa-floppy-disk"></i></button> <button name="delete" value="0" title="Entfernen" class="hover1 hoverhop"><i class="fa-solid fa-trash"></i></button></div>';
const bootduration = 837; // ms

const gettingstarted = '<div id="frame_setup"> <div class="step0 visible"><img src="setup.gif"><button type="button" id="getting_started" title="Einrichtung beginnen" class="hover2 hoverarrow">Einrichten</button></div><div class="step1"><div class="top"><h3>URL der Timecard</h3><div class="input"><label for="url">Timecard URL</label><input name="url" type="text" value="https://timecard10-local.nol-is.de/" placeholder="https://google.com"></div></div><div class="bottom"><button type="button" name="back" title="Vorheriger Schritt" class="hover2" disabled>Zurück</button><button type="button" name="next" title="Nächster Schritt" class="hover2">Weiter</button></div></div><div class="step2"><div class="top"><h3>Deine gewöhnlichen Zeiten</h3><div class="input"><label for="usualPauseStart" title="Beginn deiner üblichen Pause">gewöhnlicher Pausenbeginn:</label><input id="usualPauseStart" name="usualPauseStart" type="time" step="1" value="12:00:00"></div><div class="input"><label for="usualPauseTime" title="Zeitspanne deiner üblichen Pause">gewöhnliche Pausendauer:</label><input id="usualPauseTime" name="usualPauseTime" type="time" step="1" value="00:30:00"></div><span>Diese Daten dienen ausschließlich der Berechnung und werden nicht anderwaltig benutzt.</span></div><div class="bottom"><button type="button" name="back" title="Vorheriger Schritt" class="hover2">Zurück</button><button type="button" name="next" title="Nächster Schritt" class="hover2">Weiter</button></div></div><div class="step3"><div class="top"><h3>Start-Module auswählen</h3><div><div class="item" value="eyJpZCI6MiwicG9zaXRpb24iOiI0Iiwic3VidGl0bGUiOiJ2b3JyYXVzc2ljaHRsaWNoIiwic3ludGF4IjpbIkwiXSwidGl0bGUiOiJHZWhlbiJ9"><p>Feierabend</p><span>Vorraussichtlicher Feierabend</span></div><div class="item" value="eyJpZCI6MywicG9zaXRpb24iOiI1Iiwic3VidGl0bGUiOiJmcvxoZXN0ZW5zIiwic3ludGF4IjpbIkwiLCItIiwiRyJdLCJ0aXRsZSI6IkdlaGVuIn0="><p>früherer Feierabend</p><span>Feierabend abzüglich Gleitzeit</span></div><div class="item" value="eyJpZCI6NCwicG9zaXRpb24iOiIxMCIsInN1YnRpdGxlIjoiIiwic3ludGF4IjpbIlIiXSwidGl0bGUiOiJWZXJibGVpYmVuZCAoaCkifQ=="><p>Verbleibend</p><span>bis zum Feierabend</span></div><div class="item" value="skip"><p>Ohne fortfahren</p></div></div></div><div class="bottom"><button type="button" name="back" title="Vorheriger Schritt" class="hover2">Zurück</button><button type="button" name="next" title="Fortfahren" class="hover2 hide">Fortfahren</button></div></div> </div>';

$(document).ready(async function() {
  var url = await readData('url');
  if(!isUndefined(url['url'])) {
    $('h1>a').attr('href', url['url'])
  }

  resetEditor();
  await updatePanel();
  // initialisation
  $('#frame_start').addClass('visible');
  setTimeout(async () => {
    $('#frame_start').removeClass('visible');

    var data = await readData();
    if(isUndefined(data['url']) == true || isUndefined(data['usualPauseTime']) == true || isUndefined(data['usualPauseStart']) == true) {
      $('body').append(gettingstarted);
      $('#frame_setup').addClass('visible');
    }else {
      $('#frame_main').addClass('visible');
    }
    $('#frame_start').remove();
    delete data;
  }, bootduration);

  
  $(document).on('change', 'input[name="url"]', function() {
    var val = $(this).val();
    if(isURL(val)) {
      $('div.step1 button[name="next"]').removeAttr('disabled');
    }else {
      $('div.step1 button[name="next"]').attr('disabled', '');
    }
  });

  $(document).on('change', 'input[name="settings_url"]', function() {
    var val = $(this).val();
    console.log(val);
    console.log(isURL(val));
    if(isURL(val)) {
      $('#frame_settings button[name="save"]').removeAttr('disabled');
    }else {
      $('#frame_settings button[name="save"]').attr('disabled', '');
    }
  });

  $(document).on('click', '#frame_setup > div.step3 > div.top > div > div.item:not([value="skip"])', function() {
    $(this).toggleClass('selected');

    if($('#frame_setup > div.step3 > div.top > div > div.item.selected').length > 0) {
      $('#frame_setup > div.step3 button[name="next"]').removeClass('hide');
    }else {
      $('#frame_setup > div.step3 button[name="next"]').addClass('hide');
    }
  });

  $(document).on('click', '#frame_setup > div.step3 div.item[value="skip"]', function() {
    $('#frame_setup').removeClass('visible');
    $('#frame_setup > div.step3').removeClass('visible');
    $('#frame_setup').remove();
    $('#frame_main').addClass('visible');
  });

  $(document).on('click', '#getting_started', function() {
    // toggle next step frame inside #frame_setup
    // ...
    $('#frame_setup > div.visible').each(function() {
      $(this).removeClass('visible');
    });
    $('#frame_setup > div.step1').addClass('visible');
  });

  $(document).on('click', 'button[name="back"]', function() {
    $('#frame_setup > div.visible').each(function() {
      $(this).removeClass('visible');
    });

    var id = $(this).parent().parent().attr('class').slice(4);
    id --;
    if($('#frame_setup > div.step'+id).length > 0) {
      $('#frame_setup > div.step'+id).addClass('visible');
    }
  });
  $(document).on('click', 'button[name="next"]', async function() {
    $('#frame_setup > div.visible').each(function() {
      $(this).removeClass('visible');
    });

    var id = $(this).parent().parent().attr('class').slice(4);
    id ++;
    if($('#frame_setup > div.step'+id).length > 0) {
      $('#frame_setup > div.step'+id).addClass('visible');
    }else {
      // when selection stuff
      var imports = [];
      $('#frame_setup > div.step3 > div.top > div > div.item.selected').each(function() {
        imports.push($(this).attr('value'));
      });

      var result = [];
      $(imports).each(async function() {
        result.push(JSON.parse(atob(this)));
      });
      await include(btoa(JSON.stringify(result)));

      $('#frame_setup').removeClass('visible');
      $('#frame_setup > div.step3').removeClass('visible');
      console.log('remove');
      $('#frame_setup').remove();
      $('#frame_main').addClass('visible');
    }
  });

  $(document).on('click', 'div#frame_setup > div.step2 button[name="next"]', async function() {
    await setupSave();
  });

  $(document).on('click', 'button[name="open_settings"]', function() {
    $('#frame_main').removeClass('visible');
    $('#frame_settings').addClass('visible');
    $('#alert').detach().appendTo('#frame_settings');
  });


  // save
  $(document).on('click', 'button[name="editSave"], button[name="save"]', async function() { // save
    $('div#editor').removeClass('visible');
    await save();
  });

  $(document).on('click', '#frame_settings button[name="return"]', async function() {
    var data = await readData();
    var url = ((data['url']) ? data['url'] : 'https://timecard10-local.nol-is.de/');
    $('#settings_url').val(url);

    var usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : '00:30:00');
    $('#settings_usualPauseTime').val(usualPauseTime);

    var usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : '12:00:00');
    $('#settings_usualPauseStart').val(usualPauseStart);

    $('#frame_settings button[name="save"]').removeAttr('disabled');

    await updatePanel();
    $('div#frame_settings').removeClass('visible');
    $('div#frame_main').addClass('visible');
    $('#alert').detach().appendTo('#frame_main');
  });

  $(document).on('click', '#frame_settings button[name="reset"]', async function() {
    await clearData();
    window.close();
  });

  // editor fix
  $(document).on('change', 'div.input > div > select', function() { // set time input
    if($(this).val() == 'time') {
      $(this).after('<input type="time" step="1"></input>');
      $(this).remove();
    }
  });
  $(document).on('click', 'button[name="add"]', function() { // add operator / variable
    if($('div.input > div').children().length % 2 == 0) { // even -> operator
      $(this).before(operatorSelectbox);
    }else { // uneven -> variable
      $(this).before(makeSelectbox);
    }
  });

  // editor 
  $(document).on('click', 'button[name="append"], button[name="edit"]', async function() {
    $('div#editor > div.wrapper').html(blankEditor);
    $('div#editor').addClass('visible');


    if($(this).attr('name') == 'edit') {

      var editID = $(this).val();
      $('div#editor > div.wrapper').append(editorEditAppend);
      $('div#editor > div.wrapper button[name="delete"]').attr('value', $(this).val());

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
            }else if(this == 'GP') {
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

      delete data;
    }else {
      $('div#editor > div.wrapper').append(editorAddAppend);
    }
  });

  // delete
  $(document).on('click', 'button[name="delete"]', function() {
    remove($(this).attr('value'));
  });

  // import export modal
  $(document).on('click', 'button[name="import"]', function() {
    $('#import').addClass('visible');
  });
  $(document).on('click', 'button[name="export"]', async function() {
    $('#export').addClass('visible');
    var data = await readData();
    $('#export > p').html(btoa(JSON.stringify(data)));
    delete data;
  });

  $(document).on('click', 'button[name="export_single"]', async function() {
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

    delete data;
    delete id;
  });

  $(document).on('click', 'div#export, div#import', function(e) {
    if(e.target.id == 'import' || e.target.id == 'export') {
      $('#import').removeClass('visible');
      $('#export').removeClass('visible');
    }
  });
  $('body, body div:not(#editor), div:not(#editor) *').click((event) => { // close editor
    if($.contains($('div#editwrap')[0], event.target) || event.target.id == 'editwrap') {

    }else {
      if($('div#editor').css('visibility') == 'visible') {
        $('div#editor').removeClass('visible'); 
        resetEditor();
        $('#import').removeClass('visible');
        $('#export').removeClass('visible');
      }
    }
  });

  // copy
  $(document).on('click', '#export > p', function() {
    var value = $('#export > p').html();
    navigator.clipboard.writeText(value);
    delete value;

    $('#alert span').html('Daten kopiert');
    $('#alert').addClass('animate');
  });

  // importing
  $(document).on('click', 'button[name="importSend"]', async function() {
    var value = $('#import input[type="text"]').val();
    await include(value);
    delete value;
  });

  $('#alert').on('animationend', function() { // alert animation 
    $(this).removeClass('animate');
  });
});


async function readData(key = null) {
  var result = await chrome.storage.local.get(key);

  if(chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return [];
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

    $('div#editor').removeClass('visible');

    $('button[name="edit"][value="'+deleteID+'"]').parent().remove();
    writeData(data);
  }
}

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
}

async function save() {
  var data = await readData();

  // var url = 'https://timecard10-local.nol-is.de/';
  // var usualPauseTime = '00:30:00';
  // var usualPauseStart = '12:00:00';

  var url = $('#settings_url').val();
  var usualPauseStart = $('#settings_usualPauseStart').val(); 
  var usualPauseTime = $('#settings_usualPauseTime').val();

  var modules = ((data['modules']) ? data['modules'] : []);

  delete data;

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
            this['result'] = 'NAN';
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
      'url': url,
      'usualPauseStart': usualPauseStart,
      'usualPauseTime': usualPauseTime, 
      'modules': newModules
    };
    console.log(newData);
    writeData(newData);    
  
    $('div#editor > div.wrapper').html('');
    updatePanel();
    resetEditor();
  }else {
    var newData = {
      'url': url,
      'usualPauseStart': usualPauseStart,
      'usualPauseTime': usualPauseTime,
      'modules': modules 
    };
    console.log(newData);
    writeData(newData); 
  }
}

async function setupSave() {
  url = $('input[name="url"]').val();
  usualPauseStart = $('input[name="usualPauseStart"]').val();
  usualPauseTime = $('input[name="usualPauseTime"]').val();
  var newData = {
    'url': url,
    'usualPauseStart': usualPauseStart,
    'usualPauseTime': usualPauseTime,
    'modules': [],
  };

  jQuery(document).find('#frame_main > h1 > a').attr('href', url);
  writeData(newData); 
  updatePanel();
  resetEditor();
}

/**
 * 
 * @param {string} from (hh:mm:ss)
 * @param {string} value (hh:mm:ss)
 * @param {string} calcmethod (add / substract)
 * @returns {string} result (hh:mm:ss)
 */
function calcNewTime(from, value, calcmethod = 'add') {
  if(from.includes(':') && from.length >= 5 && value.includes(':') && value.length >= 5) {
    fromParts = from.split(':');
    fromHours = parseInt(fromParts[0] || 0);
    fromMinutes = parseInt(fromParts[1] || 0);
    fromSeconds = parseInt(fromParts[2] || 0); // if not exists

    valueParts = value.split(':');
    valueHours = parseInt(valueParts[0] || 0);
    valueMinutes = parseInt(valueParts[1] || 0);
    valueSeconds = parseInt(valueParts[2] || 0); // if not exists

    switch(calcmethod) {
      default:
      case 'add':
        var resultHours = fromHours + valueHours;
        var resultMinutes = fromMinutes + valueMinutes;
        var resultSeconds = fromSeconds + valueSeconds;
        break;
      case 'subtract':
        var resultHours = fromHours - valueHours;
        var resultMinutes = fromMinutes - valueMinutes;
        var resultSeconds = fromSeconds - valueSeconds;
        break;
    }

    // fix time
    if (resultSeconds >= 60) {
      resultMinutes += Math.floor(resultSeconds / 60);
      resultSeconds %= 60;
    }
    if (resultMinutes >= 60) {
      resultHours += Math.floor(resultMinutes / 60);
      resultMinutes %= 60;
    }

    if(resultSeconds < 0) {
      resultMinutes --;
      resultSeconds += 60;
    }
    if(resultMinutes < 0) {
      resultHours --;
      resultMinutes += 60;
    }

    var result = resultHours.toString().padStart(2, '0') + ':' + resultMinutes.toString().padStart(2, '0') + ':' + resultSeconds.toString().padStart(2, '0');
    return result; 
  }else {
    return '00:00:00';
  }
}

function splitTime(time) {
  var result = [];

  if(time.includes(':')) {
    var timeParts = time.split(':');
    result['hours'] = parseInt(timeParts[0]);
    result['minutes'] = parseInt(timeParts[1]);
    result['seconds'] = parseInt(timeParts[2] || 0);
  }else {
    console.log('not containing ":"');
    result['hours'] = 0;
    result['minutes'] = 0;
    result['seconds'] = 0;
  }

  return result
} 

function unsplitTime(splittedTime) {
  splittedTime['hours'] = ((splittedTime['hours']) ? splittedTime['hours'] : (splittedTime[0]) ? splittedTime[0] : 0);
  splittedTime['minutes'] = ((splittedTime['minutes']) ? splittedTime['minutes'] : (splittedTime[1]) ? splittedTime[1] : 0);
  splittedTime['seconds'] = ((splittedTime['seconds']) ? splittedTime['seconds'] : (splittedTime[2]) ? splittedTime[2] : 0);

  var string = ''+ splittedTime['hours'].toString().padStart(2,'0')+':'+splittedTime['minutes'].toString().padStart(2,'0')+':'+splittedTime['seconds'].toString().padStart(2,'0');
  return string;
}

function calcRemainingTime(leaveTime) {
  var now = new Date();
  var currentHours = now.getHours();
  var currentMinutes = now.getMinutes();
  var currentSeconds = now.getSeconds();

  const leaveTimeParts = splitTime(leaveTime);

  const timeDifference = ((leaveTimeParts['hours'] - currentHours) * 3600 + (leaveTimeParts['minutes'] - currentMinutes) * 60 + (leaveTimeParts['seconds'] - currentSeconds));

  const hours = Math.floor(timeDifference / 3600);
  const minutes = Math.floor((timeDifference % 3600) / 60);
  const seconds = timeDifference % 60;
  var newTime = {
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds,
  };

  var remainingTime = unsplitTime(newTime);
  
  if(timeDifference < 0) { // wenn überstunden
    var addition = Math.abs(timeDifference);
    var remainingTime = new Date(addition * 1000).toISOString().substring(11, 19);
    var remainingTime = '+'+remainingTime;
  }
  return remainingTime;
}

async function updatePanel() {
  $('div.list').html(''); 

  var data = await readData();
  if(typeof data == 'object') {
    var url = ((data['url']) ? data['url'] : 'https://timecard10-local.nol-is.de/');
    $('#settings_url').attr('value', url);

    var usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : '00:30:00');
    $('#settings_usualPauseTime').attr('value', usualPauseTime);

    var usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : '12:00:00');
    $('#settings_usualPauseStart').attr('value', usualPauseStart);

    var modules = ((data['modules']) ? data['modules'] : {});
    var variables = ((data.variables ? data.variables : {}));

    var today = new Date();
    if(variables.date != today.toDateString()) {
      console.log(today.toDateString());
      variables = {};
    }
    console.log(variables);
    delete data;

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

          
            var result = '00:00:00';
            // var result = 'NAN';
            console.log(variables, Object.keys(variables).length);
          if(Object.keys(variables).length > 0) {
            var result = '00:00:00';
            var operator = 'add';
            var variable = '00:00:00';
            var iteration = 0;

            var now = [];
            now['hours'] = today.getHours();
            now['minutes'] = today.getMinutes();
            now['seconds'] = today.getSeconds();
            now = unsplitTime(now);
            
            variables['AW'] = calcNewTime(now, variables['A'], 'subtract'); // Time now - A (Arbeitsbeginn) 
            variables['AB'] = calcNewTime(calcNewTime(now, variables['A'], 'subtract'), variables['P'], 'subtract'); // Time now - A - pausenzeit
            variables['L'] = calcNewTime(calcNewTime(variables['A'], variables['S'], 'add'), variables['P'], 'add');
            variables['R'] = calcRemainingTime(variables['L']);
            
            $(syntax).each(function() {
              iteration++;
                
              if(this == 'A') {
                variable = variables[this];
              }else if(this == 'AW') {
                variable = variables[this];
              }else if(this == 'AB') {
                variable = variables[this];
              }else if(this == 'RP') {
                variable = variables[this];
              }else if(this == 'GP') {
                variable = variables[this];
              }else if(this == 'P') {
                variable = variables[this];
              }else if(this == 'L') {
                variable = variables[this];
              }else if(this == 'S') {
                variable = variables[this];
              }else if(this == 'G') {
                variable = variables[this];
              }else if(this == 'R') {
                variable = variables[this];
              }else if(this == '+') {
                operator = 'add';
                variable = '';
              }else if(this == '-') {
                operator = 'subtract';
                variable = '';
              }else if(this.includes(':')) {
                variable = this;
              }else {
                variable = '00:00:00';
              }


              if(operator.length > 0 && variable.length > 0) {
                result = calcNewTime(result, variable, operator);
                operator = '';
              }
            });
          }
  
          $('div.list').append('<div class="order'+position+'"><span class="title" title="'+title+'">'+title+'</span><span class="subtitle" title="'+subtitle+'">'+subtitle+'</span><span class="syntax" title="'+res+'">'+res+'</span><span class="time" title="'+result+'">'+(result != 'NAN' ? ((result.charAt(0) == '0') ? result.substring(1, result.length - 3) : result.substring(0, result.length - 3)) : result)+'</span><button name="edit" value="'+id+'" title="Modul bearbeiten" class="hover1"><i class="fa-solid fa-pen"></i></button><button name="export_single" value="'+id+'" title="Modul exportieren" class="hover1"><i class="fa-solid fa-arrow-down-to-line"></i></button></div>');
        });
      });
    }
  }

  $('div.list').append('<div class="step"><button name="append" title="Modul erstellen" class="hover1"><i class="fa-solid fa-plus"></i> Modul erstellen</button></div>'); 
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
    'result':'NAN',
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
  $('div#editor > div.wrapper').html(blankEditor);
  $('input[name="editName"]').val('');
  $('input[name="editBeschreibung"]').val('');
  $('input[name="editPosition"]').val('');
  $('div#editor div.input > div').html('');
  $('div#editor > div.wrapper').html(blankEditor);
}

/**
 * 
 */
async function share() {
  var data = await readData();
  console.log(btoa(JSON.stringify(data)));
  delete data;
}

/**
 * 
 * @param {string} input = btoa(JSON.stringify(obj))
 */
async function include(input) {
  console.log('Import Start');
  var json = atob(input);
  if(isJson(json)) {
    var including_data = JSON.parse(json);
    var success = true;
    var highestID = 1;

    var url = await readData('url');
    var usualPauseStart = await readData('usualPauseStart');
    var usualPauseTime = await readData('usualPauseTime');
    var modules = ((including_data['modules']) ? including_data['modules'] : including_data);
    console.log('read:', usualPauseStart, usualPauseTime);
    console.log('appending:', modules);
    // console.log(including_data);
    // console.log(modules);

    if($(modules.length > 0)) {
      var data = await readData('modules');      
      data['modules'] = ((data['modules']) ? data['modules'] : []);

      console.log('read:', data['modules']);

      $(data).each(function() {
        $.each(this, function() {
          $(this).each(function() {
            console.log(this);
            if(highestID < this['id']) {
              highestID = this['id'];
              console.log('new high is: '+highestID);
            }
          });
        });
      });
      
      $(modules).each(function() {
        console.log('each appending Module:',this);
        highestID++;

        var appendingModule = {
          'id': highestID,
          'title': ((this['title'] && this['title'].length > 0) ? this['title'] : undefined),
          'subtitle': ((this['subtitle'] && this['subtitle'].length > 0) ? this['subtitle'] : ''),
          'syntax': ((this['syntax'] && $(this['syntax']).length > 0) ? this['syntax'] : undefined),
          'result': 'NAN',
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
        'url': ((url['url']) ? url['url'] : 'https://timecard10-local.nol-is.de/'),
        'usualPauseTime': ((usualPauseTime['usualPauseTime']) ? usualPauseTime['usualPauseTime'] : '00:30:00'),
        'usualPauseStart': ((usualPauseStart['usualPauseStart']) ? usualPauseStart['usualPauseStart'] : '12:00:00'),
        'modules': data['modules']
      };
      console.log('obj', obj);

      // console.log(obj);
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

  delete obj;
  delete json;
  delete data;

  console.log('import end');
  return;
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
function isURL(str) {
  const urlRegex = /^(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
  return urlRegex.test(str);
}
function isUndefined(value) {
  if(value === undefined || value === 'undefined') {
    return true;
  }
  return false;
}