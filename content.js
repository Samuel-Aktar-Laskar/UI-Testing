
console.log("content script loaded")

let addingAssert = false

function startRecording() {
  injectPipWindow()
  document.addEventListener("click", recordClick);
  document.addEventListener("scroll", recordScroll);
  console.log("Started recording");
}

function stopRecording() {
  document.removeEventListener("click", recordClick);
  document.removeEventListener("scroll", recordScroll);
  console.log("Stopped recording");
}

function recordTyping(event){
  const element = event.target
  console.log('User typed ', element.value)
  const xPath = getXPath(element)
  const activity = {
     type:'typing',
     xPath:xPath, 
     text: element.value
  }
  const serializedActivity = JSON.stringify(activity)
  chrome.runtime.sendMessage({
    action:'logActivity',
    activity: serializedActivity
  })

}

function recordClick(event) {
  const element = event.target
  const activity = {
    type: addingAssert ? "assert":"click",
    x: event.clientX,
    y: event.clientY,
    xPath:getXPath(element)
  };
  addingAssert = false

  if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase()==='textarea'){
    console.log('Input box is selected')
    element.addEventListener('input',recordTyping)
  }


  console.log('XPath got is ', activity.xPath)
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



async function clickElementByXPath(xpath) {
    // Locate the element using XPath
    const element = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    // Check if the element exists
    if (element) {
      // Programmatically click the element
      element.click();
      console.log('Element clicked:', element);
      await wait(2500)
    } else {
      console.error('Element not found for the given XPath:', xpath);
    }
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
  await wait(900); // Adjust wait time as needed
}

async function simulateTyping(xpath, text) {
  const element = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (element) {
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
      // For input and textarea elements
      element.value = text;
    } else {
      // For other elements
      element.textContent = text;
    }
    console.log('Text set for element:', element);
    await wait(500)
  } else {
    console.error('Element not found for the given XPath:', xpath);
  }
}


async function executeActivity(activity) {
  // Execute activity based on type (e.g., click or scroll)
  console.log("Execute ",activity)
  if (activity.type === "click") {
    // await simulateClick(activity.x, activity.y);
    await clickElementByXPath(activity.xPath)
  } else if (activity.type === "scroll") {
    await simulateScroll(activity.scrollLeft, activity.scrollTop);
  }
  else if (activity.type === 'typing'){
    await simulateTyping(activity.xPath,activity.text)
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FROM_EXTENSION') {
    // Forward the message to the web page
    console.log("Forwarding message from content script")
    window.postMessage({ type: 'FROM_EXTENSION', activities: message.activities }, '*');
  }
});


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





//utils functions

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// XPath Selector code
function getXPath(element) {
  console.log('element ', element)
  if (element.id !== "") {
      return "//*[@id='" + element.id + "']";
  }
  
  if (element === document.body) {
      return "/html/body";
  }

  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
          var tagName = element.tagName.toLowerCase();
          var index = (ix + 1);
          return getXPath(element.parentNode) + '/' + tagName + '[' + index + ']';
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          ix++;
      }
  }
}


//Inject picture in picture window
// Create the floating box div
const floatingBox = document.createElement('div');
floatingBox.id = 'floatingBox';
floatingBox.innerHTML = `
  <div id="button1">Recording in progress</div>
  <button id="button2">Add Assert</button>
  <button id="button3">Finish Recording</button>
`;

// Style the floating box
const style = document.createElement('style');
style.innerHTML = `
  #floatingBox {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 150px;
    padding: 10px;
    background-color: white;
    border: 1px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 10000;
  }
  #floatingBox button {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  #floatingBox button:hover {
    background-color: #0056b3;
  }
`;

function injectPipWindow(){
  document.addEventListener('DOMContentLoaded',()=>{
     // Append the floating box and style to the document
    document.body.appendChild(floatingBox);
    document.head.appendChild(style);

    // Add event listeners for the buttons
 
    document.getElementById('button2').addEventListener('click', () => {
      addingAssert = true
    });

    document.getElementById('button3').addEventListener('click', () => {
      chrome.runtime.sendMessage({type:'stop_recording'},result=>{
      })
    });

   
  })

}


