import { mdiTab } from "@mdi/js";
import commander from "../commander";

const plugins = [
  {
    name: "Browser tab",
    icon: mdiTab,
    queries: [
      "close tab",
      "close other tabs | close all tabs",
      "pin tab | unpin tab",
      "mute | unmute",
      "maximize window | minimize window",
      "enter fullscreen | exit fullscreen"
    ],
    grammars: [
      "#JSGF V1.0; grammar tabs; public <tab> = close tab | close other tabs | close all tabs;"
    ],
    commands: [
      {
        /** ------- Tab management commands ------- */
        commands: ["open new tab"],
        callback: () => {
          commander.performActionWithDelay(() => {
            chrome.tabs.create({});
          });
        }
      },
      {
        commands: ["close tab", "close this tab", "close the tab"],
        callback: () => {
          commander.performActionWithDelay(() => {
            chrome.tabs.query(
              {
                active: true
              },
              tabs => {
                if (tabs.length > 0) {
                  chrome.tabs.remove(tabs[0].id);
                }
              }
            );
          });
        },
        priority: 1
      },
      {
        commands: [
          "close other tab",
          "close other tabs",
          "close the other tab",
          "close the other tabs"
        ],
        callback: () => {
          chrome.tabs.query(
            {
              active: false
            },
            tabs => {
              for (let tab of tabs) {
                chrome.tabs.remove(tab.id);
              }
            }
          );
        }
      },

      {
        commands: ["close tab to the right", "close tabs to the right"],
        callback: () => {
          chrome.tabs.query({}, tabs => {
            let activeTabIndex = -1;
            for (let tab of tabs) {
              if (tab.active) {
                activeTabIndex = tab.index;
              }
            }
            for (let tab of tabs) {
              if (tab.index > activeTabIndex) {
                chrome.tabs.remove(tab.id);
              }
            }
          });
        }
      },

      {
        commands: ["close tab to the left", "close tabs to the left"],
        callback: () => {
          chrome.tabs.query({}, tabs => {
            let activeTabIndex = -1;
            for (let tab of tabs) {
              if (tab.active) {
                activeTabIndex = tab.index;
              }
            }
            for (let tab of tabs) {
              if (tab.index < activeTabIndex) {
                chrome.tabs.remove(tab.id);
              }
            }
          });
        }
      },
      {
        commands: [
          "close all tab",
          "close all tabs",
          "close all the tab",
          "close all the tabs",
          "close window",
          "close this window",
          "exit window"
        ],
        callback: () => {
          commander.performActionWithDelay(() => {
            chrome.windows.getCurrent({}, window => {
              chrome.windows.remove(window.id);
            });
          });
        }
      },

      {
        commands: ["pin", "pin tab", "pin this tab", "pin the tab"],
        callback: () => {
          chrome.tabs.query(
            {
              active: true
            },
            tabs => {
              if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { pinned: true });
              }
            }
          );
        }
      },

      {
        commands: ["unpin", "unpin tab", "unpin this tab", "unpin the tab"],
        callback: () => {
          chrome.tabs.query(
            {
              active: true
            },
            tabs => {
              if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { pinned: false });
              }
            }
          );
        }
      },

      {
        commands: ["mute", "mute tab"],
        callback: query => {
          chrome.tabs.query(
            {
              active: true
            },
            tabs => {
              if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { muted: true });
              }
            }
          );
        }
      },

      {
        commands: ["unmute", "unmute tab"],
        callback: query => {
          chrome.tabs.query(
            {
              active: true
            },
            tabs => {
              if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { muted: false });
              }
            }
          );
        }
      },

      {
        commands: ["mute all (the) tab", "mute all (the) tabs"],
        callback: query => {
          chrome.tabs.query({}, tabs => {
            for (let tab of tabs) {
              chrome.tabs.update(tab.id, { muted: true });
            }
          });
        }
      },

      {
        commands: ["unmute all (the) tab", "unmute all (the) tabs"],
        callback: query => {
          chrome.tabs.query({}, tabs => {
            for (let tab of tabs) {
              chrome.tabs.update(tab.id, { muted: false });
            }
          });
        }
      },

      {
        commands: ["mute other (the) tab", "mute other (the) tabs"],
        callback: query => {
          chrome.tabs.query({}, tabs => {
            for (let tab of tabs) {
              if (!tab.active) {
                chrome.tabs.update(tab.id, { muted: true });
              }
            }
          });
        }
      },

      {
        commands: ["unmute other (the) tab", "unmute other (the) tabs"],
        callback: query => {
          chrome.tabs.query({}, tabs => {
            for (let tab of tabs) {
              if (!tab.active) {
                chrome.tabs.update(tab.id, { muted: false });
              }
            }
          });
        }
      },

      {
        commands: ["maximize", "maximize window"],
        callback: query => {
          chrome.windows.getCurrent({}, window => {
            chrome.windows.update(window.id, { state: "maximized" });
          });
        }
      },

      {
        commands: ["minimize", "minimize window"],
        callback: query => {
          chrome.windows.getCurrent({}, window => {
            chrome.windows.update(window.id, { state: "minimized" });
          });
        }
      },

      {
        commands: [
          "fullscreen",
          "full screen",
          "full-screen",
          "enter fullscreen",
          "enter full screen",
          "enter full-screen"
        ],
        callback: query => {
          chrome.windows.getCurrent({}, window => {
            chrome.windows.update(window.id, { state: "fullscreen" });
          });
        }
      },

      {
        commands: ["exit fullscreen", "exit full screen", "exit full-screen"],
        callback: query => {
          chrome.windows.getCurrent({}, window => {
            chrome.windows.update(window.id, { state: "normal" });
          });
        }
      }
    ]
  }
];

export default plugins;
