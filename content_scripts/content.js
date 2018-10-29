(function() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "start analysis") {
      textAnalysis();
    }
  });

  function textAnalysis() {
    // Nacist koren stromu.
    let rootNode = document.querySelector('body');
    
    // Prvni uroven.
    let nodesList = rootNode.childNodes;
  
    // Zpracovani elementu.
    var textList = new Array(); // Pole objektu.
    elementParse(nodesList);

    // Vytvoreni vystupu
    console.log(jsonCreator());

    // Funkce 
    function isWhiteSpace(string){
      let re = /^\s*$/;
      if(re.exec(string)){
          return true;
      }
      return false;
    }

    // Funkce
    function elementParse(nodesList){
      nodesList.forEach(node => {
        if (node.nodeName === "#text" && !isWhiteSpace(node.nodeValue)) {
            textList.push({
                value: node.nodeValue.trim(),
                compStyle: window.getComputedStyle(node.parentNode)
            });
        }
        if (node.childNodes.length > 0) {
            elementParse(node.childNodes);
        }
      });
    }

    //Funkce
    function jsonCreator(){
      let jsonOutput = {
          description: 'page',
          url: 'seznam.cz'
      
      }
      jsonOutput = JSON.stringify(jsonOutput);
      jsonOutput = jsonOutput.slice(0,-1).concat(',"text_elements":[{');

      textList.forEach(textElement => {
          let tmpJsonContent = '"#text":"'+textElement.value+'",';
          jsonOutput = jsonOutput.concat(tmpJsonContent);
          for(i = 0; i < textElement.compStyle.length; i++){
              let compStyleName = textElement.compStyle[i];
              if(compStyleName === "quotes"){
                  continue; // TODO
              }
              if(compStyleName === "background-image"){
                continue; // TODO
              }
              let jsonStyle = '"'+compStyleName+'":"'+textElement.compStyle.getPropertyValue(compStyleName)+'",';
              jsonOutput = jsonOutput.concat(jsonStyle);
          }
          jsonOutput = jsonOutput.slice(0,-1).concat('},{');
      });
      jsonOutput = jsonOutput.slice(0,-2).concat(']}');
      return jsonOutput;
    }

  }
})();
