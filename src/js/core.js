import { get } from 'svelte/store';
import { isActiveListening } from './store';

function getHost(url) {
  return new URL(url).host;
}

export function performAction(action) {
  if (isActiveListening()) {
    action();
  }
}

export function performActionWithDelay(action) {
  setTimeout(() => {
    performAction(action);
  }, 100);
}


export function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, tabs => {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject('No active tab found');
      }
    });
  });
}

export async function executeScripts(code) {
  const activeTab = await getActiveTab();
  chrome.tabs.executeScript(activeTab.id, {
    code: `(function() { ${code} })();`,
    allFrames: true
  });
}

export async function openTabWithUrl(url) {
  const activeTab = await getActiveTab();
  const activeTabUrl = activeTab.url;
  if (
    !activeTabUrl ||
    activeTabUrl == "chrome://newtab/" ||
    getHost(activeTabUrl) == getHost(url)
  ) {
    chrome.tabs.update(activeTab.id, { url: url });
  } else {
    chrome.tabs.create({ url: url });
  }
}

function get_search_confidence(tab, text) {
  // 1. Get all content in <body>...</body> tags
  // 2. Get frequency of text
  return 1.0;
}

async function find_tab_with_text(text) {
  chrome.tabs.query({windowId: -2}, tabs => {
    for (const tab of tabs) {
      console.log(tab.title, tab.url)
    }
    // tab_confidence_map = {};
    // for (tab in tabs) {
    //   console.log(tab.title, tab.url)
    //   tab_confidence_map[tab.id] = get_search_confidence(tab, text);
    // }
    // max_confidence = 0.0
    // max_confidence_tab = -1
    // for (const [key, value] of Object.entries(tab_confidence_map)) {
    //   if (value > max_confidence) {
    //     max_confidence = value
    //     max_confidence_tab = key
    //   }
    // }
    // return max_confidence_tab
  })
}

export function openTabWithText(windowId, text) {
  // Get id of tab containing text
  // find_tab_with_text(text, (tabId => {
  //   console.log('here2')
  //   chrome.tabs.update(tabId, { active: true });
  // }));
  chrome.tabs.query({windowId: windowId}, tabs => {
    let goodIdx = -1;
    for (const tab of tabs) {
      if (tab.title === undefined) {
        console.log(tab.index)
        continue
      }
      if (tab.title.toLowerCase().includes(text)) {
        goodIdx = tab.index
      }
      console.log(tab.title, tab.url)
    }
    console.log("goodIdx" + goodIdx)
    chrome.tabs.update(tabs[goodIdx].id, { active: true });
  });
}
