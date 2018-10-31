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