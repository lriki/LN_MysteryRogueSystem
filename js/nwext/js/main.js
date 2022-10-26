
function getTitle() {
    return "AAAA";
    return document.title;
  }

  
chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
        console.log(response);
    });
}); 

chrome.devtools.panels.create("MR-System", null, '/panel.html', (panel) => {

    // panel.createSidebarPane("My Sidebar",
    //     function(sidebar) {
    //         // sidebar initialization code here
    //         sidebar.setObject({ some_data: "Some data to show" });
    // });

    panel.onShown.addListener((extPanelWindow) => {
        const tabId = chrome.devtools.inspectedWindow.tabId
        availableMemoryCapacity = extPanelWindow.document.querySelector('#availableMemoryCapacity');
        totalMemoryCapacity = extPanelWindow.document.querySelector('#totalMemoryCapacity');
        //availableMemoryCapacity.innerHTML = "tab" +  tabId;
        //availableMemoryCapacity.innerHTML = chrome.scripting;   // undefined
        //availableMemoryCapacity.innerHTML = chrome.tabs;    // object 
        //availableMemoryCapacity.innerHTML = chrome.tabs.executeScript;
        
        /*
        try {

            // content script のコンテキストにスクリプトを送り込む
            chrome.tabs.executeScript(tabId, {
                //code: "console.log(\"TEST!\"); 1+1"
                file: "/js/content_script.js"
                //code: "'AAA'",
                //code: 'document.body.style.backgroundColor="red"',
                //code: 'alart("TEST")'
            },
            (result) => {
                availableMemoryCapacity.innerHTML = "RE!" +  result;
            });
            // then は使えない。promise を返さない。
            // .then((result) => {
            //     availableMemoryCapacity.innerHTML = "RE2!" +  result;
            // });
        }
        catch (e) {
            availableMemoryCapacity.innerHTML = e;
        }
        */

        chrome.devtools.inspectedWindow.eval(
           //"jQuery.fn.jquery",
            //"console.log(100)",
            "$dataSystem",
            function(result, isException) {
              if (isException) {
                availableMemoryCapacity.innerHTML = "the page is not using jQuery";
              } else {
                availableMemoryCapacity.innerHTML = "The page is using jQuery v" + result;
              }
              availableMemoryCapacity.innerHTML = "RE2!" +  JSON.stringify(result);
            }
          );
        

        //availableMemoryCapacity.innerHTML = "Ready";
        
        // 受信
        chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
            const tabId = chrome.devtools.inspectedWindow.tabId;
            availableMemoryCapacity = extPanelWindow.document.querySelector('#availableMemoryCapacity');
            availableMemoryCapacity.innerHTML = "RE3!" +  request;
            //sendResponse({tabId: tabId, message: "mrr_xxx", options: {fuga:request.hoge+request.hoge}});
            sendResponse("OK??");
            
            availableMemoryCapacity.innerHTML = "RE3!" +  request.hoge;
            return true;
        });
    });

});

// content script のコンテキストにスクリプトを送り込む
// chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId,{
    
//     //file: "./content_script.js"
// });
// console.log("EXT!!!!");

// https://docs.nwjs.io/en/latest/For%20Users/Debugging%20with%20DevTools/
// https://developer.chrome.com/extensions/devtools_panels