/**
 * Create message listener.
 */
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
function textAnalysis(hideElement, serverAddress) {
  /** Exception if server name not set */
  if(!serverAddress){
    sendMessage("errorServerName");
    console.error("Page-Analysis ERROR: Server URL is not set. Please go to the options page and set valid server URL");
    return;
  }

  /** @global - Array of objects. Object contains text value and css code.*/
  var textList = new Array();

  let rootNode = document.querySelector('body');
  let nodesList = rootNode.childNodes; 
  console.log(nodesList); // DEBUG
  elementParse(nodesList, rootNode);
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
        sendMessage("errorServerName");
        return;
      }
    };
    xhr.send(jsonFile);
  }

  /**
   * Returns the position of the elements on the page.
   * This algorythm is from:
   * https://www.kirupa.com/html5/get_element_position_using_javascript.html
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
  
  /**
   *  Return Size of text element.
   * @param {object} element - parent element of pure text. 
   */
  function getSize(element){    
    let elementHeight = element.offsetHeight;
    let elementWidth = element.offsetWidth;
    if (!elementHeight){ elementHeight = 0 }
    if (!elementWidth){ elementWidth = 0}
      return{
        height: elementHeight,
        width: elementWidth
      };
  }

  /**
   *  Push new text element to TextList.
   * @param {string} valueA - Text value.
   * @param {CSS2Object} styleA - CSS of text.
   * @param {array} positionA  - text position.
   * @param {array} sizeA  - size of text element.
   * @param {string} indentA  - text indent.
   */
  function pushToTextList(valueA, styleA, positionA, sizeA, indentA) {
    textList.push({
      value: valueA,
      compStyle: styleA,
      position: positionA,
      size: sizeA,
      indent: indentA
    });
  }

  /**
   * Recursive function for processing text elements from html.
   * @param {Array} nodesList - The first level of html elements.
   * @param {Object} parent - Parent Node.
   */
  function elementParse(nodesList, parent){
    let firstText = true; // For first pure text in this 'nodeList'.
    let lastText = false; // Last added was pure text.
    let change = false; // Text was added. We need change lastText from previos function call.
    let TextListlength = textList.length;
    let boxSize = getSize(parent); // dimensions of this text box.
    let boxPosition = getPosition(parent); // Position of this text box.
    /** If first was something else like pure text. */
    for(let i = 0; i < nodesList.length; i++){
      if(firstText){
        if(TextListlength !== textList.length){
          firstText = false;
        }
      }
      switch(nodesList[i].nodeName.toLowerCase()){
        /** Skiped HTML elemnts */
        case 'script':
        case 'img':
        case 'style':
        case 'noscript':
        case '#comment':
          break;

        /** Pure text */
        case '#text':
          if(isWhiteSpace(nodesList[i].nodeValue)){ break; } 
          /** First pure text in nodeList.*/
          if (firstText){
            firstText = false;
            lastText = true; 
            change = true;
            //value, compStyle, position, size, indentation
            pushToTextList(nodesList[i].nodeValue.trim(), window.getComputedStyle(nodesList[i].parentNode), getPosition(nodesList[i].parentNode), getSize(nodesList[i].parentNode), null);
          
          /** Other pure text in nodeList.*/
          }else{ 
             /** Last added was pure text from this nodeList.*/
            if(lastText){ 
              textList[textList.length - 1].value = textList[textList.length - 1].value.concat(nodesList[i].nodeValue.trim());
            }else{
              lastText = true;
              let lastPosition = textList[textList.length-1].position;
              let lastWidth = textList[textList.length-1].size;
              let textIndent = lastWidth.width + lastPosition.x; // Text indentation.
              let newposition = getPosition(nodesList[i].parentNode);
              newposition.y =  lastPosition.y; //shift axis Y.
              textIndent = textIndent - newposition.x;
              //value, compStyle, position, size, indentation
              pushToTextList(nodesList[i].nodeValue.trim(),  window.getComputedStyle(nodesList[i].parentNode), newposition, getSize(nodesList[i].parentNode), textIndent);
            }
          }
          break;

        case 'input':
          if(!HiddenTest(nodesList[i])){ break; }
          if(nodesList[i].value != null && !isWhiteSpace(nodesList[i].value)){
            firstText = true;
            lastText = false;
            change = true;
            //value, compStyle, position, size, indentation
            pushToTextList(nodesList[i].value.trim(), window.getComputedStyle(nodesList[i]), getPosition(nodesList[i]),  getSize(nodesList[i]), null)
          }
          break;
        
        default:
          if(!HiddenTest(nodesList[i])){ break; }
          /** <a> elememt */
          if(nodesList[i].nodeName.toLowerCase() === "a"){
            if(nodesList[i].childNodes.length === 1){
              let aPosition = getPosition(nodesList[i]);
              let aSize = getSize(nodesList[i]);
              // <a> exceeds the width of the text box.
              if( (aPosition.x + aSize.width - boxPosition.x)> boxSize.width) {
                if(nodesList[i].firstChild){
                  textList[textList.length - 1].value = textList[textList.length - 1].value.concat(nodesList[i].firstChild.nodeValue.trim());
                  break;
                }
              }
            }
          }
          /** Element with childnodes */
          if (nodesList[i].childNodes.length > 0) {
            change = elementParse(nodesList[i].childNodes, nodesList[i]);
            if(change){ // last added text isn't from this node list.
              lastText = false;
              break;
            }
          }
        break;
      } // switch
    } // for
    return change;
  }

  /** 
   * Creates a text string in json format.
   * Uses values from the global array textList.
   * @returns {string} jsonOutput - Resulting json file. 
  */
  function jsonCreator(){
    let jsonOutput = {
        description: 'Output from Page Analysis WebExtensions app.',
        url: window.location.href,
        backgroundColor: getComputedStyle(document.querySelector('body')).getPropertyValue("background-color")
    }
    jsonOutput = JSON.stringify(jsonOutput);
    jsonOutput = jsonOutput.slice(0,-1).concat(',"text_elements":[{');
    textList.forEach(textElement => {
        let tmpJsonContent = '"Xtext":'+JSON.stringify(textElement.value)+',';  // Elements text.
        let tmpPosition = '"Xposition":'+JSON.stringify(textElement.position)+',';   // Position of Element.
        let tmpSize = '"Xsize":'+JSON.stringify(textElement.size)+','; // Size of Element
        jsonOutput = jsonOutput.concat(tmpJsonContent).concat(tmpPosition).concat(tmpSize); // Concate.
        for(i = 0; i < textElement.compStyle.length; i++){ // Parse Text Elements.
            let compStyleName = textElement.compStyle[i]; 
            /** Styles that we are not interested in */
            if (compStyleName == "background-color") { continue; }   
            if (compStyleName == "quotes") { continue; } 
            /** Indentation */
            if(compStyleName == "text-indent"){
              if(!textElement.indent) {continue;}
              let jsonStyle = '"'+compStyleName+'":'+JSON.stringify(textElement.indent+'px')+',';
              jsonOutput = jsonOutput.concat(jsonStyle);
            /** Other Styles */
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