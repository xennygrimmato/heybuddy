import annyang from "./annyang";
import { DEBUG, storage } from "./common";
import NotificationManager from "./notification";
import { updateBrowserAction } from "./browser_actions";

function getHost(url) {
  return new URL(url).host;
}

const DEFAULT_COMMAND_PRIORITY = 0.5;

class Commander {
  /** ------- Initialization ------- */
  init(allPlugins, allGrammars) {
    if (DEBUG) {
      annyang.debug(true);
    }
    annyang.addGrammars(
      "#JSGF V1.0; grammar triggers; public <trigger> = hey buddy;"
    );
    for (const grammars of allGrammars) {
      annyang.addGrammars(grammars);
    }

    this.notificationManager_ = new NotificationManager(this);
    this.allPlugins_ = allPlugins;
    this.lastCommand_ = "";
    this.commandPriorities_ = {};

    chrome.tabs.onActivated.addListener(activeInfo => {
      this.notificationManager_.resendMessageIfAvailable();
    });

    chrome.runtime.onMessage.addListener(async (request, sender) => {
      if (DEBUG) {
        console.log(`Received message: ${JSON.stringify(request)}`);
      }
      switch (request.type) {
        case "TRIGGER":
          this.trigger();
          break;
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
        annyang.start();
      } else {
        annyang.abort();
      }
    });

    chrome.storage.onChanged.addListener(changes => {
      const hotword = changes.hotword;
      if (hotword) {
        if (hotword.newValue) {
          annyang.start();
        } else if (!this.notificationManager_.hasMessage()) {
          annyang.abort();
        }
      }
      const customHotword = changes.customHotword;
      if (customHotword) {
        this.startListeningToTriggerCommands();
      }
    });

    annyang.addCallback("resultMatch", async userSaid => {
      if (DEBUG) {
        console.log(`ResultMatch: ${userSaid}`);
      }
      this.sendResultMessage(userSaid);
      this.lastCommand_ = userSaid;
    });

    annyang.addCallback("result", results => {
      const result = results[0];
      if (result && this.notificationManager_.hasMessage()) {
        this.notificationManager_.sendMessage({
          type: "PENDING_RESULT",
          title: "Listening",
          content: result
        });
      }
    });
    updateBrowserAction(false);
  }

  clearNotifications() {
    this.startListeningToTriggerCommands();
    this.notificationManager_.clearMessage();
  }

  startListeningToAllCommands() {
    this.notificationManager_.sendMessage({
      type: "START_LISTENING",
      title: "Listening",
      content: "Hi, how can I help you?"
    });
    updateBrowserAction(true);
    this.performActionWithDelay(() => {
      if (this.notificationManager_.hasMessage()) {
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

  async startListeningToTriggerCommands() {
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
    storage.get(["hotword"], result => {
      if (!result.hotword) {
        annyang.abort();
      }
    });
  }

  sendResultMessage(userSaid) {
    if (this.notificationManager_.hasMessage()) {
      this.notificationManager_.sendMessage({
        type: "RESULT",
        title: "Received command",
        content: userSaid
      });
    }
  }

  /** ------- Helper functions to perform actions ------- */
  async performAction(action) {
    if (this.notificationManager_.hasMessage()) {
      action();
    }
  }

  performActionWithDelay(action) {
    setTimeout(() => {
      this.performAction(action);
    }, 100);
  }

  requestPermissions(
    permissions,
    originalMessage,
    requestPermissionMessage,
    callback
  ) {
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
            permissions
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

  trigger() {
    this.getActiveTab(activeTab => {
      if (!activeTab.url || activeTab.url.startsWith("chrome")) {
        // We can't use content script on chrome URLs, so need to create a new tab.
        chrome.tabs.create({ url: "https://www.google.com" }, () =>
          this.startListeningToAllCommands()
        );
      } else {
        this.startListeningToAllCommands();
      }
    });
  }

  /** ------- Handle Triggering commands ------- */
  initTriggerCommands_() {
    return new Promise((resolve, reject) => {
      const hotword = "hey buddy";
      this.triggerCommands_ = {
        [hotword]: () => this.trigger()
      };
      this.commandPriorities_[hotword] = 1;
      storage.get(["customHotword"], result => {
        if (result.customHotword) {
          this.triggerCommands_[result.customHotword.toLowerCase()] = () =>
            this.trigger();
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
      this.regularCommands_[command] = (arg0, arg1, arg2) => {
        commandFunction(arg0, arg1, arg2);
        this.autoCloseIfNeeded();
      };
      this.commandPriorities_[command] = priority;

      // Combine the individual commands with triggering commands, allowing the user
      // to trigger an action with the triggering hotword prefix.
      for (let triggerKey in this.triggerCommands_) {
        const triggerAndCommand = triggerKey + " " + command;
        this.commandPriorities_[triggerAndCommand] = priority;
        this.commandsWithTrigger_[triggerAndCommand] = (arg0, arg1, arg2) => {
          this.trigger();
          this.performActionWithDelay(() => {
            this.sendResultMessage(
              this.lastCommand_.replace(triggerKey, "").trim()
            );
            commandFunction(arg0, arg1, arg2);
            this.autoCloseIfNeeded();
          });
        };
      }
    }
  }

  /** ------- Handle regular commands ------- */
  initRegularCommands_() {
    this.regularCommands_ = {};
    this.commandsWithTrigger_ = {};

    for (const command of this.allPlugins_) {
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

  autoCloseIfNeeded() {
    this.performActionWithDelay(() => {
      chrome.storage.local.get(["autoOff"], result => {
        if (result.autoOff) {
          commander.clearNotifications();
        }
      });
    })
  }

}

const commander = new Commander();
export default commander;
