/**
 * Set new html body for result.html.
 */
browser.storage.local.get('htmlFromServer')
.then(response => {
    
    responseHTML = response.htmlFromServer.substring(41).slice(0,-15); // body+divs
    bodyHTML = /<.*?>/g.exec(responseHTML); // [0] je body
    newBody = responseHTML.substring(bodyHTML[0].length); //divs
    backgroundColor =  /".*?"/g.exec(bodyHTML[0]);
    backgroundColor1 = backgroundColor[0].substring(18).slice(0,-2);
    // backgroundColor1 = backgroundColor1.slice(0,-2);
   
    // var myArray = //g.exec('cdbbdbsbz'); 
    // let newBody = response.htmlFromServer;        
    //     newBody = newBody.substring(62);
    //     newBody = newBody.slice(0,-15);
    document.body.innerHTML = newBody;
    document.body.style.background = backgroundColor1;
    
})

/**
 * Clear html from local storage.
 */
browser.storage.local.set({htmlFromServer: null});