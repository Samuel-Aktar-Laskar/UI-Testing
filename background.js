chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ recording: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


  if (message.action === "startRecording") {
    chrome.storage.local.set({ recording: true }, () => {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ["content.js"],
      });
      sendResponse({ status: "Recording started" });
    });
  }
  
  
  else if (message.action === "stopRecording") {
    chrome.storage.local.set({ recording: false }, () => {
      sendResponse({ status: "Recording stopped" });
      filterData()
    });
  }
  
  
  else if (message.action === "logActivity") {
    console.log("Received activity", message.activity, typeof message.activity)
    chrome.storage.local.get({ activities: [] }, (result) => {
      const activities = result.activities;
      activities.push(message.activity);
      chrome.storage.local.set({ activities: activities });
    });
  }
  return true; // Keeps the message channel open for sendResponse


});


function filterData(){
  chrome.storage.local.get({activities:[]}, (result)=>{
      
      const activities = result.activities.map((item)=> JSON.parse(item))
      const parsedActivities = []
      let lastActivity = null
      let pervIsClick = false
      activities.forEach(activity=> {
        if (activity.type == 'click'){
          if (!pervIsClick && lastActivity != null){
            parsedActivities.push(lastActivity)
          }
          pervIsClick = true
          parsedActivities.push(activity)
        } 
        else if (activity.type == 'scroll') {
          if (pervIsClick){
            parsedActivities.push(activity)
          } 
          pervIsClick = false
          lastActivity = activity
        }
      });
      chrome.storage.local.set({activities:parsedActivities},()=>{})
      console.log(parsedActivities)
  })
}
