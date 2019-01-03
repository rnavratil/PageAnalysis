browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
  if(request.command === "Content"){
    createTab();
  sendResponse({response: "Response from background script"});
  }
  if(request.command === "Tab"){ 
    sendResponse({response: "Response from background script"});
  }
  if(request.command === "errorServerName"){ 
    createNotification();
    sendResponse({response: "Response from background script"});
  }
}

function createTab(){
  function onCreated(tab) {
    console.log(`Created new tab: ${tab.id}`)
  }
  
  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var creating = browser.tabs.create({
    url:"/src/final.html",
    active: false
  });
  creating.then(onCreated, onError);
}

function createNotification(){
    browser.notifications.create({
      "type":"basic",
      "title": "ERROR",
      "message": "Server name Error. Please add valid server name. Go to options page."
    })
}