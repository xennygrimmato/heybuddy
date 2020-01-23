class NotificationManager {
  constructor(options) {
    this.notificationId_ = undefined;
    this.infoNotificationId_ = undefined;
    this.permissionNotificationId_ = undefined;

    chrome
      .notifications
      .onClosed
      .addListener((notificationId, byUser) => {
        if (this.notificationId_ == notificationId) {
          this.notificationId_ = undefined;
          options.onNotificationClosed();
        } else if (this.infoNotificationId_ == notificationId) {
          this.infoNotificationId_ = undefined;
        } else if (this.permissionNotificationId_ == notificationId) {
          this.permissionNotificationId_ = undefined;
        }
      });

    chrome
      .notifications
      .onClicked
      .addListener(notificationId => {
        chrome.runtime.openOptionsPage();
      });

    chrome
      .notifications
      .onButtonClicked
      .addListener((notificationId, buttonIndex) => {
        if (notificationId == this.notificationId_) {
          switch (buttonIndex) {
            case 0:
              chrome.runtime.openOptionsPage();
              break;
            case 1:
              chrome
                .tabs
                .create({
                  url: 'https://chrome.google.com/webstore/detail/' +
                    'chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem'
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
        chrome
          .notifications
          .clear(notificationId);
      });
  }

  hasMessage() {
    return this.notificationId_;
  }

  clearMessage() {
    if (this.notificationId_) {
      chrome
        .notifications
        .clear(this.notificationId_);
      this.notificationId_ = undefined;
    }
  }

  showMessage(message, options = {}) {
    if (this.notificationId_) {
      chrome
        .notifications
        .update(this.notificationId_, {
          message: message
        });
      return;
    }
    chrome
      .notifications
      .create('', Object.assign({
        type: 'basic',
        iconUrl: '/icon_128.png',
        title: 'Chrome Voice Assistant',
        buttons: [
          {
            title: 'Options & supported commands',
            iconUrl: 'images/baseline-settings-20px.svg'
          }, {
            title: 'Review & send feedbacks',
            iconUrl: 'images/baseline-feedback-20px.svg'
          }
        ],
        message: message
      }, options), (notificationId) => {
        this.notificationId_ = notificationId;
      });
  }

  updateNotification(updateOptions) {
    if (this.notificationId_) {
      chrome
        .notifications
        .update(this.notificationId_, updateOptions);
    }
  }

  updateMessage(message) {
    this.updateNotification({ message: message });
  }

  clearInfoMessage() {
    if (this.infoNotificationId_) {
      chrome
        .notifications
        .clear(this.infoNotificationId_);
      this.infoNotificationId_ = undefined;
    }
  }

  showInfoMessage(message) {
    if (this.infoNotificationId_) {
      chrome.notifications.update(this.infoNotificationId_, { message: message });
      return;
    }
    chrome
      .notifications
      .create('', {
        type: 'basic',
        iconUrl: '/icon_128.png',
        title: 'Chrome Voice Assistant',
        buttons: [
          {
            title: 'Disable hotwords detection',
            iconUrl: 'images/baseline-mic_off-24px.svg'
          }, {
            title: 'Don\'t show this again',
            iconUrl: 'images/baseline-notifications_off-24px.svg'
          }
        ],
        message: message
      }, (notificationId) => {
        this.infoNotificationId_ = notificationId;
      });
  }

  showPermissionMessage(message) {
    if (this.permissionNotificationId_) {
      chrome.notifications.update(this.permissionNotificationId_, { message: message });
      return;
    }
    chrome
      .notifications
      .create('', {
        type: 'basic',
        iconUrl: '/icon_128.png',
        title: 'Chrome Voice Assistant',
        buttons: [
          {
            title: 'Request permission',
            iconUrl: 'images/baseline-build-24px.svg'
          }
        ],
        message: message
      }, (notificationId) => {
        this.permissionNotificationId_ = notificationId;
      });
  }
}
