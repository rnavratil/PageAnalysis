browser.tabs.executeScript({file: "/content_scripts/content.js"})
.then(clickAction)

function clickAction() { 
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("action")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(startAnalysis)
    }
    function startAnalysis(tabs) {  
      browser.tabs.sendMessage(tabs[0].id, {
            command: "start analysis",
          });
    }
  });
}