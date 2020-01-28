import annyang from "./annyang";
import { DEBUG, storage } from "./common";
import NotificationManager from "./notification";
import { addTextInputCommands } from "./text_input";

function getHost(url) {
  return new URL(url).host;
}

const DEFAULT_COMMAND_PRIORITY = 0.5;

class Commander {
  /** ------- Initialization ------- */
  init(allPlugins) {
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

    this.notificationManager_ = new NotificationManager();
    this.allPlugins_ = allPlugins;
    this.lastCommand_ = "";
    this.popupPort_ = undefined;
    this.enableHotwords_ = false;
    this.commandPriorities_ = {};

    chrome.tabs.onActivated.addListener(activeInfo => {
      this.notificationManager_.resendMessageIfAvailable();
    });

    /** ------- Connection with popup window ------- */
    chrome.runtime.onConnect.addListener(port => {
      if (port.name == "chrome-voice-assistant-popup") {
        this.popupPort_ = port;
        this.startListeningToAllCommands();
        if (!annyang.isListening()) {
          annyang.start();
        }
        port.onDisconnect.addListener(eventPort => {
          if (eventPort === this.popupPort_) {
            this.popupPort_ = undefined;
            this.startListeningToTriggerCommands();
            this.notificationManager_.clearMessage();
          }
        });
      }
    });

    chrome.runtime.onMessage.addListener(async (request, sender) => {
      if (DEBUG) {
        console.log(`Received message: ${JSON.stringify(request)}`);
      }
      switch (request.type) {
        case "OPEN_URL":
          chrome.tabs.create({
            url: request.url
          });
          break;
        case "QUERY":
          annyang.trigger(request.query);
          break;
        case "CLEAR_NOTIFICATION":
          this.clearNotifications();
          break;
        case "TAB_LOADED":
          this.notificationManager_.resendMessageIfAvailable();
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

  clearNotifications() {
    this.startListeningToTriggerCommands();
    this.notificationManager_.clearMessage();
  }

  async startListeningToTextInput() {
    if (DEBUG) {
      console.log("Listening to text input commands");
    }
    await this.startListeningToTriggerCommands({
      abortIfHotwordDisabled: false
    });
    this.startListeningToAllCommands();
    addTextInputCommands(this);
    this.notificationManager_.sendMessage({
      type: "START_LISTENING",
      title: "Voice input mode",
      content: "Ready to transcribe your speech"
    });
  }

  async stopListeningToTextInput() {
    await commander.startListeningToTriggerCommands();
    commander.startListeningToAllCommands();
    this.notificationManager_.sendMessage({
      type: "START_LISTENING",
      title: "Exit voice input mode",
      content: "Listening to regular commands"
    });
  }

  startListeningToAllCommands() {
    this.performActionWithDelay(() => {
      if (this.popupPort_ || this.notificationManager_.hasMessage()) {
        if (DEBUG) {
          console.log("Listening to all commands");
        }
        for (const key in this.regularCommands_) {
          annyang.addCommands(
            { [key]: this.regularCommands_[key] },
            this.commandPriorities_[key]
          );
        }
      }
    });
  }

  async startListeningToTriggerCommands({
    abortIfHotwordDisabled = true
  } = {}) {
    if (DEBUG) {
      console.log("Listening to trigger commands");
    }
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

  requestPermissions(permissions, originalMessage, requestPermissionMessage, callback) {
    chrome.permissions.request(
      {
        permissions: permissions
      },
      granted => {
        if (granted) {
          callback();
        } else {
          this.notificationManager_.sendMessage({
            type: "PERMISSION_REQUEST",
            title: "Permission needed",
            content: requestPermissionMessage,
            originalMessage,
            permissions,
          });
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

  addCommands(
    commandList,
    commandFunction,
    { priority = DEFAULT_COMMAND_PRIORITY } = {}
  ) {
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

    for (const plugin of this.allPlugins_) {
      for (const command of plugin.commands) {
        if (DEBUG) {
          const keys = Object.keys(command);
          if (!keys.includes("commands") || !keys.includes("callback")) {
            console.error(`Invalid command in plugin: `, command);
          }
        }
        this.addCommands(command.commands, command.callback, {
          priority: command.priority || DEFAULT_COMMAND_PRIORITY
        });
      }
    }
  }
}

const commander = new Commander();
export default commander;
