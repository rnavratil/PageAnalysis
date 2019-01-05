sendMessage();

function sendMessage(){
    function handleResponse(message) {
        setNewBody();
    }
    
    function handleError(error) {
        console.log(`Error: ${error}`);
    }
    
    var sending = browser.runtime.sendMessage({
        command: "Tab"
    });
    sending.then(handleResponse, handleError);      
}

function setNewBody(){
    browser.storage.local.get('htmlFromServer')
    .then(response => {
        let newBody = response.htmlFromServer;        
            newBody = newBody.substring(62);
            newBody = newBody.slice(0,-15);
        document.body.innerHTML = newBody;
    })
    browser.storage.local.set({htmlFromServer: null});  // Clear
}