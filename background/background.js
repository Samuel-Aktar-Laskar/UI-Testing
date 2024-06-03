

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return true; // Keeps the message channel open for sendResponse
});
