function calcFeierabend() {
  var comeTimeElement = document.getElementById('firstco');
  var pauseTimeElement = document.getElementById('breaktime');
  var gleitzeitTimeElement = document.querySelector('#details-0 > table > tbody > tr:nth-child(4) > td.col-2.rsct-alignright');
  var tableBody = document.querySelector('#balances-daily tbody');

  var config = {
    'standard_pausenzeit': 30, // config panel typical pause times, default: 30 min.
  };

  var modules = {
    0: {
      "title": "Gehen",
      "subtitle": "frühestens",
      "syntax": {
        0: "A",
        1: "+",
        2: "8:00:00",
        3: "+",
        4: "P",
        5: "-",
        6: "G",
      },
      'position': 5,
    },
    1: {
      "title": "Gehen",
      "subtitle": "vorraussichtlich",
      "syntax": {
        0: "A",
        1: "+",
        2: "8:00:00",
        3: "+",
        4: "P"
      },
      'position': 5,
    },
    2: {
      "title": "Pause",
      "subtitle": "spätestens",
      "syntax": {
        0: "A",
        1: "+",
        2: "6:00:00",
      },
      'position': 10,
    },
    3: {
      "title": "Verbleibend (h)",
      "subtitle": "",
      "syntax": {
        0: "R",
      },
      'position': 12,
    }
  }

  if (comeTimeElement && pauseTimeElement && gleitzeitTimeElement && tableBody) {
    var comeTime = comeTimeElement.getAttribute('title');
    var pauseTime = pauseTimeElement.getAttribute('title');
    var gleitzeitTime = gleitzeitTimeElement.getAttribute('title');

    if (comeTime && pauseTime && gleitzeitTime) {
      var pauseTimes = splitTime(pauseTime);

      if(pauseTimes['hours'] == 0 && pauseTimes['minutes'] == 0 && pauseTimes['seconds'] == 0) {
        pauseTimes['minutes'] = config['standard_pausenzeit'];
        pauseTime = unsplitTime(pauseTimes);
      }

      var leaveTime = calcNewTime(calcNewTime(comeTime, '8:00:00', 'add'), pauseTime);

      console.log('A:'+comeTime);
      console.log('P:'+pauseTime);
      console.log('L:'+leaveTime);
      console.log('G:'+gleitzeitTime);
      
      $.each(modules, function(key, value) {
        $(value).each(function() {
          var id = key;
          var title = this['title'];
          var subtitle = this['subtitle'];
          var position = this['position'];
          position --;
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
            console.group(`Iteration(${iteration}) { this: ${this}, result: ${result} }`);

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
            console.log(`Operator: ${operator}, Variable: ${variable}, Result: ${result}`)
            console.groupEnd();

          });

          makeRow('modul'+iteration, title, subtitle, result, position);

        });
      });

      /*
      var pauseTimeParts = pauseTime.split(':');
      var pauseHours = parseInt(pauseTimeParts[0]);
      var pauseMinutes = parseInt(pauseTimeParts[1]);
      var pauseSeconds = parseInt(pauseTimeParts[2] || 0);

      if(pauseHours == 0 && pauseMinutes == 0 && pauseSeconds == 0) {
        pauseMinutes = config['standard_pausenzeit'];
      }

      var leaveTime = calcNewTime(comeTime.toString(), (pauseHours + 8).toString().padStart(2, '0')+':'+pauseMinutes.toString().padStart(2, '0')+':'+pauseSeconds.toString().padStart(2, '0'));

      var remainingTime = calcRemainingTime(leaveTime);

      var earlyEndTime = calcNewTime(leaveTime.toString(), gleitzeitTime.toString(), 'subtract');

      var ltsPauseTime = calcNewTime(comeTime, '06:00:00', 'add');

      
      var existingPauseRow = document.getElementById('ltspause');
      var existingeErlyEndRow = document.getElementById('earlyend');
      var existingFeierabendRow = document.getElementById("feierabend");
      var existingReamingtimeRow = document.getElementById("remeaningtime");

      if(pauseSeconds == 0 && pauseMinutes == 30 && pauseHours == 0) { // solange Pause absolut perfekt ist bzw. nicht begonnen wurde:
        if (existingPauseRow) {
          existingPauseRow.querySelector('.rsct-align-right').innerText = ltsPauseTime;
        } else {
          makeRow('ltspause', 'Pause <span style="font-size: 1rem;opacity: 0.75;position: absolute;top: 50%;right: -4.5rem;transform: translateY(-50%);">spätmöglichst</span></td><td class="col-2 rsct-alignright" title="'+ltsPauseTime+'">'+ltsPauseTime.substring(0, ltsPauseTime.length - 3) + '</td>', '#balances-daily tbody tr:nth-child(4)');
        } 
      }

      if (existingReamingtimeRow) {
        existingReamingtimeRow.querySelector('.rsct-alignright').innerText = remainingTime;
      } else {
        makeRow('remeaningtime', 'Verbleibend (h)</td><td class="col-2 rsct-alignright" title="'+remainingTime+'">' + ((remainingTime.includes('+')) ? remainingTime.substring(0, remainingTime.length - 3) : remainingTime.substring(1, remainingTime.length - 3)) + '</td>', '#balances-daily tbody tr:nth-child(9)');
      }

      if (existingFeierabendRow) {
        existingFeierabendRow.querySelector('.rsct-alignright').innerText = leaveTime;
      } else {
        makeRow('feierabend', 'Gehen <span style="font-size: 1rem;opacity: 0.75;position: absolute;top: 50%;right: -4.5rem;transform: translateY(-50%);">vorraussichtlich</span></td><td class="col-2 rsct-alignright" title="'+leaveTime+'">' + leaveTime.substring(0, leaveTime.length - 3) + '</td>', '#balances-daily tbody tr:nth-child(4)');
      }

      if (existingeErlyEndRow) {
        existingeErlyEndRow.querySelector('.rsct-align-right').innerText = earlyEndTime;
      } else {  
        var now = new Date();
        var nowHours = now.getHours();
        var nowMinutes = now.getMinutes();
        var nowSeconds = now.getSeconds();
        var earlyEndParts = earlyEndTime.split(':');

        var reached = false;
        if(earlyEndParts[0] <= nowHours && earlyEndParts[1] <= nowMinutes && earlyEndParts[2] <= nowSeconds) {
          var reached = true;
        }

        makeRow('earlyend', 'Gehen <span style="font-size: 1rem;opacity: 0.75;position: absolute;top: 50%;right: -4.5rem;transform: translateY(-50%);">frühestens</span></td><td class="col-2 rsct-alignright" title="'+earlyEndTime+'">'+earlyEndTime.substring(0, earlyEndTime.length - 3) + '</td>', '#balances-daily tbody tr:nth-child(4)', reached);
      }*/
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