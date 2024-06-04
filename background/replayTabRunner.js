
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

let curIndex = -1
let replayTabId

async function startReplay(){
    try {
        curIndex =  -1
        console.log("Opening new tab")
        replayTabId= await openNewTab(rUrl)
        console.log("tabId of new tab is ", replayTabId)
    }
    catch(e){
        console.log("Error in starting recording :", e)
    }
}

async function continuePlay(){
  let isComplete = false
    while(true){
      curIndex += 1
      isComplete = curIndex >= activities.length
      if (isComplete) break
      if (activities.at(curIndex).type === 'network') continue
      else break
    }
    if (isComplete) curIndex = -1
    await wait(1000)
    console.log("Continue play, curIndex ", curIndex, " isComplete ", isComplete, " activities length ", activities.length)
    return {
        complete :isComplete, 
        activity: isComplete ? {} : activities.at(curIndex) 
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

