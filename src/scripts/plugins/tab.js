registerPlugin({
  name: 'Browser tab',
  icon: 'tab',
  queries: [
    'close tab', 'close other tabs | close all tabs', 'pin tab | unpin tab', 'mute | unmute', 'maximize window | minimize window',
    'enter fullscreen | exit fullscreen'
  ],
  addCommandHandler: (commander) => {
    /** ------- Tab management commands ------- */
    commander.addCommands(['open new tab'], () => {
      commander.performActionWithDelay(() => {
        chrome
          .tabs
          .create({});
      });
    });

    commander.addCommands([
      'close tab', 'close this tab', 'close the tab'
    ], () => {
      commander.performActionWithDelay(() => {
        chrome
          .tabs
          .query({
            active: true
          }, (tabs) => {
            if (tabs.length > 0) {
              chrome
                .tabs
                .remove(tabs[0].id);
            }
          });
      });
    });

    commander.addCommands([
      'close other tab', 'close other tabs', 'close the other tab', 'close the other tabs'
    ], () => {
      chrome
        .tabs
        .query({
          active: false
        }, (tabs) => {
          for (let tab of tabs) {
            chrome
              .tabs
              .remove(tab.id);
          }
        });
    });

    commander.addCommands([
      'close tab to the right', 'close tabs to the right'
    ], () => {
      chrome
        .tabs
        .query({}, (tabs) => {
          let activeTabIndex = -1;
          for (let tab of tabs) {
            if (tab.active) {
              activeTabIndex = tab.index;
            }
          }
          for (let tab of tabs) {
            if (tab.index > activeTabIndex) {
              chrome
                .tabs
                .remove(tab.id);
            }
          }
        });
    });

    commander.addCommands([
      'close tab to the left', 'close tabs to the left'
    ], () => {
      chrome
        .tabs
        .query({}, (tabs) => {
          let activeTabIndex = -1;
          for (let tab of tabs) {
            if (tab.active) {
              activeTabIndex = tab.index;
            }
          }
          for (let tab of tabs) {
            if (tab.index < activeTabIndex) {
              chrome
                .tabs
                .remove(tab.id);
            }
          }
        });
    });

    commander.addCommands([
      'close all tab',
      'close all tabs',
      'close all the tab',
      'close all the tabs',
      'close window',
      'close this window',
      'exit window'
    ], () => {
      commander.performActionWithDelay(() => {
        chrome
          .windows
          .getCurrent({}, window => {
            chrome
              .windows
              .remove(window.id);
          });
      });
    });

    commander.addCommands([
      'pin', 'pin tab', 'pin this tab', 'pin the tab'
    ], () => {
      chrome
        .tabs
        .query({
          active: true
        }, (tabs) => {
          if (tabs.length > 0) {
            chrome
              .tabs
              .update(tabs[0].id, {pinned: true});
          }
        });
    });

    commander.addCommands([
      'unpin', 'unpin tab', 'unpin this tab', 'unpin the tab'
    ], () => {
      chrome
        .tabs
        .query({
          active: true
        }, (tabs) => {
          if (tabs.length > 0) {
            chrome
              .tabs
              .update(tabs[0].id, {pinned: false});
          }
        });
    });

    commander.addCommands([
      'mute', 'mute tab'
    ], (query) => {
      chrome
        .tabs
        .query({
          active: true
        }, (tabs) => {
          if (tabs.length > 0) {
            chrome
              .tabs
              .update(tabs[0].id, {muted: true});
          }
        });
    });

    commander.addCommands([
      'unmute', 'unmute tab'
    ], (query) => {
      chrome
        .tabs
        .query({
          active: true
        }, (tabs) => {
          if (tabs.length > 0) {
            chrome
              .tabs
              .update(tabs[0].id, {muted: false});
          }
        });
    });

    commander.addCommands([
      'mute all (the) tab', 'mute all (the) tabs'
    ], (query) => {
      chrome
        .tabs
        .query({}, (tabs) => {
          for (let tab of tabs) {
            chrome
              .tabs
              .update(tab.id, {muted: true});
          }
        });
    });

    commander.addCommands([
      'unmute all (the) tab', 'unmute all (the) tabs'
    ], (query) => {
      chrome
        .tabs
        .query({}, (tabs) => {
          for (let tab of tabs) {
            chrome
              .tabs
              .update(tab.id, {muted: false});
          }
        });
    });

    commander.addCommands([
      'mute other (the) tab', 'mute other (the) tabs'
    ], (query) => {
      chrome
        .tabs
        .query({}, (tabs) => {
          for (let tab of tabs) {
            if (!tab.active) {
              chrome
                .tabs
                .update(tab.id, {muted: true});
            }
          }
        });
    });

    commander.addCommands([
      'unmute other (the) tab', 'unmute other (the) tabs'
    ], (query) => {
      chrome
        .tabs
        .query({}, (tabs) => {
          for (let tab of tabs) {
            if (!tab.active) {
              chrome
                .tabs
                .update(tab.id, {muted: false});
            }
          }
        });
    });

    commander.addCommands([
      'maximize', 'maximize window'
    ], (query) => {
      chrome
        .windows
        .getCurrent({}, window => {
          chrome
            .windows
            .update(window.id, {state: 'maximized'});
        });
    });
    
    commander.addCommands([
      'minimize', 'minimize window'
    ], (query) => {
      chrome
        .windows
        .getCurrent({}, window => {
          chrome
            .windows
            .update(window.id, {state: 'minimized'});
        });
    });

    commander.addCommands([
      'fullscreen', 'full screen', 'full-screen',
      'enter fullscreen', 'enter full screen', 'enter full-screen'
    ], (query) => {
      chrome
        .windows
        .getCurrent({}, window => {
          chrome
            .windows
            .update(window.id, {state: 'fullscreen'});
        });
    });

    commander.addCommands([
      'exit fullscreen', 'exit full screen', 'exit full-screen'
    ], (query) => {
      chrome
        .windows
        .getCurrent({}, window => {
          chrome
            .windows
            .update(window.id, {state: 'normal'});
        });
    });
  }
});