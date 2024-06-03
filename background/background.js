

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return true; // Keeps the message channel open for sendResponse
});


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}