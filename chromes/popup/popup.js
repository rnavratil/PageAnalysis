/** @global*/
var hideElement;  // Boolean
var serverAddress;  // string
    
/**
 * Execute option page after click on buttons.
 */
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("options")) {
      chrome.runtime.openOptionsPage();
    }
    if (e.target.classList.contains("action")) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
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
chrome.storage.local.get(['myTheme'], function(result) {
    if(result.myTheme === "dark"){
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
});

/**
 * Search hidden elements.
 */
chrome.storage.local.get(['myHideElement'], function(result) {
    if(result.myHideElement === "yes"){
        hideElement = true;
    }else{
        hideElement = false;
    }
});

/**
 * Set server address.
 */

chrome.storage.local.get(['myAddress'], function(result){
    if(result.myAddress){
        serverAddress = result.myAddress;
    }
    
});
