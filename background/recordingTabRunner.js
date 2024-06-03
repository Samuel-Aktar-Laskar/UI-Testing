let runningTabId = -1;

let activities = [
  {
    type: "scroll",
    scrollTop: 5000,
    scrollLeft: 0,
  },
];
let rUrl = "https://www.wikipedia.org/";

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

async function startRecording(url) {
  try {
    rUrl = url;
    while (activities.length) {
      activities.pop();
    }
    console.log("Opening new tab");
    tabId = await openNewTab(url);
    console.log("tabId of new tab is ", tabId);
    await setValue("recording", tabId);
  } catch (e) {
    console.log("Error in starting recording :", e);
  }
}

async function stopRecording() {
  try {
    await setValue("recording", -1);
    if (tabId == -1) {
      throw Error("tabId is -1");
    }
    closeTab(tabId);
    filterData();
  } catch (e) {
    console.log("Error :", e.message);
  }
}

function appendActivity(activity) {
  activities.push(activity);
}

function setValue(key, value) {
  return new Promise((resolve, reject) => {
    const data = {};
    data[key] = value;
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

function filterData() {
  const parsedActivities = [];
  let lastActivity = null;

  for(let i=0;i<activities.length;i++){
    const activity = activities[i]

    if (activity.type == 'click' && activity.xPath == "//*[@id='button3']") continue

    if (activity.type == 'scroll')
      continue

    if (i>0 && activities[i-1].type == 'scroll'){
      parsedActivities.push(activities[i-1])
    }

    if (activity.type == 'typing') 
      continue

    if (i>0 && activities[i-1].type == 'typing'){
      parsedActivities.push(activities[i-1])
    }

    parsedActivities.push(activity)
  }
  // activities.forEach((activity) => {
  //   if (activity.type == "click") {
  //     if (lastActivity != null && lastActivity.type == "scroll") {
  //       parsedActivities.push(lastActivity);
  //     }
  //     parsedActivities.push(activity);
  //   } else if (activity.type == "scroll") {
  //     if (lastActivity != null && lastActivity.type != "scroll" && lastActivity.type != 'assert') {
  //       parsedActivities.push(activity);
  //     }
  //   }
    
  //   else if (activity.type == 'assert'){
  //     if (lastActivity != null && lastActivity.type != "scroll") {
  //       parsedActivities.push(activity);
  //     }
  //     parsedActivities.push(activity)
  //   }
  //   else if (activity.type == "typing") {

  //     if (lastActivity != null && lastActivity.type == "scroll") {
  //       parsedActivities.push(lastActivity);
  //     }
  //     if (lastActivity == null || lastActivity.type != "typing")
  //       parsedActivities.push(activity);
  //     else {
  //       if (lastActivity.xPath == activity.xPath) {
  //         parsedActivities[parsedActivities.length - 1].text = activity.text;
  //       } else {
  //         parsedActivities.push(activity);
  //       }
  //     }
  //   }
  //   lastActivity = activity;
  // });
  console.log("Before parsing ", activities);
  activities = parsedActivities;
  console.log(parsedActivities);
}
