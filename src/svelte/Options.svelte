<script>
  import "../css/options.scss";
  import {
    mdiMicrophone,
    mdiBellRing,
    mdiPencil,
    mdiKeyboard,
    mdiComment
  } from "@mdi/js";
  import Card, { Content } from "@smui/card";
  import Textfield from "@smui/textfield";
  import Tab, { Icon, Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Button, { Label } from "@smui/button";
  import MdiIcon from "./MdiIcon.svelte";
  import OptionCard from "./OptionCard.svelte";
  import OptionPlugin from "./OptionPlugin.svelte";
  import { DEBUG, ICON_COLOR, storage } from "../js/common";
  import { allPlugins } from "../js/plugins";

  let tabs = ["Options", "Supported commands"];
  const tabIndex = new URL(window.location).searchParams.get('tab') || 0;
  let activeTab = tabs[tabIndex];
  let customHotword = "";

  let voiceOption = {
    icon: mdiMicrophone,
    title: "Microphone permission",
    caption: "Allow microphone access to enable voice commands.",
    showScreenshot: true,
    errorCaption:
      "Voice command will not work without microphone access. Please click on the icon " +
      "at the right hand side of the URL bar to grant access.",
    onClick: enabled => {
      location.reload();
    }
  };

  let hotword = {
    icon: mdiMicrophone,
    title: '"Hey buddy" hotword detection',
    caption:
      'Chrome Voice Assistant will listen to "Hey buddy" command in the background.',
    errorCaption:
      "Hotword detection is not enabled. Click here to allow Hey Buddy to listen " +
      "to hotword in the background",
    onClick: enabled => {
      storage.set({ hotword: enabled });
    }
  };

  let notifications = {
    icon: mdiBellRing,
    title: "Microphone blocked notifications",
    caption: `Show a notification when visiting a site that has been granted microphone access.`,
    errorCaption: `Notifications will not be shown on sites that have been granted microphone access.
      Microphones may not work on those sites when hotword detection is enabled.`,
    onClick: enabled => {
      storage.set({ disableInfoPrompt: !enabled });
    }
  };

  let voiceDictation = {
    icon: mdiPencil,
    title: "Voice input mode",
    caption: "Enable voice input when focused on a textbox.",
    errorCaption:
      "Enable this setting will allow you to use speech to text to compose email, " +
      "fill out form, take notes, etc.",
    onClick: enabled => {
      storage.set({ disableVoiceDictation: !enabled });
    }
  };

  let shortcut = {
    icon: mdiKeyboard,
    title: "Keyboard shortcut",
    caption: "",
    errorCaption:
      "Go to chrome://extensions/shortcuts to set the keyboard shortcut.",
    enabled: false,
    onClick: enabled => {
      chrome.tabs.query(
        {
          active: true
        },
        tabs => {
          if (tabs.length > 0) {
            const activeTab = tabs[0];
            chrome.tabs.update(activeTab.id, {
              url: "chrome://extensions/shortcuts"
            });
          }
        }
      );
    }
  };

  chrome.commands.getAll(commands => {
    shortcut.caption = commands[0].shortcut || "";
    shortcut.enabled = !!shortcut.caption;
  });

  storage.get(
    ["customHotword", "hotword", "disableInfoPrompt", "disableVoiceDictation"],
    result => {
      customHotword = result.customHotword;
      hotword.enabled = result.hotword;
      notifications.enabled = !result.disableInfoPrompt;
      voiceDictation.enabled = !result.disableVoiceDictation;
    }
  );

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
      voiceOption.enabled = true;
    })
    .catch(error => {
      voiceOption.enabled = false;
    });

  $: storage.set({ customHotword });
</script>

<style>
  :global(.main-content) {
    margin: auto;
    padding: 5px;
    width: 50%;
  }

  :global(.hotword-input) {
    width: 400px;
  }

  :global(.reviews-button) {
    float: right;
  }

  .flex-container {
    display: flex;
    flex-wrap: wrap;
  }
</style>

<div class="main-content">
  <h1 class="mdc-typography--headline5">
    Chrome Voice Assistant
    <Button
      class="reviews-button"
      href="https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
      target="_blank">
      <MdiIcon size="24" icon={mdiComment} color={ICON_COLOR} />
      &nbsp;
      <Label color={ICON_COLOR}>Review / Send feedbacks</Label>
    </Button>
  </h1>

  <TabBar {tabs} let:tab bind:active={activeTab}>
    <Tab {tab}>
      <Label>{tab}</Label>
    </Tab>
  </TabBar>
  {#if activeTab === tabs[0]}
    {#if !voiceOption.enabled}
      <OptionCard option={voiceOption} />
    {/if}
    {#if voiceOption.enabled}
      <OptionCard option={hotword} />
      <OptionCard option={notifications} />
    {/if}
    <OptionCard option={voiceDictation} />
    <OptionCard option={shortcut} />
    <Card class="card">
      <Content>
        <div class="mdc-typography--subtitle1">Hotwords</div>
        <div class="mdc-typography--caption">
          Say one of these hotwords to trigger Chrome Voice Assistant by voice.
        </div>
        <Textfield
          variant="filled"
          disabled
          class="hotword-input"
          value="Hey Buddy (default and cannot be changed)"
          input$readonly
          input$aria-readonly />
        <Textfield
          variant="outlined"
          class="hotword-input"
          input$placeholder="Set custom hotword"
          bind:value={customHotword}
          input$minlength="5" />
      </Content>
    </Card>
  {/if}
  {#if activeTab === tabs[1]}
    <div class="flex-container">
      {#each allPlugins as plugin}
        <OptionPlugin {plugin} />
      {/each}
    </div>
  {/if}
</div>
