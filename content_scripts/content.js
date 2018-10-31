/** 
 * Capture message from the popup script.
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
    elementParse(nodesList);
    console.log(jsonCreator());

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
     * Recursive function for processing text elements from html.
     * @param {Array} nodesList - The first level of html elements.
     */
    function elementParse(nodesList){
      nodesList.forEach(node => {  
        if(!hideElement){
          if(node.nodeName != "#text"){
            if(window.getComputedStyle(node).getPropertyValue('display') === 'none'){
              return;
            }
            if(window.getComputedStyle(node).getPropertyValue('visibility') === 'hidden'){
              return;
            } 
          } 
        }

        switch(node.nodeName.toLowerCase()){
          case 'script':
            break;
          
          case 'style':
            break;

          case 'noscript':
            break;

          case '#text':
            if(!isWhiteSpace(node.nodeValue)){
              textList.push({
                value: node.nodeValue.trim(),
                compStyle: window.getComputedStyle(node.parentNode)
              });
            }
            break;

          case 'input':
            if(node.value != null && !isWhiteSpace(node.value)){
              textList.push({
              value: node.value.trim(),
              compStyle: window.getComputedStyle(node)
              });
            }
            break;

          default:
            if (node.childNodes.length > 0) {
              elementParse(node.childNodes);
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
          let tmpJsonContent = '"#text":'+JSON.stringify(textElement.value)+',';
          jsonOutput = jsonOutput.concat(tmpJsonContent);
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