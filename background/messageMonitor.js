let recording = false
let replaying = false


//Listenes for message from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('Message received in background script:', message);
    if (message.type === 'start_recording') {
    //   sendResponse({ text: 'Hello from the background script!' });
        recording = true
        startRecording(message.url)
        console.log("Starting recording")
        sendResponse({successful:true})
    }
    else if (message.type === 'stop_recording'){
        recording = false
        stopRecording();
        sendResponse({successful:true})
    }
    else if (message.type === 'start_replaying'){
        replaying = true
        startReplay()
        sendResponse({successful:true})
    }
    else if (message.type === 'action'){
        if (recording){
            sendResponse({record: true})
        }
        else if (replaying){
            //replay
            const res = await continuePlay()
            if (!res.complete){
                console.log("to paly activity :", res.activity)
                sendResponse({replay:true, activity:res.activity})
            }
            else {
                closeTab(replayTabId)
                console.log("Complete")
            }
            //if complete, close it
        }
        else 
            sendResponse({record:false})
    }
    else if (message.action === 'logActivity'){
        console.log("Received in monitor", message.activity, typeof message.activity)
        appendActivity(JSON.parse(message.activity))
    }
  });