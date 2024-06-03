console.log("Hi, I am recordingTabRunner")

function sayHello(){
    console.log("Hello World")
}

let runningTabId = -1

const activities = []

function openNewTab(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(tab.id);
        }
      });
    });
}

async function startRecording(url){
    try {

        while(activities.length){
            activities.pop()
        }
        console.log("Opening new tab")
        tabId = await openNewTab(url)
        console.log("tabId of new tab is ", tabId)
        await setValue("recording", tabId)

    }
    catch(e){
        console.log("Error in starting recording :", e)
    }
}

async function stopRecording(){
    try {
        await setValue("recording", -1)
        if (tabId == -1){
            throw Error("tabId is -1")
        }
        closeTab(tabId)
    }
    catch (e){
        console.log("Error :", e.message)
    }
}


function appendActivity(activity){
    activities.push(activity)    
}


function setValue(key, value) {
    return new Promise((resolve, reject) => {
        const data = {}
        data[key] = value
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve();
        }
      });
    });
}
  
// Example function to close a tab by its ID
function closeTab(tabId) {
    chrome.tabs.remove(tabId, (removed) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(`Tab ${tabId} closed successfully`);
      }
    });
  }
  