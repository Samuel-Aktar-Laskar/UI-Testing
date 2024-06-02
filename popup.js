document.getElementById('start').addEventListener('click', () => {
    chrome.storage.local.set({activities:[]},()=>{

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.runtime.sendMessage({ action: "startRecording" }, (response) => {
            console.log(response.status);
          });
        });
    })
  });
  
  document.getElementById('stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stopRecording" }, (response) => {
      console.log(response.status);
    });
  });
  
  document.getElementById('simulate').addEventListener('click',()=>{
    chrome.storage.local.set({curIndex:0},()=>{
        console.log("Recording set")
    })
  })