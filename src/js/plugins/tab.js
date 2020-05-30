import { performActionWithDelay } from './core';

const commands = [
  {
    /** ------- Tab management commands ------- */
    commands: ["open new tab"],
    callback: () => {
      performActionWithDelay(() => {
        chrome.tabs.create({});
      });
    }
  },
  {
    commands: [
      "close tab",
      "close this tab",
      "close the tab",
    ],
    callback: () => {
      performActionWithDelay(() => {
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
      "close the other tabs",
      "close all (tabs) but this (tab)"
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
      performActionWithDelay(() => {
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
    commands: ["side by side"],
    callback: () => {
      chrome.tabs.query({}, (tabs => {
        if (tabs.length >= 2) {
          tabs.sort((a, b) => {
            if (a.currentWindow && a.active) {
              return -1;
            }
            if (b.currentWindow && b.active) {
              return 1;
            }
            return b.index - a.index
          });
          const screen = window.screen;
          const tabA = tabs[0];
          const tabB = tabs[1];
          if (tabA.windowId === tabB.windowId) {
            chrome.windows.create({
              tabId: tabB.id,
              left: Math.ceil(screen.availWidth / 2),
              top: 0,
              width: screen.availWidth / 2,
              height: screen.availHeight
            })
          } else {
            chrome.windows.update(tabB.windowId, {
              left: Math.ceil(screen.availWidth / 2),
              top: 0,
              width: screen.availWidth / 2,
              height: screen.availHeight
            });
          }
          
          chrome.windows.update(tabA.windowId, {
            left: 0,
            top: 0,
            width: Math.ceil(screen.availWidth / 2),
            height: screen.availHeight,
            focused: true
          });
        }
      }))
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
];

export default commands;
