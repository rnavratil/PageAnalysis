/** @global*/
var hideElement;  // Boolean
var serverAddress;  // string

/**
 * Execute option page after click on buttons.
 */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("options")) {
    browser.runtime.openOptionsPage();
  }
  if (e.target.classList.contains("action")) {
    browser.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      browser.tabs.sendMessage(activeTab.id, {
          "message": "fromPopup",
          property: hideElement,
          server: serverAddress
      });
      window.close();
    });
  }
});

/**
 * Popup menu apperance setting.
 */
browser.storage.local.get('myTheme')
.then(response => {
  if(response.myTheme === "dark"){
    document.body.style.background = 'rgb(97, 97, 97)';
    document.getElementById('logo').style.backgroundColor = 'rgb(97, 97, 97)';
    document.getElementById('image').style.background = 'url(../icons/darklogo-mini.png)' ;
    document.getElementById('image').style.backgroundSize = '127px 34px';
    document.getElementById('image').style.width = '127px';
    document.getElementById('image').style.height = '34px';
    var css = 'button{color:white;background-color:rgb(97, 97, 97)}button:hover{background-color:#4c4c4c}';
    var style = document.createElement('style');
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
  }
})

/**
 * get value Search hidden elements.
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

/**
 * get value My address.
 */
browser.storage.local.get('myAddress')
.then(response => {
  if(response.myAddress){
    serverAddress = response.myAddress;
  }
})