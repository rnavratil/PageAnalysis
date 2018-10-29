(function() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "start analysis") {
      textAnalysis();
    }
  });

  /** Zpracovává informace o textu z html souboru aktuální stránky. */
  function textAnalysis() {
    
    let rootNode = document.querySelector('body'); // Nacist koren stromu.
    let nodesList = rootNode.childNodes; // Prvni uroven.
    console.log(nodesList);
    var textList = new Array(); // Pole objektu.
    elementParse(nodesList); // Zpracovani elementu.
    console.log(jsonCreator()); // Vytvoreni vystupu


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

        // SCRIPT a STYLE preskakujeme
        if(node.nodeName.toLowerCase() === "script"){
          return;
        }
        if(node.nodeName.toLowerCase() === "style"){
          return;
        }
        // Jedna se o TEXT, ktery zpracujeme.
        if (node.nodeName === "#text" && !isWhiteSpace(node.nodeValue)) {
            textList.push({
                value: node.nodeValue.trim(),
                compStyle: window.getComputedStyle(node.parentNode)
            });
        }
        // Kontrola zda neni element skryt
         if(node.nodeName != "#text"){
          let ppp = window.getComputedStyle(node);
          if(ppp.getPropertyValue('display') === 'none'){
            return;
          }
          if(ppp.getPropertyValue('visibility') === 'hidden'){
            return;
          } 
        }
        // Zpracovani inputu
        if(node.nodeName.toLowerCase() === 'input'){
          if(node.value != null && !isWhiteSpace(node.value)){
            textList.push({
            value: node.value.trim(),
            compStyle: window.getComputedStyle(node)
           });
          }
        }
        // Nacteni potomku elementu
        if (node.childNodes.length > 0) {
            elementParse(node.childNodes);
        }
      });
    }

    //Funkce
    function jsonCreator(){
      let jsonOutput = {
          description: 'page',
          url: window.location.href 
      
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
              if(compStyleName === "--szn-select--state-arrow-opened"){
                continue; // TODO
              }
              if(compStyleName === "--szn-select--state-arrow-closed"){
                continue; // TODO
              }
              if(compStyleName === "background-image"){
                continue; // TODO
              }
              if(compStyleName === "--szn-select--button--icon-opened"){
                continue; // TODO
              }
              if(compStyleName === "--szn-select--button--icon-closed"){
                continue; // TODO
              }
              if(compStyleName === "-moz-binding"){
                continue; // TODO
              }
              if(compStyleName === "font-family"){
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
