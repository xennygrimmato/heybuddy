import { DEBUG } from "./common";
import { updateBrowserAction } from "./browser_actions";
import { activeListening } from './store';

const NOTIFICATION_TIMEOUT = 15000; 

export default class NotificationManager {
  constructor() {
    this.lastData_ = undefined;
    activeListening.subscribe(value => {
      if (value) {
        this.sendMessage({
          type: "START_LISTENING",
          title: "Listening",
          content: "Hi, how can I help you?"
        });
      } else {
        this.clearMessage();
      }
    });
  }

  hasMessage() {
    return this.lastData_ !== null;
  }

  clearMessage() {
    this.lastData_ = null;
    updateBrowserAction(false);
    return this.innerSendMessage({
      type: "CLEAR_NOTIFICATION"
    });
  }

  async sendMessage(request) {
    this.lastData_ = request;
    await this.innerSendMessage(request);
    setTimeout(() => {
      if (this.lastData_ === request) {
        activeListening.set(false);
      }
    }, NOTIFICATION_TIMEOUT);
  }

  async resendMessageIfAvailable() {
    if (this.lastData_) {
      await this.innerSendMessage(this.lastData_);
    } else {
      await this.clearMessage();
    }
  }

  async innerSendMessage(request) {
    if (DEBUG) {
      console.log(`Sending request: ${JSON.stringify(request)}`);
    }
    chrome.runtime.sendMessage(request);
    try {
      const activeTab = await this.getActiveTab();
      chrome.tabs.sendMessage(activeTab.id, request);
    } catch (err) {
      console.log(`Ignoring tab notification. Error: ${err}`);
    }
  }

  getActiveTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(
        {
          active: true
        },
        tabs => {
          if (tabs.length > 0) {
            const activeTab = tabs[0];
            // Cannot send message to chrome URLs.
            if (activeTab.url && !activeTab.url.startsWith("chrome")) {
              resolve(activeTab);
              return;
            }
          }
          reject("No active tab found.");
        }
      );
    });
  }
}
