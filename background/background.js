/**
 * Create run-time message listener.
 */
browser.runtime.onMessage.addListener(handleMessage);

/**
 * Handle messages.
 * @param {string} request 
 */
function handleMessage(request) {
  if(request.command === "fromContent"){
    createTab();
  }
  if(request.command === "errorServerName"){ 
    createNotification();
  }
}

/**
 * Makes new browser tab with extension result.
 */
function createTab(){
  function onCreated(tab) {
    console.log("Page-Analysis: Created new tab "+tab.id);
  }
  
  function onError(error) {
    console.error("Page-Analysis ERROR: "+error);
  }

  var creating = browser.tabs.create({
    url:"/result/result.html",
    active: false
  });
  creating.then(onCreated, onError);
}

/**
 * Makes browser notification.
 */
function createNotification(){
    browser.notifications.create({
      "type":"basic",
      "title": "Page-Analysis: SERVER NAME ERROR",
      "message": "Please go to the options page and set valid server URL"
    })
}