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
});

document.querySelector('#save').addEventListener("click", function() {
  var usualPauseTime = document.getElementById('usualPauseTime').value;
  // if(usualPauseTime && usualPauseTime > 6 && usualPauseTime < 1) {
    console.log(usualPauseTime);
    chrome.storage.local.set({'usualPauseTime': usualPauseTime},function() {
      if(chrome.runtime.lastError) {
        console.error('Error saving usualPauseTime to local storage: '+ chrome.runtime.lastError);
      }else {
        console.log('Set succesfully');
      }
    });
  // }
});
