
console.log("content script loaded")

chrome.storage.local.get("curIndex", (result)=>{
    if (result.curIndex != -1){
        const cIndex = result.curIndex
        chrome.storage.local.get({ activities: [] },async (result) => {
            console.log("Activities ", result.activities)
            const activity = result.activities.at(cIndex)
            if (activity == null){
                console.log("Activity is null")
                chrome.storage.local.set({curIndex:-1})
                return
            }
            executeActivity(result.activities[cIndex], cIndex, result.activities.length);
          });
    }
})

function startRecording() {
  document.addEventListener("click", recordClick);
  document.addEventListener("scroll", recordScroll);
  console.log("Started recording");
}

function stopRecording() {
  document.removeEventListener("click", recordClick);
  document.removeEventListener("scroll", recordScroll);
  console.log("Stopped recording");
  chrome.storage.local.set({curIndex:-1})
}

function recordClick(event) {
  const activity = {
    type: "click",
    x: event.clientX,
    y: event.clientY,
  };
  const serializedActivity = JSON.stringify(activity);
  chrome.runtime.sendMessage({
    action: "logActivity",
    activity: serializedActivity,
  });
}

function recordScroll(event) {
  const activity = {
    type: "scroll",
    scrollTop: window.scrollY,
    scrollLeft: window.scrollX,
  };
  const serializedActivity = JSON.stringify(activity);
  chrome.runtime.sendMessage({
    action: "logActivity",
    activity: serializedActivity,
  });
}


async function simulateClick(x, y) {
    console.log("click at ", x , y)
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
  
    const element = document.elementFromPoint(x, y);
    if (element) {
      element.dispatchEvent(event);
      console.log('Click simulated at coordinates:', x, y);
    } else {
      console.warn('No element found at coordinates:', x, y);
    }
    await wait(3000)
}

function smoothScrollTo(scrollLeft, scrollTop, duration) {
    const startLeft = window.scrollX || window.pageXOffset;
    const startTop = window.scrollY || window.pageYOffset;
    const distanceLeft = scrollLeft - startLeft;
    const distanceTop = scrollTop - startTop;
    const startTime = performance.now();
  
    function step(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
  
      window.scrollTo(
        startLeft + distanceLeft * progress,
        startTop + distanceTop * progress
      );
  
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
  
    requestAnimationFrame(step);
  }


async function simulateScroll(scrollLeft, scrollTop) {
    console.log("Simulating Scroll", scrollTop)
//   window.scrollTo(scrollLeft, scrollTop);
smoothScrollTo(scrollLeft,scrollTop,1000)
  await wait(1300); // Adjust wait time as needed
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeActivity(activity) {
  // Execute activity based on type (e.g., click or scroll)
  console.log("Execute ",activity)
  if (activity.type === "click") {
    await simulateClick(activity.x, activity.y);
  } else if (activity.type === "scroll") {
    await simulateScroll(activity.scrollLeft, activity.scrollTop);
  }
}



// Listen for messages from the web page
window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data && event.data.type === 'FROM_PAGE') {
    chrome.runtime.sendMessage(event.data.payload, (response) => {
      console.log('Response from background:', response);
    });
  }
}, false);



//Tells the content script what to do now
function startAction(){
  chrome.runtime.sendMessage({type:"action"}, async result=>{
    console.log("Action result is ", result)
    if (result.action === 'record'){
      startRecording()
    }
    else if (result.action === 'replay'){
      await executeActivity(result.activity)
      startAction()
    }
    
  })
}
startAction()
