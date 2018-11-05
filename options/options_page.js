/**
 * Sets up theme for popup menu.
 */
document.getElementById('confirm-theme').addEventListener('click', function(){
    browser.storage.local.set({myTheme: document.getElementById('theme-browser').value})
})
/**
 * Sets up property for searching hidden elemets.
 */
document.getElementById('confirm-hideElement').addEventListener('click', function(){
    browser.storage.local.set({myHideElement: document.getElementById('hideElement-browser').value})
})
/**
 * Sets up selected option for theme.
 */
browser.storage.local.get('myTheme')
.then(response => {
  if(response.myTheme === "dark"){
    document.getElementById("theme-browser").value = "dark";
  }
  else if(response.myTheme === "classic"){
    document.getElementById("theme-browser").value = "classic";
  };
})
/**
 * Sets up selected option for 'Search hidden elements'.
 */
browser.storage.local.get('myHideElement')
.then(response => {
  if(response.myHideElement === "yes"){
    document.getElementById("hideElement-browser").value = "yes";
  }
  else if(response.myHideElement === "no"){
    document.getElementById("hideElement-browser").value = "no";
  };
})