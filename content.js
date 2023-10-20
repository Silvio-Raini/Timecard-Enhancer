var config = {
  'usualPauseStart': '12:00:00',
  'usualPauseTime': '00:30:00',
}

async function updateFrame() {
  var data = await readData();
  config.usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : config.usualPauseStart);
  config.usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : config.usualPauseTime);

  var variables = await getVariables();

  var modules = ((data['modules']) ? data['modules'] : []);
  
  if($(modules).length > 0) {
    await $.each(modules, async function(key, value) {
      $(value).each(async function() {
        var id = key;
        var title = this['title'];
        var subtitle = this['subtitle'];
        var position = ((this['position'] > 1) ? this['position']-- : this['position']);
        var syntax = this['syntax'];

        var result = '00:00:00';
        var operator = 'add';
        var variable = '00:00:00';
        var iteration = 0;
        
        await $(syntax).each(async function() {
          iteration++;
          // console.group(`Iteration(${iteration}) { this: ${this}, result: ${result} }`);
            
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
          // console.log(`Operator: ${operator}, Variable: ${variable}, Result: ${result}`)
          // console.groupEnd();
        });
        // console.log(`modul+${id}, ${title}, ${subtitle}, ${result}, ${position}`);
        await makeRow('modul'+id, title, subtitle, result, position);
      });
    });
  }

  
  var data = await readData();
  data.variables = await getVariables();
  data.variables.date = new Date().toDateString();
  await writeData(data);
}

async function getVariables() {
  // reading
  var kommenTime = $('#firstco').attr('title');
  var pausenzeitTime = $('#breaktime').attr('title');
  var anwesenheitTime = $('#totaltime').attr('title');
  var arbeitszeitTime = $('#workingtime').attr('title');
  var sollarbeitszeitTime = $('#targettime').attr('title');
  var gleitzeitTime = $('#details-0 > table > tbody > tr:nth-child(4) > td.col-2.rsct-alignright').attr('title');
  if(typeof gleitzeitTime == 'undefined') {
    gleitzeitTime = $('#details-0 > table > tbody > tr:nth-child(2) > td.col-2.rsct-alignright').attr('title');
  }
  // calculating
  var restpauseTime = null;
  var pausenzeitTimes = splitTime(pausenzeitTime);
  if(pausenzeitTimes['hours'] == 0 && pausenzeitTimes['minutes'] == 0 && pausenzeitTimes['seconds'] == 0) {
    pausenzeitTimes = unsplitTime(splitTime(config.usualPauseTime)); // split + unsplit = fix time (valid)
    restpauseTime = pausenzeitTimes;
  }else {
    pausenzeitTimes = unsplitTime(pausenzeitTimes);
    restpauseTime = '00:00:00'; // geht besser
  }
  var gewoenlichPauseBegineTime = unsplitTime(splitTime(config.usualPauseStart));
  

  var gehenTime = calcNewTime(calcNewTime(kommenTime, '08:00:00', 'add'), pausenzeitTimes, 'add');
  var verbleibendTime = calcRemainingTime(gehenTime);

  var variables = {
    'A': kommenTime, // kommen
    'AW': anwesenheitTime, // anwesenheit
    'AB': arbeitszeitTime, // arbeitszeit
    'P': pausenzeitTimes, // pause gewöhnlich
    'RP': restpauseTime, // restpause
    'GP': gewoenlichPauseBegineTime, // gewöhnlicher Pausenbeginn
    'G': gleitzeitTime, // gleitzeit
    'S': sollarbeitszeitTime, // gleitzeit
    'L': gehenTime, // gehen
    'R': verbleibendTime, // verbleibend
  };
  return variables;
}

async function readData(key = null) {
  var result = await chrome.storage.local.get(key);

  if(chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    $('div.alert span').html('Lesen fehlgeschlagen');
    result = null;
  }else {
    $('div.alert span').html('Lesen erfolgreich');
  }
  // $('div.alert').addClass('animate');
    
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

async function makeRow(id, title, subtitle, value, position, reached = false) {  
  var selector = '#'+id;
  if($(selector).length) { // if exists
    $(selector+' > td.col-2').html(((value.charAt(0) == '0') ? value.substring(1, value.length - 3) : value.substring(0, value.length - 3)));
    $(selector+' > td.col-2').attr('title', value);
  }else {
    var newRow = document.createElement('tr');
    newRow.setAttribute("id", id);
    newRow.className = 'd-flex';
    var rowPrefix = '<td class="col-1"></td><td class="col-8" title="Ergänzt durch die Chrome-Extension Timecard Enhancer™"'+((reached) ? ' style="color: #1acd1a;"' : '')+'>';
    newRow.innerHTML = rowPrefix+title+'<span style="font-size: 1rem;opacity: 0.75;position: absolute;top: 50%;right: -4.5rem;transform: translateY(-50%);">'+subtitle+'</span></td><td class="col-2 rsct-alignright" title="'+value+'">'+((value.charAt(0) == '0') ? value.substring(1, value.length - 3) : value.substring(0, value.length - 3)) + '</td>';

    
  
    $('#balances-daily tbody tr:nth-child('+position+')').after(newRow);
  }
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

// Funktion zur Initialisierung des Mutation Observers
function initMutationObserver() {
  const targetNode = document.querySelector(".rsct-header.date-header");

  if (targetNode) {
    const observer = new MutationObserver(function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          setTimeout(updateFrame, 1000);
        }
      }
    });

    observer.observe(targetNode, { childList: true });
  }
}

// Funktion zum Überprüfen und Initialisieren, sobald die Seite und die Tabelle geladen sind
async function checkAndInit() {
  var url = await readData('url');
  if($(url).length !== 0 && window.location.href.includes(url['url'])) {

    const workingProfile = document.querySelector("#workingprofile");
    if (workingProfile) {
      if (workingProfile.innerHTML != "") {
        initMutationObserver();
        updateFrame();
        if($('#timecard_enhancer_addition_1').length == 0) {
          $('body').append('<span id="timecard_enhancer_addition_1" style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); font-size: 1.5rem; opacity: 0.5;">Drücke [R] um zu aktualisieren</span>');
        }
        
      } else {
        setTimeout(checkAndInit, 500); // Überprüfe alle 500 ms erneut
      }
    }
  }
}

// Run the checkAndInit function when the page loads
window.addEventListener("load", checkAndInit);
        
setInterval(function() {  dispatchEvent(new Event('load')); }, 60000);

$(document).on('keypress', function(e) {
  if(e.which == 114) {
    console.log('refresh');
    dispatchEvent(new Event('load'));
  }
});