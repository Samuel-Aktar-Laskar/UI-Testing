chrome.devtools.panels.create('demo panel', 'icon.png', 'panel.html', () => {
    console.log('user switched to this panel');
  });

chrome.devtools.network.onRequestFinished.addListener(
    function(request) {
      console.log("Request tapped, url ", request.request.url)
      const activity = {
        type:'network',
        url:request.request.url
      }
        chrome.runtime.sendMessage({type:'logActivity', activity:JSON.stringify(activity)})
    }
  );