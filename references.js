// XPath Selector code
function getXPath(element) {
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

function handleEvent(event) {
    var element = event.target;
    var xpath = getXPath(element);
    console.log(xpath);
}

// Example usage: Attach this function to a click event on the document
document.addEventListener('click', handleEvent);





// Sending message from frontend

  // Send a message to the content script
  function sendMessageToExtension() {
    window.postMessage({ type: 'FROM_PAGE', payload: { type: 'start_recording', url: 'www.codeforces.com' } }, '*');
  }

  // Call the function to send the message
  sendMessageToExtension();

  // Optional: Listen for messages from the content script
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CONTENT_SCRIPT_LOADED') {
      console.log('Content script has been loaded');
    }
  }, false);

