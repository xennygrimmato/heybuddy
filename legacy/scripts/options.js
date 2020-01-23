const options = angular.module('options', ['ngMaterial']);
options.config([
    '$compileProvider', ($compileProvider) => {
        $compileProvider.debugInfoEnabled(false);
    }
]);

options.controller('AppController', ($scope) => {
    $scope.customHotword = '';
    $scope.onCustomHotwordChanged = (value) => {
        storage.set({ customHotword: $scope.customHotword });
    };

    $scope.voiceOption = {
        icon: 'mic',
        title: 'Microphone permission',
        caption: 'Allow microphone access to enable voice commands.',
        showScreenshot: true,
        errorCaption: 'Voice command will not work without microphone access. Please click on the icon ' +
            'at the right hand side of the URL bar to grant access.',
        onClick: (enabled) => {
            location.reload();
        }
    };

    $scope.hotword = {
        icon: 'mic',
        title: '"Hey buddy" hotword detection',
        caption: 'Chrome Voice Assistant will listen to "Hey buddy" command in the background.',
        errorCaption: 'Hotword detection is not enabled. Click here to allow Hey Buddy to listen ' +
            'to hotword in the background',
        onClick: (enabled) => {
            storage.set({ hotword: enabled });
        }
    };

    $scope.notifications = {
        icon: 'notifications',
        title: 'Microphone blocked notifications',
        caption: `Show a notification when visiting a site that has been granted microphone access.`,
        errorCaption: `Notifications will not be shown on sites that have been granted microphone access.
      Microphones may not work on those sites when hotword detection is enabled.`,
        onClick: (enabled) => {
            storage.set({ disableInfoPrompt: !enabled });
        }
    };

    $scope.voiceDictation = {
        icon: 'edit',
        title: 'Voice input mode',
        caption: 'Enable voice input when focused on a textbox.',
        errorCaption: 'Enable this setting will allow you to use speech to text to compose email, ' +
            'fill out form, take notes, etc.',
        onClick: (enabled) => {
            storage.set({ disableVoiceDictation: !enabled });
        }
    };

    $scope.shortcut = {
        icon: 'keyboard',
        title: 'Keyboard shortcut',
        enabled: true,
        disableClick: true
    };

    $scope.plugins = allPlugins;

    chrome
        .commands
        .getAll(commands => {
            $scope.shortcut.caption = commands[0].shortcut;
        });

    storage.get([
        'customHotword',
        'hotword', 'disableInfoPrompt', 'disableVoiceDictation'
    ], (result) => {
        $scope.customHotword = result.customHotword;
        $scope.hotword.enabled = result.hotword;
        $scope.notifications.enabled = !result.disableInfoPrompt;
        $scope.voiceDictation.enabled = !result.disableVoiceDictation
    });

    navigator
        .mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            $scope.$apply(() => {
                $scope.voiceOption.enabled = true;
            });
        })
        .catch((error) => {
            $scope.$apply(() => {
                $scope.voiceOption.enabled = false;
            });
        });
});

options.directive('optionCard', () => {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            option: '=option'
        },
        controller: [
            '$scope',
            function OptionController($scope) {
                $scope.onClick = () => {
                    const option = $scope.option;
                    if (option.disableClick) {
                        return;
                    }
                    option.enabled = !option.enabled;
                    option.onClick(option.enabled);
                };
            }
        ],
        templateUrl: 'directives/option-card.html'
    };
});

options.directive('optionPlugin', () => {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            plugin: '=plugin'
        },
        templateUrl: 'directives/option-plugin.html'
    };
});