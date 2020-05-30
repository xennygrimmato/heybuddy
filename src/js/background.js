import { storage } from "./common";
import { allPlugins, allGrammars } from "./plugins/index";
import commander from "./commander";
import "./browser_actions";
import "./tab_muter";

commander.init(allPlugins, allGrammars);
commander.startListeningToTriggerCommands();

const setUpContextMenus = () => {
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
};

setUpContextMenus();

chrome.runtime.onInstalled.addListener(e => {
  if (chrome.runtime.OnInstalledReason.INSTALL === e.reason) {
    chrome.runtime.openOptionsPage();
  }
});
