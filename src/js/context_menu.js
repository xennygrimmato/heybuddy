import { storage } from "./common";

export function initContextMenus() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: '"Hey Buddy" hotword detection',
    type: "checkbox",
    id: "hotword",
    contexts: ["browser_action"],
    onclick: info => {
      storage.set({ hotword: info.checked });
    }
  });

  storage.get(["hotword"], result => {
    chrome.contextMenus.update("hotword", { checked: result.hotword });
  });

  chrome.storage.onChanged.addListener(changes => {
    const hotword = changes.hotword;
    if (hotword) {
      chrome.contextMenus.update("hotword", { checked: hotword.newValue });
    }
  });
}
