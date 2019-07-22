const getHost = (url) => {
    const parser = document.createElement('a');
    parser.href = url;
    return parser.host;
};

class Commander {
    /** ------- Initialization ------- */
    constructor() {
        if (DEBUG) {
            annyang.debug(true);
        }

        this.notificationManager_ = new NotificationManager({
            onRequestPermission: () => {
                this.requestPermissions(this.lastRequestedPermissions_, () => {});
            },
            onNotificationClosed: () => {
                this.clearTimer();
                this.startListeningToTriggerCommands();
            }
        });
        this.textInputManager_ = new TextInputManager(this);
        this.lastCommand_ = '';
        this.popupPort_ = undefined;
        this.lastRequestedPermissions_ = undefined;
        this.enableHotwords_ = false;
        this.timer_ = undefined;

        /** ------- Connection with popup window ------- */
        chrome
            .runtime
            .onConnect
            .addListener(port => {
                if (port.name == 'chrome-voice-assistant-popup') {
                    this.clearTimer();
                    this.notificationManager_.clearMessage();
                    this.notificationManager_.clearInfoMessage();
                    this.popupPort_ = port;
                    this.startListeningToAllCommands();
                    annyang.start();
                    port
                        .onDisconnect
                        .addListener(eventPort => {
                            if (eventPort == this.popupPort_) {
                                this.popupPort_ = undefined;
                                this.startListeningToTriggerCommands();
                            }
                        });
                }
                port
                    .onMessage
                    .addListener(request => {
                        switch (request.type) {
                            case 'START_TEXT_INPUT':
                                this.startListeningToTextInput();
                                this.notificationManager_.showMessage('Voice input mode started', { requireInteraction: true });
                                break;
                            case 'STOP_TEXT_INPUT':
                                this.notificationManager_.clearMessage();
                                this.startListeningToTriggerCommands();
                                break;
                            case 'QUERY':
                                annyang.trigger(request.query);
                                break;
                            case 'TAB_LOADED':
                                if (request.isMicEnabled && this.enableHotwords_) {
                                    storage.get(['disableInfoPrompt'], result => {
                                        if (result.disableInfoPrompt) {
                                            return;
                                        }
                                        this.notificationManager_.showInfoMessage(
                                            `Microphone may not work on ${getHost(port.sender.url)} because hotword detection is enabled.`
                                        );
                                    });
                                }
                                break;
                        }
                    });
            });

        storage.get(['hotword'], (result) => {
            if (result && result.hotword) {
                this.enableHotwords_ = true;
                annyang.start();
            } else {
                if (annyang.isListening()) {
                    annyang.abort();
                }
            }
        });

        chrome
            .storage
            .onChanged
            .addListener((changes) => {
                const hotword = changes.hotword;
                if (hotword) {
                    this.enableHotwords_ = hotword.newValue;
                    if (hotword.newValue) {
                        annyang.start();
                    } else if (!this.popupPort_ && !this.notificationManager_.hasMessage()) {
                        annyang.abort();
                    }
                }
                const customHotword = changes.customHotword;
                if (customHotword) {
                    this.startListeningToTriggerCommands();
                }
            });

        // Send the result to the popup.
        annyang.addCallback('resultMatch', (userSaid) => {
            this.clearTimer();
            this.timer_ = setTimeout(() => {
                this.sendMessage({ type: 'CLOSE' });
                this.notificationManager_.clearMessage();
            }, 2000);
            this.sendResultMessage(userSaid);
            this.lastCommand_ = userSaid;
        });

        annyang.addCallback('result', (results) => {
            const result = results[0];
            if (result) {
                this.sendMessage({ type: 'PENDING_RESULT', userSaid: result });
                this.notificationManager_.updateMessage(result);
                if (this.timer_) {
                    clearTimeout(this.timer_);
                    this.timer_ = undefined;
                }
            }
        });

        if (DEBUG) {
            annyang.addCallback('start', () => {
                console.log('start');
            });

            annyang.addCallback('end', () => {
                console.log('end');
            });
        }
    }

    clearTimer() {
        if (this.timer_) {
            clearTimeout(this.timer_);
            this.timer_ = undefined;
        }
    }

    startListeningToTextInput() {
        this.startListeningToTriggerCommands();
        this.startListeningToAllCommands();
        this.textInputManager_.addTextInputCommands();
        if (!annyang.isListening()) {
            annyang.start();
        }
    }

    startListeningToAllCommands() {
        annyang.addCommands(this.regularCommands_);
    }

    startListeningToTriggerCommands() {
        this.initTriggerCommands_().then(() => {
            this.initRegularCommands_();
            annyang.removeCommands();
            annyang.addCommands(this.triggerCommands_);
            annyang.addCommands(this.commandsWithTrigger_);
            storage.get(['hotword'], (result) => {
                if (!result.hotword) {
                    if (annyang.isListening()) {
                        annyang.abort();
                    }
                }
            });
        });
    }

