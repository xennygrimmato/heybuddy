import { performActionWithDelay } from '../core';


/** ------- Photos management commands ------- */
const commands = [
  {
    action: 'GO_TO_GOOGLE_PHOTOS',
    callback: () => {
    let exists = false;
    let tabId = 0;
    chrome.tabs.query({windowId: -2}, tabs => {
        for (const tab of tabs) {
            if (!tab.url.startsWith("chrome") && 
                 tab.url.toLowerCase().includes("photos.google")) {
                exists = true;
                tabId = tab.id;
                break;
            }
        }
        if (!exists) {
            performActionWithDelay(() => {
                let url = "https://photos.google.com";
                chrome.tabs.create({ url: url });
            });
        } else {
            chrome.tabs.update(tabId, { active: true });
        }
    });
}}
];

export default commands;
