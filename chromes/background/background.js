/**
 * Create run-time message listener.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.command === "fromContent" ) {
            createTab();
        }
        if(request.command === "errorServerName" ) {
            createNotification();
        }
    }
);

/**
 * Makes new browser tab with extension result.
 */
function createTab(){
    chrome.tabs.create({
      url:"/result/result.html",
      active: false
    });
  }

 /**
 * Makes browser notification.
 */
function createNotification(){
    var options = {
        type: "basic",
        iconUrl: "/icons/glass-96.png",
        title: "Page-Analysis: SERVER NAME ERROR",
        message: "Please go to the options page and set valid server URL"
    };
    chrome.notifications.create('id', options);
}
