export function updateBrowserAction(enabled) {
  if (enabled) {
    chrome.browserAction.setBadgeBackgroundColor({
      color: "#fff"
    });
    chrome.browserAction.setBadgeText({
      text: ""
    });
    chrome.browserAction.setIcon({
      path: "/img/icon_128.png"
    });
  } else {
    chrome.browserAction.setBadgeBackgroundColor({
      color: "#888"
    });
    chrome.browserAction.setBadgeText({
      text: "\u23F8"
    });
    chrome.browserAction.setIcon({
      path: "/img/icon_128_bw.png"
    });
  }
}
