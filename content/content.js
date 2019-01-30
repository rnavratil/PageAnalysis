/** 
 * Create only one message listener.
*/
if(!sessionStorage.getItem('firstRun')){
  browser.runtime.onMessage.addListener(handleMessage);
  sessionStorage.setItem('firstRun', true);
}

/** 
 * Recieve messages from the popup script.
*/
function handleMessage(request) {
  if(request.command === "fromPopup"){
    textAnalysis(request.property, request.server);
  }
}

/** 
 * Process text information from the html file of the current web page.
*/
function textAnalysis(hideElement, serverAddress) {
  /** Exception if server name not set */
  if(!serverAddress){
    sendMessage("errorServerName");
    console.error("Page-Analysis ERROR: Server URL is not set. Please go to the options page and set valid server URL");
    return;
  }

  /** @global - Array of objects. Object contains text value and css code.*/
  var textList = new Array();

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

  // function over(node){
  //   if(window.getComputedStyle(node).getPropertyValue('overflow') === 'hidden'){
  //     return false;
  //   }
  // }


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
    }
    return true;
  }
  /**
   * Stored string value to local storage.
   * @param {string} html - HTML from server response.
   */
  function storage(html){
    browser.storage.local.set({htmlFromServer: html});
  }

  /**
   * Send message to background.js
   * @param {string} type - Type of message.
   */
  function sendMessage(type){
    if(type == "toBackground"){
      browser.runtime.sendMessage({command: "fromContent"});
    }else if(type == "errorServerName"){
      browser.runtime.sendMessage({command: "errorServerName"});
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
        return;
      }
    };
    xhr.send(jsonFile);
  }
  /**
   * Returns the position of the elements on the page.
   * @param {string} element - HTML element. 
   */
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
    // deklarace a inicializace
    let simpleText = "";
    let simpleNode = "";

    nodesList.forEach(node => {  
      switch(node.nodeName.toLowerCase()){   // VSECHNO VELKYM V KNIZCE JE PROC
        case 'script':
          break;
        
        case 'style':
          break;

        case 'noscript':
          break;

        case '#comment':
          break;


        case '#text':
        // Tady si ulozime text
        // Ulozime i node
        if(!isWhiteSpace(node.nodeValue)){
          let texti = node.nodeValue.trim()
          simpleText = simpleText.concat(texti);
          simpleNode = node;
        }

          // if(!isWhiteSpace(node.nodeValue)){
          //   textList.push({
          //     value: node.nodeValue.trim(),
          //     compStyle: window.getComputedStyle(node.parentNode),
          //     position: getPosition(node.parentNode),
          //     size: getSize(node.parentNode)
          //   });
          // }
       
          break;

        case 'input':
          if(HiddenTest(node)){
            if(node.value != null && !isWhiteSpace(node.value)){
              textList.push({
              value: node.value.trim(),
              compStyle: window.getComputedStyle(node),
              position: getPosition(node),
              size: getSize(node)
              });
            }
          }
          break;
      
        default:

          // if (node.nodeName.toLowerCase() == "a"){
          //   tmpNo = node.childNodes[0];
          //   if (tmpNo.nodeName.toLowerCase() == "#text"){
          //     let textis = tmoNo.nodeValue.trim()
          //     simpleText = simpleText.concat(textis);
          //     break;
          //   }
          // }
          
          if(HiddenTest(node)){
            if (node.childNodes.length > 0) {
              elementParse(node.childNodes);
            }
          }
          break;
      }
    });
    // #tady by se mel posilat text

    if(simpleText !== ""){
          textList.push({
            value: simpleText,
            compStyle: window.getComputedStyle(simpleNode.parentNode),
            position: getPosition(simpleNode.parentNode),
            size: getSize(simpleNode.parentNode)
          });
        }
   
  }

  /** 
   * Creates a text string in json format.
   * Uses values from the global field textList.
   * @returns {string} jsonOutput - Resulting json file. 
  */
  function jsonCreator(){
    let jsonOutput = {
        description: 'Output from Page Analysis WebExtensions app.',
        url: window.location.href,
        background: document.body.style.backgroundColor
    
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
            let jsonStyle = '"'+compStyleName+'":'+JSON.stringify(textElement.compStyle.getPropertyValue(compStyleName))+',';
            jsonOutput = jsonOutput.concat(jsonStyle);
        }
        jsonOutput = jsonOutput.slice(0,-1).concat('},{');
    });
    jsonOutput = jsonOutput.slice(0,-2).concat(']}');
    return jsonOutput;
  }
}