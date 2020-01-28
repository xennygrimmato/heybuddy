import { DEBUG } from "./common";

export default class NotificationManager {
  constructor() {
    this.lastData_ = undefined;
  }

  hasMessage() {
    return this.lastData_ !== null;
  }

  clearMessage() {
    return this.innerSendMessage({
      type: "CLEAR_NOTIFICATION"
    });
  }

  async sendMessage(request) {
    this.lastData_ = request;
    await this.innerSendMessage(request);
    setTimeout(() => {
      if (this.lastData_ === request) {
        this.lastData_ = null;
        this.clearMessage();
      }
    }, 5000);
  }

  async innerSendMessage(request) {
    if (DEBUG) {
      console.log(`Sending request`, request);
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
