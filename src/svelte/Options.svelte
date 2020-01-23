<script>
  import Button from "@smui/button";
  import Textfield from "@smui/textfield";
</script>

<div>
  <h1 class="md-headline">Chrome Voice Assistant</h1>
  <div layout="column">
    <option-card option="voiceOption" ng-hide="voiceOption.enabled" />
    <option-card option="hotword" ng-show="voiceOption.enabled" />
    <option-card option="notifications" ng-show="voiceOption.enabled" />
    <option-card option="voiceDictation" />
    <option-card option="shortcut" />
    <h2>Hotwords</h2>
    <md-input-container class="hotword-input">
      <Textfield value="Hey Buddy (default)" readonly aria-readonly />
    </md-input-container>
    <md-input-container class="hotword-input">
      <label>Custom hotword</label>
      <Textfield
        name="customHotword"
        ng-model="customHotword"
        ng-change="onCustomHotwordChanged()"
        minlength="5" />
    </md-input-container>
  </div>
  <h2 class="md-headline">Supported commands</h2>
  <div layout="row" layout-align="center center" layout-wrap>
    <option-plugin flex="50" ng-repeat="plugin in plugins" plugin="plugin" />
  </div>

  <md-divider />

  <md-button
    class="md-primary"
    href="https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
    layout="column"
    target="_blank">
    <span>
      <i class="material-icons md-24 primary-icon align-middle">feedback</i>
      Review / Send feedbacks
    </span>
  </md-button>
</div>
