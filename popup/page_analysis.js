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
    if (e.target.classList.contains("options")) {
      browser.runtime.openOptionsPage();
    }

    /**
     * Sends message with command.
     * @param {Array} tabs 
     */
    function startAnalysis(tabs) {  
      browser.tabs.sendMessage(tabs[0].id, {
            command: "start analysis",
          });
    }
  });
}

/**
 * Popup menu apperance setting
 */
const getItem = browser.storage.local.get('myTheme');
getItem.then(response => {
    const myColor = response.myTheme;
    if(myColor === "dark"){
      document.getElementById('logo-image').style.background = 'url(/icons/logo-48neg.png)' ;
      document.getElementById('logo-image').style.backgroundRepeat = 'no-repeat';
      document.getElementById('image-text').style.color = 'white' ;
      document.body.style.background = '#404040';

    }
    else if(myColor === "classic"){
      document.getElementById('logo-image').style.background = 'url(/icons/logo-48.png)' ;
      document.getElementById('logo-image').style.backgroundRepeat = 'no-repeat';
      document.getElementById('image-text').style.color = 'black' ;
      document.body.style.background = '#F5F5F5';
    };
})