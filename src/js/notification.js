export default class NotificationManager {
  constructor(options) {
    this.notificationId_ = undefined;
    this.infoNotificationId_ = undefined;
    this.permissionNotificationId_ = undefined;

    chrome.notifications.onClosed.addListener((notificationId, byUser) => {
      if (this.notificationId_ == notificationId) {
        this.notificationId_ = undefined;
        options.onNotificationClosed();
      } else if (this.infoNotificationId_ == notificationId) {
        this.infoNotificationId_ = undefined;
      } else if (this.permissionNotificationId_ == notificationId) {
        this.permissionNotificationId_ = undefined;
      }
    });

    chrome.notifications.onClicked.addListener(notificationId => {
      chrome.runtime.openOptionsPage();
    });

    chrome.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        if (notificationId == this.notificationId_) {
          switch (buttonIndex) {
            case 0:
              chrome.runtime.openOptionsPage();
              break;
            case 1:
              chrome.tabs.create({
                url:
                  "https://chrome.google.com/webstore/detail/" +
                  "chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
              });
              break;
          }
        } else if (notificationId == this.infoNotificationId_) {
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
    // return this.notificationId_;
    return true;
  }

  clearMessage() {
    this.sendMessage({
      type: "CLEAR_NOTIFICATION"
    });
  }

  showMessage(message) {
    this.sendMessage(message);
  }

  showInfoMessage(message) {
    this.sendMessage({
      type: "INFO_NOTIFICATION",
      title: "Notice",
      content: message
    });
    // if (this.infoNotificationId_) {
    //   chrome.notifications.update(this.infoNotificationId_, {
    //     message: message
    //   });
    //   return;
    // }
    // chrome.notifications.create(
    //   "",
    //   {
    //     type: "basic",
    //     iconUrl: "img/icon_128.png",
    //     title: "Chrome Voice Assistant",
    //     buttons: [
    //       {
    //         title: "Disable hotwords detection",
    //         iconUrl: "img/baseline-mic_off-24px.svg"
    //       },
    //       {
    //         title: "Don't show this again",
    //         iconUrl: "img/baseline-notifications_off-24px.svg"
    //       }
    //     ],
    //     message: message
    //   },
    //   notificationId => {
    //     this.infoNotificationId_ = notificationId;
    //   }
    // );
  }

  showPermissionMessage(message) {
    this.sendMessage({
      type: "NOTIFICATION",
      title: "Permission needed",
      content: message
    });
    // if (this.permissionNotificationId_) {
    //   chrome.notifications.update(this.permissionNotificationId_, {
    //     message: message
    //   });
    //   return;
    // }
    // chrome.notifications.create(
    //   "",
    //   {
    //     type: "basic",
    //     iconUrl: "img/icon_128.png",
    //     title: "Chrome Voice Assistant",
    //     buttons: [
    //       {
    //         title: "Request permission",
    //         iconUrl: "img/baseline-build-24px.svg"
    //       }
    //     ],
    //     message: message
    //   },
    //   notificationId => {
    //     this.permissionNotificationId_ = notificationId;
    //   }
    // );
  }

  sendMessage(request) {
    chrome.runtime.sendMessage(request);
    chrome.tabs.query(
      {
        active: true
      },
      tabs => {
        if (tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, request);
        }
      }
    );
  }
}
