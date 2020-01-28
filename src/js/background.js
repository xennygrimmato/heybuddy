import annyang from "./annyang";
import { DEBUG, storage } from "./common";
import { allPlugins } from "./plugins/index";
import NotificationManager from "./notification";
import TextInputManager from "./text_input";

const getHost = url => {
  const parser = document.createElement("a");
  parser.href = url;
  return parser.host;
};

class Commander {
  /** ------- Initialization ------- */
  constructor() {
    if (DEBUG) {
      annyang.debug(true);
    }
    annyang.addGrammars(
      "#JSGF V1.0; grammar triggers; public <trigger> = hey buddy;"
    );
    for (const plugin of allPlugins) {
      if (plugin.grammars) {
        annyang.addGrammars(plugin.grammars);
      }
    }

    this.notificationManager_ = new NotificationManager({
      onRequestPermission: () => {
        this.requestPermissions(this.lastRequestedPermissions_, () => {});
      },
      onNotificationClosed: () => {
        this.startListeningToTriggerCommands();
      }
    });
    this.textInputManager_ = new TextInputManager(this);
    this.lastCommand_ = "";
    this.popupPort_ = undefined;
    this.lastRequestedPermissions_ = undefined;
    this.enableHotwords_ = false;
    this.commandPriorities_ = {};

    /** ------- Connection with popup window / content script ------- */
    chrome.runtime.onConnect.addListener(port => {
      if (port.name == "chrome-voice-assistant-popup") {
        this.popupPort_ = port;
        this.startListeningToAllCommands();
        annyang.start();
        port.onDisconnect.addListener(eventPort => {
          if (eventPort == this.popupPort_) {
            this.popupPort_ = undefined;
            this.startListeningToTriggerCommands();
          }
        });
      }
    });

    chrome.runtime.onMessage.addListener(async (request, sender) => {
      if (DEBUG) {
        console.log(`Received message: `, request);
      }
      switch (request.type) {
        case "OPEN_URL":
          chrome.tabs.create({
            url: request.url
          });
          break;
        case "START_TEXT_INPUT":
          await this.startListeningToTextInput();
          this.notificationManager_.sendMessage({
            type: "START_LISTENING",
            title: "Voice input mode",
            content: "Ready to transcribe your speech"
          });
          break;
        case "STOP_TEXT_INPUT":
          await this.startListeningToTriggerCommands();
          this.startListeningToAllCommands();
          break;
        case "QUERY":
          annyang.trigger(request.query);
          break;
        case "TAB_LOADED":
          if (request.isMicEnabled && this.enableHotwords_) {
            storage.get(["disableInfoPrompt"], result => {
              if (result.disableInfoPrompt) {
                return;
              }
              // this.notificationManager_.showInfoMessage(
              //   `Microphone may not work on ${getHost(
              //     sender.url
              //   )} because hotword detection is enabled.`
              // );
            });
          }
          break;
      }
    });

    storage.get(["hotword"], result => {
      if (result && result.hotword) {
        this.enableHotwords_ = true;
        annyang.start();
      } else {
        if (annyang.isListening()) {
          annyang.abort();
        }
      }
    });

    chrome.storage.onChanged.addListener(changes => {
      const hotword = changes.hotword;
      if (hotword) {
        this.enableHotwords_ = hotword.newValue;
        if (hotword.newValue) {
          annyang.start();
        } else if (
          !this.popupPort_ &&
          !this.notificationManager_.hasMessage()
        ) {
          annyang.abort();
        }
      }
      const customHotword = changes.customHotword;
      if (customHotword) {
        this.startListeningToTriggerCommands();
      }
    });

    // Send the result to the popup.
    annyang.addCallback("resultMatch", async userSaid => {
      if (DEBUG) {
        console.log(`ResultMatch: ${userSaid}`);
      }
      this.sendResultMessage(userSaid);
      this.lastCommand_ = userSaid;
      await this.startListeningToTriggerCommands();
      this.startListeningToAllCommands();
    });

    annyang.addCallback("result", results => {
      const result = results[0];
      if (
        result &&
        (this.popupPort_ || this.notificationManager_.hasMessage())
      ) {
        this.notificationManager_.sendMessage({
          type: "PENDING_RESULT",
          title: "Listening",
          content: result
        });
      }
    });

    if (DEBUG) {
      annyang.addCallback("start", () => {
        console.log("start");
      });

      annyang.addCallback("end", () => {
        console.log("end");
      });
    }
  }

  async startListeningToTextInput() {
    await this.startListeningToTriggerCommands({
      abortIfHotwordDisabled: false
    });
    this.startListeningToAllCommands();
    this.textInputManager_.addTextInputCommands();
    if (!annyang.isListening()) {
      annyang.start();
    }
  }

  startListeningToAllCommands() {
    for (const key in this.regularCommands_) {
      annyang.addCommands(
        { [key]: this.regularCommands_[key] },
        this.commandPriorities_[key]
      );
    }
  }

