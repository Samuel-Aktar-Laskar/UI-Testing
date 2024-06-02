chrome.storage.local.get("recording", (result) => {
    if (result.recording) {
      startRecording();
    }
  });
  
  function startRecording() {
    document.addEventListener('click', recordClick);
    document.addEventListener('scroll', recordScroll);
    console.log('Started recording');
  }
  
  function stopRecording() {
    document.removeEventListener('click', recordClick);
    document.removeEventListener('scroll', recordScroll);
    console.log('Stopped recording');
  }
  
  function recordClick(event) {
    const activity = {
      type: "click",
      x: event.clientX,
      y: event.clientY
    };
    const serializedActivity = JSON.stringify(activity)
    chrome.runtime.sendMessage({ action: "logActivity", activity:serializedActivity });
  }
  
  function recordScroll(event) {
    const activity = {
      type: "scroll",
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX
    };
    const serializedActivity = JSON.stringify(activity)
    chrome.runtime.sendMessage({ action: "logActivity", activity: serializedActivity });
  }
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.recording) {
      if (changes.recording.newValue) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  });
  