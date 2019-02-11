chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "fromPopup" ) {
            textAnalysis(request.property, request.server);
        }
    }
);

/** 
 * Process text information from the html file of the current web page.
*/
function textAnalysis(hideElement, serverAddress){
       /** Exception if server name not set */
    if(!serverAddress){
        console.error("Page-Analysis ERROR: Server URL is not set. Please go to the options page and set valid server URL");
        sendMessage("errorServerName");
        return;
    }

    /** @global - Array of objects. Object contains text value and css code.*/
    var textList = new Array();

    var idIndicator = -1; // First ID will be '0';

    let nodesList = document.querySelector('body').childNodes; 
    console.log(nodesList); // DEBUG
    elementParse(nodesList);
    let jsonFile = jsonCreator();
    console.log(jsonFile); // DEBUG
    sendRequest(jsonFile);

    /**
     * Determines whether the string contains only white characters.
     * @param {string} string - text string.
     * @returns {boolean} - Return 'true' if 'string' contains only white characters and otherwise return 'false'.
     */
    function isWhiteSpace(string){
        let re = /^\s*$/;
        if(re.exec(string)){
            return true;
        }
        return false;
    }

    /**
     *  Verify whether the element should be processed.
     * @param {object} node - currently being processed html element.
     * @returns {boolean} - 'true' if the element is to be processedand otherwise return 'false'.
     */
    function HiddenTest(node){
        if(!hideElement){  // I get inside if don't search hidden elements.
            if(window.getComputedStyle(node).getPropertyValue('display') === 'none'){
                return false;
            }
            if(window.getComputedStyle(node).getPropertyValue('visibility') === 'hidden'){
                return false;
            }
            if(window.getComputedStyle(node).getPropertyValue('opacity') === '0'){
                return false;
            }
        }
    return true;
    }

    /**
     * Stored string value to local storage.
     * @param {string} html - HTML from server response.
     */
    function storage(html){
        chrome.storage.local.set({htmlFromServer: html});
    }

    /**
     * Send message to background.js
     * @param {string} type - Type of message.
     */
    function sendMessage(type){
        if(type === "toBackground"){
            chrome.runtime.sendMessage({command: "fromContent"});
        }else if(type === "errorServerName"){
            chrome.runtime.sendMessage({command: "errorServerName"});
        }
    }

    /**
     * Sends server requests and receiving replies from the server.
     * @param {string} jsonFile - Sends with request.
     */
    function sendRequest(jsonFile){
        var xhr = new XMLHttpRequest();
        var url = serverAddress;
        try {
            xhr.open("POST", url, true);
        }
        catch(error) {
            console.log(error);
            sendMessage("errorServerName")
            return;
        }
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Access-Control-Allow-Origin", url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                storage(xhr.responseText);
                sendMessage("toBackground");
            }else if (xhr.readyState === 4 && xhr.status !== 200){
                console.error("Page-Analysis ERROR: Server response with status code: "+xhr.staus);
                sendMessage("errorServerName");
                return;
            }
        };
        xhr.send(jsonFile);
    }

    function getPosition(element){
        let xPosition = 0;
        let yPosition = 0;
        
        while (element) {
            if (element.tagName == "BODY") {
                // Browser quirks with body/window/document and page scroll.
                let xScroll = element.scrollLeft || document.documentElement.scrollLeft;
                let yScroll = element.scrollTop || document.documentElement.scrollTop;
        
                xPosition += (element.offsetLeft - xScroll + element.clientLeft);
                yPosition += (element.offsetTop - yScroll + element.clientTop);
            } else {
                // Non BODY elements.
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            }
            element = element.offsetParent;
        }
        return {
            x: xPosition,
            y: yPosition
        };
    }


    function getSize(element){
        // let elementHeight = 0;
        // let elementWidth = 0;
        let elementHeight = element.offsetHeight;
        let elementWidth = element.offsetWidth;
    
        // if(!elementHeight){
        //   elementHeight = "undefined"
        // }
        // if(!elementWidth){
        //   elementWidth = "undefined"
        // }
    
        return{
            height: elementHeight,
            width: elementWidth
        };
    }

  /**
   * Recursive function for processing text elements from html.
   * @param {Array} nodesList - The first level of html elements.
   */
  function elementParse(nodesList){
    let firstText = true; //novej nodelist byl pouzit prvni prvek??
    for(let i = 0; i < nodesList.length; i++){
    // nodesList.forEach(node => {  
      switch(nodesList[i].nodeName.toLowerCase()){
        case 'script':
          break;
        
        case 'style':
          break;

        case 'noscript':
          break;

        case '#comment':
          break;

        case '#text':
          if(!isWhiteSpace(nodesList[i].nodeValue)){

            // if(textList.length > 0){
            // // Pokud je id stejny tak delej to co je tu psano:
            
            //   // Zjistim position minulyho pridanyho
            //   let lastPosition = textList[textList.length-1].position;
            //   // Zjistim width a height minulyho pridanyho
            //   let lastWidth = textList[textList.length-1].size;
            //   // Udelam Tinky Winky
            //   let textIndent = lastWidth[1] + lastPosition[0];
            // }
          if (firstText){ // First text.
            firstText = false;
            textList.push({
              value: nodesList[i].nodeValue.trim(),
              compStyle: window.getComputedStyle(nodesList[i].parentNode),
              position: getPosition(nodesList[i].parentNode),
              size: getSize(nodesList[i].parentNode)
            });
          }else{ // Dalsi text
            let lastPosition = textList[textList.length-1].position;
            let lastWidth = textList[textList.length-1].size;
            let textIndent = lastWidth.width + lastPosition.x; //odsazeni
            //nova pozice
            let newposition = getPosition(nodesList[i].parentNode);
            newposition.y =  lastPosition.y; //posune po y ose
            let tmppp =  window.getComputedStyle(nodesList[i].parentNode);
            // tmppp.setProperty("text-indent", "76px", important);
            // tmppp.setTextIndent("76px");
            textList.push({
              value: nodesList[i].nodeValue.trim(),
              compStyle: tmppp,
              position: newposition,
              size: getSize(nodesList[i].parentNode),
              indent: textIndent
            });
          }

        
          }
          break;

        case 'input':
          if(HiddenTest(nodesList[i])){
            if(nodesList[i].value != null && !isWhiteSpace(nodesList[i].value)){
              firstText = true;
              textList.push({
              value: nodesList[i].value.trim(),
              compStyle: window.getComputedStyle(nodesList[i]),
              position: getPosition(nodesList[i]),
              size: getSize(nodesList[i])
              });
            }
          }
          break;
      
        default:
          if(HiddenTest(nodesList[i])){
            if (nodesList[i].childNodes.length > 0) {
              elementParse(nodesList[i].childNodes);
            }
          }
          break;
      }
    } //foreach
  }

 /** 
   * Creates a text string in json format.
   * Uses values from the global field textList.
   * @returns {string} jsonOutput - Resulting json file. 
  */
 function jsonCreator(){
    // let tomio = getComputedStyle(document.querySelector('body'));
    // let okuamra = tomio.getPropertyValue("background-color");
    let jsonOutput = {
        description: 'Output from Page Analysis WebExtensions app.',
        url: window.location.href,
        backgroundColor: getComputedStyle(document.querySelector('body')).getPropertyValue("background-color")
    
    }
  
    jsonOutput = JSON.stringify(jsonOutput);
    jsonOutput = jsonOutput.slice(0,-1).concat(',"text_elements":[{');
    textList.forEach(textElement => {
        let tmpJsonContent = '"Xtext":'+JSON.stringify(textElement.value)+',';  // Elements text.
        jsonOutput = jsonOutput.concat(tmpJsonContent);
        let tmp = '"Xposition":'+JSON.stringify(textElement.position)+',';   // Position of Element.
        jsonOutput = jsonOutput.concat(tmp);
        let tmpSize = '"Xsize":'+JSON.stringify(textElement.size)+','; // Size of Element
        jsonOutput = jsonOutput.concat(tmpSize);
        for(i = 0; i < textElement.compStyle.length; i++){
            let compStyleName = textElement.compStyle[i]; 
            if (compStyleName == "background-color") {
              continue;
            }   
            if (compStyleName == "quotes") {
              continue;
            } 
            if(compStyleName == "text-indent"){
              let jsonStyle = '"'+compStyleName+'":'+JSON.stringify(textElement.indent+'px')+',';
              jsonOutput = jsonOutput.concat(jsonStyle);
            }else{          
            let jsonStyle = '"'+compStyleName+'":'+JSON.stringify(textElement.compStyle.getPropertyValue(compStyleName))+',';
            jsonOutput = jsonOutput.concat(jsonStyle);
            }
        }
        jsonOutput = jsonOutput.slice(0,-1).concat('},{');
    });
    jsonOutput = jsonOutput.slice(0,-2).concat(']}');
    return jsonOutput;
  }
}