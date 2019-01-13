/**
 * Execute option page after click on buttons.
 */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("options")) {
    browser.runtime.openOptionsPage();
  }
});

/**
 * Execute content script after click on buttons.
 */
browser.tabs.executeScript({file: "/content/content.js"})
.then(clickAction)

/**
 * Will do the action by clicking on buttons.
 */
function clickAction() { 
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("action")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(startAnalysis)
    }
    /**
     * Sends message with command.
     * @param {Array} tabs 
     */
    function startAnalysis(tabs) { 
      browser.tabs.sendMessage(tabs[0].id, {
            command: "fromPopup",
            property: hideElement,
            server: serverAddress
          });
          window.close();
    }
  },{once: true});
}

/**
 * Popup menu apperance setting.
 */
browser.storage.local.get('myTheme')
.then(response => {
  if(response.myTheme === "dark"){
    document.body.style.background = 'rgb(97, 97, 97)';
    document.getElementById('logo').style.backgroundColor = 'rgb(97, 97, 97)';
    var css = 'button{color:white;background-color:rgb(97, 97, 97)}button:hover{background-color:#4c4c4c}';
    var style = document.createElement('style');
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
  }
  else if(response.myTheme === "classic"){
    
    // document.getElementById('logo').style.backgroundColor = 'rgb(97, 97, 97)';
    // document.getElementById('logo').style.backgroundColor = '#F5F5F5';
    // document.getElementsByTagName('button').style.backgroundColor = '#F5F5F5';
    // document.body.style.backgroundColor = '#F5F5F5';
  };
})

/** @global*/
var hideElement;  // Boolean
var serverAddress;  // string

/**
 * Search hidden elements.
 */
browser.storage.local.get('myHideElement')
.then(response => {
  if(response.myHideElement === "yes"){
      hideElement = true;
  }
  else{
      hideElement = false;
  };
})

browser.storage.local.get('myAddress')
.then(response => {
  if(response.myAddress){
    serverAddress = response.myAddress;
  }
})