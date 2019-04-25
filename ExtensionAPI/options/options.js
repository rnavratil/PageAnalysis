/**
 * Sets up theme for server address.
 */
document.getElementById('confirm-address').addEventListener('click', function(){
    chrome.storage.local.set({myAddress: document.getElementById('serverAddress').value});
})

/**
 * Sets up theme for popup menu.
 */
document.getElementById('confirm-theme').addEventListener('click', function(){
    chrome.storage.local.set({myTheme: document.getElementById('theme-browser').value});
})

/**
 * Sets up property for searching hidden elemets.
 */
document.getElementById('confirm-hideElement').addEventListener('click', function(){
    chrome.storage.local.set({myHideElement: document.getElementById('hideElement-browser').value});
})

/**
 * Sets up selected option for server address.
 */
chrome.storage.local.get(['myAddress'], function(result) {
    if(result.myAddress){
        document.getElementById("serverAddress").value = result.myAddress;
    }
});

/**
 * Sets up selected option for theme.
 */
chrome.storage.local.get(['myTheme'], function(result) {
    if(result.myTheme === "dark"){
        document.getElementById("theme-browser").value = "dark";
    }else if (result.myTheme === "classic"){
        document.getElementById("theme-browser").value = "classic";
    }
});

/**
 * Sets up selected option for 'Search hidden elements'.
 */
chrome.storage.local.get(['myHideElement'], function(result) {
    if(result.myHideElement === "yes"){
        document.getElementById("hideElement-browser").value = "yes";
    }else if (result.myHideElement === "no"){
        document.getElementById("hideElement-browser").value = "no";
    }
});
