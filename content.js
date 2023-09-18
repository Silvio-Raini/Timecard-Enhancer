function calcFeierabend() {
  var comeTimeElement = document.getElementById('firstco');
  var pauseTimeElement = document.getElementById('breaktime');
  var gleitzeitTimeElement = document.querySelector('#details-0 > table > tbody > tr:nth-child(4) > td.col-2.rsct-alignright');
  var tableBody = document.querySelector('#balances-daily tbody');

  if (comeTimeElement && pauseTimeElement && gleitzeitTimeElement && tableBody) {
    var comeTime = comeTimeElement.getAttribute('title');
    var pauseTime = pauseTimeElement.getAttribute('title');
    var gleitzeitTime = gleitzeitTimeElement.getAttribute('title');

    if (comeTime && pauseTime && gleitzeitTime) {

      readData()
        .then((data) =>  {
          var usualPauseTime = ((data['usualPauseTime']) ? data['usualPauseTime'] : '00:30:00');
          var usualPauseStart = ((data['usualPauseStart']) ? data['usualPauseStart'] : '12:00:00');

          var pauseTimes = splitTime(pauseTime);

          if(pauseTimes['hours'] == 0 && pauseTimes['minutes'] == 0 && pauseTimes['seconds'] == 0) {
            var pausenDauer = splitTime(usualPauseTime);
            pauseTime = unsplitTime(pausenDauer);
            livePauseTime = pauseTime;
          }else {
            livePauseTime = '00:00:00';
          }

          var leaveTime = calcNewTime(calcNewTime(comeTime, '8:00:00', 'add'), pauseTime);
              
          console.log('Arbeitsbeginn = A:'+comeTime);
          console.log('Typische Pausenzeit = P:'+pauseTime);
          console.log('Verbleibende Pausenzeit = LP:'+livePauseTime);
          console.log('Feierabend = L:'+leaveTime);
          console.log('Gleitzeit = G:'+gleitzeitTime);

          var modules = ((data['modules']) ? data['modules'] : {});

          if($(modules).length > 0) {

            $.each(modules, function(key, value) {
              $(value).each(function() {

                var id = key;
                var title = this['title'];
                var subtitle = this['subtitle'];
                var position = this['position'];
                if(position > 1) {
                  position --;
                }

                var syntax = [];
                $.each(this['syntax'], function(step, val) {
                  syntax.push(val);
                });

                var result = '00:00:00';
                var operator = '';
                var variable = '00:00:00';
                var iteration = 0;
                
                $(syntax).each(function() {
                  iteration ++;
                  // console.group(`Iteration(${iteration}) { this: ${this}, result: ${result} }`);
            
                  if(this == 'A') { // beginn
                    variable = comeTime;
                  }else if(this == 'P') { // pause
                    variable = pauseTime;
                  }else if(this == 'L') { // leave
                    variable = leaveTime;
                  }else if(this == 'G') { // gleitzeit
                    variable = gleitzeitTime;
                  }else if(this == 'R') { // rest
                    variable = calcRemainingTime(leaveTime);
                  }else if(this == '+') {
                    operator = '+';
                    variable = '';
                  }else if(this == '-') {
                    operator = '-';
                    variable = '';
                  }else if(this.includes(':')) {
                    variable = this;
                  }else {
                    variable = '00:00:00';
                  }
            
                  if(operator == '+' && variable.length > 0 || iteration == 1) {
                    operator = '';
                    result = calcNewTime(result, variable, 'add');
                    
                  }else if(operator == '-' && variable.length > 0) {
                    operator = '';
                    result = calcNewTime(result, variable, 'subtract');
                  }
                  // console.log(`Operator: ${operator}, Variable: ${variable}, Result: ${result}`)
                  // console.groupEnd();
            
                });
                // console.log(`modul+${id}, ${title}, ${subtitle}, ${result}, ${position}`);
                makeRow('modul'+id, title, subtitle, result, position);
              });
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}

function makeRow(id, title, subtitle, value, position, reached = false) {
  if($('#'+id).length) { // if exists
    $('#'+id).find('.rsct-align-right').innerHTML = value;
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
  var string = ''+ splittedTime['hours'].toString().padStart(2,'0')+':'+splittedTime['minutes'].toString().padStart(2,'0')+':'+splittedTime['seconds'].toString().padStart(2,'0');
  return string;
}

function calcRemainingTime(leaveTime) {
  var now = new Date();
  var currentHours = now.getHours();
  var currentMinutes = now.getMinutes();
  var currentSeconds = now.getSeconds();

  const leaveTimeParts = leaveTime.split(':');
  const leaveHours = parseInt(leaveTimeParts[0]);
  const leaveMinutes = parseInt(leaveTimeParts[1]);
  const leaveSeconds = parseInt(leaveTimeParts[2] || 0);

  const timeDifference = ((leaveHours - currentHours) * 3600 + (leaveMinutes - currentMinutes) * 60 + (leaveSeconds - currentSeconds));

  const hours = Math.floor(timeDifference / 3600);
  const minutes = Math.floor((timeDifference % 3600) / 60);
  const seconds = timeDifference % 60;

  var remainingTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  
  if(timeDifference < 0) {
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
          setTimeout(calcFeierabend, 1000);
        }
      }
    });

    observer.observe(targetNode, { childList: true });
  }
}

// Funktion zum Überprüfen und Initialisieren, sobald die Seite und die Tabelle geladen sind
function checkAndInit() {
  const workingProfile = document.querySelector("#workingprofile");
  if (workingProfile) {
    if (workingProfile.innerHTML != "") {
      initMutationObserver();
      calcFeierabend();
    } else {
      setTimeout(checkAndInit, 500); // Überprüfe alle 500 ms erneut
    }
  }

}

// Run the checkAndInit function when the page loads
window.addEventListener("load", checkAndInit);


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