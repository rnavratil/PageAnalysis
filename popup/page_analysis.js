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
browser.tabs.executeScript({file: "/content_scripts/content.js"})
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
            command: "start analysis",
            property: hideElement
          });
    }
  });
}

/**
 * Popup menu apperance setting.
 */
browser.storage.local.get('myTheme')
.then(response => {
  if(response.myTheme === "dark"){
    document.getElementById('logo-image').style.background = 'url(/icons/logo-48neg.png)' ;
    document.getElementById('logo-image').style.backgroundRepeat = 'no-repeat';
    document.getElementById('image-text').style.color = 'white' ;
    document.body.style.background = '#404040';

  }
  else if(response.myTheme === "classic"){
    document.getElementById('logo-image').style.background = 'url(/icons/logo-48.png)' ;
    document.getElementById('logo-image').style.backgroundRepeat = 'no-repeat';
    document.getElementById('image-text').style.color = 'black' ;
    document.body.style.background = '#F5F5F5';
  };
})

/** @global - Boolean */
var hideElement;

/**
 * Search hidden elements.
 */
browser.storage.local.get('myHideElement')
.then(response2 => {
  if(response2.myHideElement === "yes"){
      hideElement = true;
  }
  else{
      hideElement = false;
  };
})