/** 
 * Recieve message from the popup script.
*/
(function() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "start analysis") {
      textAnalysis(message.property);
    }
  });

  /** 
   * Process text information from the html file of the current web page.
  */
  function textAnalysis(hideElement) {
    
    /** @global - Array of objects. Object contains text value and css code.*/
    var textList = new Array();

    let rootNode = document.querySelector('body');  // Load root of html file.
    let nodesList = rootNode.childNodes; // Load first level.
    console.log(nodesList);
    elementParse(nodesList);
    let jsonFile = jsonCreator();
    console.log(jsonFile);
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
      }
      return true;
    }

    function Storage(codes){
      browser.storage.local.set({htmlFromServer: codes});
    }


    function sendMessage(){
      function handleResponse(message) {
        // console.log(`Message from the background script:  ${message.response}`);
      }

      function handleError(error) {
        console.log(`Error: ${error}`);
      }
    
      var sending = browser.runtime.sendMessage({
        // greeting: "",
        command: "Content"
      });

      sending.then(handleResponse, handleError);  
    }

    function sendRequest(jsonFile){
      console.log('start');
      var xhr = new XMLHttpRequest();
      var url = "http://localhost/index1.php/"//"http://localhost/index1.php/"; https://pageanalisis.000webhostapp.com/index2.php
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Access-Control-Allow-Origin", "http://localhost/index1.php/");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          console.log(xhr.responseText);
          Storage(xhr.responseText);
          sendMessage();
        }
      };
      console.log(xhr);
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

    /**
     * Recursive function for processing text elements from html.
     * @param {Array} nodesList - The first level of html elements.
     */
    function elementParse(nodesList){
      nodesList.forEach(node => {  
        switch(node.nodeName.toLowerCase()){
          case 'script':
            break;
          
          case 'style':
            break;

          case 'noscript':
            break;

          case '#comment':
            break;

          case '#text':
            if(!isWhiteSpace(node.nodeValue)){
              textList.push({
                value: node.nodeValue.trim(),
                compStyle: window.getComputedStyle(node.parentNode),
                position: getPosition(node.parentNode)
              });
            }
            break;

          case 'input':
            if(HiddenTest(node)){
              if(node.value != null && !isWhiteSpace(node.value)){
                textList.push({
                value: node.value.trim(),
                compStyle: window.getComputedStyle(node),
                position: getPosition(node.parentNode)
                });
              }
            }
            break;

          default:
            if(HiddenTest(node)){
              if (node.childNodes.length > 0) {
                elementParse(node.childNodes);
              }
            }
            break;
        }
      });
    }

    /** 
     * Creates a text string in json format.
     * Uses values from the global field textList.
     * @returns {string} jsonOutput - Resulting json file. 
    */
    function jsonCreator(){
      let jsonOutput = {
          description: 'Output from Page Analysis WebExtensions app.',
          url: window.location.href 
      
      }
      jsonOutput = JSON.stringify(jsonOutput);
      jsonOutput = jsonOutput.slice(0,-1).concat(',"text_elements":[{');
      textList.forEach(textElement => {
          let tmpJsonContent = '"Xtext":'+JSON.stringify(textElement.value)+',';
          jsonOutput = jsonOutput.concat(tmpJsonContent);
          let tmp = '"Xposition":'+JSON.stringify(textElement.position)+',';
          jsonOutput = jsonOutput.concat(tmp);
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
})();