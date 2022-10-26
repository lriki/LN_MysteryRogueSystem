

manifest_version は 2.

例えば、chrome.scripting は使えない。

https://developer.chrome.com/docs/extensions/mv2/devtools/

```
{
    "manifest_version": 2,
  
    "name": "Osudio Dev Tools",
    "version": "0.1",
  
    "description": "Frontend Developer Tools for Osudio",
    "author": "Osudio Frontend Team",
  
    "devtools_page": "html/devtools.html",
    "content_scripts": [
      {
        "matches": [
          "http://*/*", "https://*/*",
          "chrome-extension://*/*"
        ],
        "js": ["./js/content_script.js"]
      }
    ],

    "permissions": [
      "tabs",
      "activeTab",
      "chrome-extension://*",
      "http://*/*",
      "index.html",
      "http://index.html",
      "https://index.html"
    ],
    "host_permissions": [
      "chrome-extension://*"
    ]
  }

```