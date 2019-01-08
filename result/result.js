/**
 * Set new html body for result.html.
 */
browser.storage.local.get('htmlFromServer')
.then(response => {
    let newBody = response.htmlFromServer;        
        newBody = newBody.substring(62);
        newBody = newBody.slice(0,-15);
    document.body.innerHTML = newBody;
})

/**
 * Clear html from local storage.
 */
browser.storage.local.set({htmlFromServer: null});