  async startListeningToTriggerCommands({
    abortIfHotwordDisabled = true
  } = {}) {
    await this.initTriggerCommands_();
    this.initRegularCommands_();
    annyang.removeCommands();
    for (const key in this.triggerCommands_) {
      annyang.addCommands(
        { [key]: this.triggerCommands_[key] },
        this.commandPriorities_[key]
      );
    }
    for (const key in this.commandsWithTrigger_) {
      annyang.addCommands(
        { [key]: this.commandsWithTrigger_[key] },
        this.commandPriorities_[key]
      );
    }
    if (abortIfHotwordDisabled) {
      storage.get(["hotword"], result => {
        if (!result.hotword) {
          if (annyang.isListening()) {
            annyang.abort();
          }
        }
      });
    }
  }

  sendResultMessage(userSaid) {
    if (this.popupPort_ || this.notificationManager_.hasMessage()) {
      this.notificationManager_.sendMessage({
        type: "RESULT",
        title: "Received command",
        content: userSaid
      });
    }
  }

  /** ------- Helper functions to perform actions ------- */
  async performAction(action) {
    if (this.popupPort_ || this.notificationManager_.hasMessage()) {
      action();
    }
  }

  performActionWithDelay(action) {
    setTimeout(() => {
      this.performAction(action);
    }, 100);
  }

  requestPermissions(permissions, callback) {
    this.lastRequestedPermissions_ = permissions;
    chrome.permissions.request(
      {
        permissions: permissions
      },
      granted => {
        if (granted) {
          callback();
        } else {
          this.notificationManager_.showPermissionMessage(
            "Chrome Voice Assistant needs permission to read your bookmarks."
          );
        }
      }
    );
  }

  getActiveTab(callback) {
    chrome.tabs.query(
      {
        active: true
      },
      tabs => {
        if (tabs.length > 0) {
          callback(tabs[0]);
        }
      }
    );
  }

  executeScripts(code) {
    this.getActiveTab(activeTab => {
      chrome.tabs.executeScript(activeTab.id, {
        code: `(function() { ${code} })();`,
        allFrames: true
      });
    });
  }

  openTabWithUrl(url) {
    this.getActiveTab(activeTab => {
      const activeTabUrl = activeTab.url;
      if (
        !activeTabUrl ||
        activeTabUrl == "chrome://newtab/" ||
        getHost(activeTabUrl) == getHost(url)
      ) {
        chrome.tabs.update(activeTab.id, { url: url });
      } else {
        chrome.tabs.create({ url: url, windowId: this.activeWindowId_ });
      }
    });
  }

  /** ------- Handle Triggering commands ------- */
  initTriggerCommands_() {
    const triggerFunction = () => {
      // if (this.notificationManager_.hasMessage()) {
      //   this.performActionWithDelay(() => {
      //     this.sendResultMessage("Yes? I am listening.");
      //   });
      //   return;
      // }
      this.notificationManager_.sendMessage({
        type: "START_LISTENING",
        title: "Listening",
        content: "Hi, how can I help you?"
      });
      this.startListeningToAllCommands();
    };
    return new Promise((resolve, reject) => {
      const hotword = "hey buddy";
      this.triggerCommands_ = {
        [hotword]: triggerFunction
      };
      this.commandPriorities_[hotword] = 1;
      storage.get(["customHotword"], result => {
        if (result.customHotword) {
          this.triggerCommands_[
            result.customHotword.toLowerCase()
          ] = triggerFunction;
          this.commandPriorities_[result.customHotword.toLowerCase()] = 1;
        }
        resolve();
      });
    });
  }

  addCommands(commandList, commandFunction, { priority = 0.5 } = {}) {
    for (let command of commandList) {
      if (command.trim() != command) {
        console.error(`${command} should be trimmed`);
      }
      if (this.regularCommands_[command]) {
        console.error(`${command} has already been added`);
      }
      this.regularCommands_[command] = commandFunction;
      this.commandPriorities_[command] = priority;

      // Combine the individual commands with triggering commands, allowing the user
      // to trigger an action with the triggering hotword prefix.
      for (let triggerKey in this.triggerCommands_) {
        const triggerFunction = this.triggerCommands_[triggerKey];
        const triggerAndCommand = triggerKey + " " + command;
        this.commandPriorities_[triggerAndCommand] = priority;
        this.commandsWithTrigger_[triggerAndCommand] = query => {
          triggerFunction(query);
          this.performActionWithDelay(() => {
            this.sendResultMessage(
              this.lastCommand_.replace(triggerKey, "").trim()
            );
            commandFunction(query);
          });
        };
      }
    }
  }

  /** ------- Handle regular commands ------- */
  initRegularCommands_() {
    this.regularCommands_ = {};
    this.commandsWithTrigger_ = {};

    /** ------- Termination commands ------- */
    this.addCommands(["bye", "bye bye", "goodbye", "good bye", "close"], () => {
      this.notificationManager_.clearMessage();
    });

    for (const plugin of allPlugins) {
      plugin.addCommandHandler(this);
    }
  }
}

const commander = new Commander();
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
