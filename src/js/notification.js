import moment from "moment";

export default class NotificationManager {
  constructor(options) {
    this.lastData_ = undefined;
    chrome.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        if (notificationId == this.infoNotificationId_) {
          switch (buttonIndex) {
            case 0:
              storage.set({ hotword: false });
              break;
            case 1:
              storage.set({ disableInfoPrompt: true });
              break;
          }
        } else if (notificationId == this.permissionNotificationId_) {
          switch (buttonIndex) {
            case 0:
              options.onRequestPermission();
              break;
          }
        }
        chrome.notifications.clear(notificationId);
      }
    );
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
    console.log(request);
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
          reject('No active tab found.');
        }
      );
    });
  }
}
