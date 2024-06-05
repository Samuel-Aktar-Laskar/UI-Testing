chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    return true; // Keeps the message channel open for sendResponse
});

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureBoundingRect(boundingRect) {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
            null,
            { format: "png" },
            function (dataUrl) {
                let image = new Image();
                image.onload = function () {
                    let canvas = document.createElement("canvas");
                    const factor = 1.25
                    canvas.width = factor*boundingRect.width;
                    canvas.height = factor*boundingRect.height;
                    let context = canvas.getContext("2d");
                    context.drawImage(
                        image,
                        factor*boundingRect.left ,
                        factor*boundingRect.top,
                        factor*boundingRect.width,
                        factor*boundingRect.height,
                        0,
                        0,
                        factor*boundingRect.width,
                        factor*boundingRect.height
                    );
                    let croppedDataUrl = canvas.toDataURL("image/png");
                    console.log("Screenshot is :", croppedDataUrl);
                    resolve({ screenshot: croppedDataUrl });
                };
                image.src = dataUrl;
            }
        );
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (recording){
        console.log('Url is ', details.url)
        const activity = {
            type:'network', 
            url:details.url
        }
        activities.push(activity)
      }
      return {cancel: details.url.indexOf("://www.evil.com/") != -1};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
  );
  