    sendMessage(messsage) {
        if (this.popupPort_) {
            this
                .popupPort_
                .postMessage(messsage);
        }
    }

    sendResultMessage(userSaid) {
        this.sendMessage({ type: 'RESULT', userSaid: userSaid });
        this.notificationManager_.updateMessage(userSaid);
    }

    /** ------- Helper functions to perform actions ------- */
    performAction(action) {
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
        chrome
            .permissions
            .request({
                permissions: permissions
            }, granted => {
                if (granted) {
                    callback();
                } else {
                    this.notificationManager_.showPermissionMessage(
                        'Chrome Voice Assistant needs permission to read your bookmarks.');
                }
            });
    }

    getActiveTab(callback) {
        chrome
            .tabs
            .query({
                active: true
            }, (tabs) => {
                if (tabs.length > 0) {
                    callback(tabs[0]);
                }
            });
    }

    executeScripts(code) {
        this.getActiveTab(activeTab => {
            chrome
                .tabs
                .executeScript(activeTab.id, {
                    code: `(function() { ${code} })();`,
                    allFrames: true
                });
        });
    }

    openTabWithUrl(url) {
        this.getActiveTab(activeTab => {
            const activeTabUrl = activeTab.url;
            if (!activeTabUrl || activeTabUrl == 'chrome://newtab/' || getHost(activeTabUrl) == getHost(url)) {
                chrome
                    .tabs
                    .update(activeTab.id, { url: url });
            } else {
                chrome
                    .tabs
                    .create({ url: url, windowId: this.activeWindowId_ });
            }
        });
    }

    /** ------- Handle Triggering commands ------- */
    initTriggerCommands_() {
        const triggerFunction = () => {
            if (this.notificationManager_.hasMessage()) {
                this.performActionWithDelay(() => {
                    this.sendResultMessage('Yes? I am listening.');
                });
                return;
            }
            this.notificationManager_.showMessage('Hi, how can I help you?');
            this.startListeningToAllCommands();
        };
        return new Promise((resolve, reject) => {
            this.triggerCommands_ = {
                'hey buddy': triggerFunction
            };
            storage.get([
                'customHotword'
            ], (result) => {
                if (result.customHotword) {
                    this.triggerCommands_[result.customHotword.toLowerCase()] = triggerFunction;
                }
                resolve();
            });
        });
    }

    addCommands(commandList, commandFunction) {
        for (let command of commandList) {
            if (command.trim() != command) {
                console.error(`${command} should be trimmed`);
            }
            if (this.regularCommands_[command]) {
                console.error(`${command} has already been added`);
            }
            this.regularCommands_[command] = commandFunction;

            // Combine the individual commands with triggering commands, allowing the user
            // to trigger an action with the triggering hotword prefix.
            for (let triggerKey in this.triggerCommands_) {
                const triggerFunction = this.triggerCommands_[triggerKey];
                this.commandsWithTrigger_[triggerKey + ' ' + command] = (query) => {
                    triggerFunction(query);
                    this.performActionWithDelay(() => {
                        this.sendResultMessage(this.lastCommand_.replace(triggerKey, '').trim());
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
        this.addCommands([
            'bye', 'bye bye', 'goodbye', 'good bye', 'close'
        ], () => {
            this.sendMessage({ type: 'CLOSE' });
            this.notificationManager_.clearMessage();
        });

        this.addCommands([
            'stay open'
        ], () => {
            this.notificationManager_.clearMessage();
            this.notificationManager_.showMessage(
                'OK, I will stay open until dismissed.', { requireInteraction: true });
        });

        for (const plugin of allPlugins) {
            plugin.addCommandHandler(this);
        }

    }
};

const commander = new Commander();
commander.startListeningToTriggerCommands();

const setUpContextMenus = () => {
    chrome.contextMenus.removeAll();
    chrome
        .contextMenus
        .create({
            title: '"Hey Buddy" hotword detection',
            type: 'checkbox',
            id: 'hotword',
            contexts: ['browser_action'],
            onclick: (info) => {
                storage.set({ hotword: info.checked });
            }
        });

    storage.get(['hotword'], (result) => {
        chrome
            .contextMenus
            .update('hotword', { checked: result.hotword });
    });

    chrome
        .storage
        .onChanged
        .addListener((changes) => {
            const hotword = changes.hotword;
            if (hotword) {
                chrome
                    .contextMenus
                    .update('hotword', { checked: hotword.newValue });
            }
        });
};

setUpContextMenus();

chrome
    .runtime
    .onInstalled
    .addListener((e) => {
        if (chrome.runtime.OnInstalledReason.INSTALL === e.reason) {
            chrome.runtime.openOptionsPage();
        }
    });