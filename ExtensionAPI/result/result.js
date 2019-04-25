/**
 * Set new html body for result.html.
 */
chrome.storage.local.get(['htmlFromServer'], function(result) {
    // Body
    let parser = new DOMParser();
    let HTMLdoc = parser.parseFromString(result.htmlFromServer, "text/html");
    let newBody = HTMLdoc.querySelectorAll('body');
    document.body = newBody[0];

    // Title URL
    document.title = 'PA -';
    let titleURL = HTMLdoc.querySelector('title').innerText;
    var patt = /^https?:\/\/www./i;
    var RegexResult = titleURL.match(patt);
    if(RegexResult[0] == 'https://www.'){
        document.title += ' '.concat(titleURL.substring(12));
    }else if(RegexResult[0] == 'http://www.'){
        document.title += ' '.concat(titleURL.substring(11));
    }else{
        document.title += ' '.concat(titleURL);
    }
});

/**
 * Clear html from local storage.
 */
chrome.storage.local.set({htmlFromServer: null});