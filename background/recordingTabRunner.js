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
  let lastNonNetowrk = null

  for(let i=0;i<activities.length;i++){
    const activity = activities[i]
    const lastNonNetowrkCache = JSON.parse(JSON.stringify(lastNonNetowrk))
    if (activity.type != 'network')
      lastNonNetowrk = activity 
    if (activity.type === 'scroll')
      continue

    if (activity.type === 'network'){
      parsedActivities.push(activity)
      continue
    }

    if (lastNonNetowrkCache && lastNonNetowrkCache.type == 'scroll'){
      parsedActivities.push(lastNonNetowrkCache)
    }

    if (activity.type == 'typing') 
      continue

    if (lastNonNetowrkCache && lastNonNetowrkCache.type == 'typing'){
      parsedActivities.push(lastNonNetowrkCache)
    }

    if ('xPath' in activity && activity.xPath === "//*[@id='button2']") continue
    if ('xPath' in activity && activity.xPath === "//*[@id='button3']") continue

    parsedActivities.push(activity)
  }
  if (activities.length){
    const lastActivity = activities[activities.length -1]
    if (lastActivity.type === 'scroll' || lastActivity.type === 'typing'){
      parsedActivities.push(lastActivity)
    }
  }
  console.log("Before parsing ", activities);
  activities = parsedActivities;
  console.log(parsedActivities);
}
