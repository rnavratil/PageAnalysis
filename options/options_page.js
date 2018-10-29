document.getElementById('confirm-theme').addEventListener('click', function(){
    browser.storage.local.set({myTheme: document.getElementById('theme-browser').value})
})