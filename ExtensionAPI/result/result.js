/**
 * Set new html body for result.html.
 */
chrome.storage.local.get(['htmlFromServer'], function(result) {
    let parser = new DOMParser();
    let HTMLdoc = parser.parseFromString(result.htmlFromServer, "text/html");
    let newBody = HTMLdoc.querySelectorAll('body');
    document.body = newBody[0];
    document.title = 'PA -';
    document.title += ' '.concat(HTMLdoc.querySelector('title').innerText.substring(12).slice(0,-1));
    
});

/**
 * Clear html from local storage.
 */
chrome.storage.local.set({htmlFromServer: null});