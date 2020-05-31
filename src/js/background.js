import { allPlugins, allGrammars } from "./plugins/index";
import commander from "./commander";
import { initContextMenus } from "./context_menu";
import { initBrowserAction } from "./browser_actions";
import { initTabMuteListener } from "./tab_muter";

commander.init(allPlugins, allGrammars);
commander.startListeningToTriggerCommands();
initBrowserAction();
initContextMenus();
initTabMuteListener();

chrome.runtime.onInstalled.addListener(e => {
  if (chrome.runtime.OnInstalledReason.INSTALL === e.reason) {
    chrome.runtime.openOptionsPage();
  }
});
