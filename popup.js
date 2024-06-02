document.getElementById('start').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ action: "startRecording" }, (response) => {
        console.log(response.status);
      });
    });
  });
  
  document.getElementById('stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stopRecording" }, (response) => {
      console.log(response.status);
    });
  });
  