<script>
  import { scale } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import Card, { Content } from "@smui/card";

  let disableVoiceDictation = true;
  let lastRequest;
  let showAllCommandsButton = true;
  let showSendFeedbackButton = true;

  navigator.mediaDevices.enumerateDevices().then(devices => {
    let isMicEnabled = false;
    for (let device of devices) {
      if (device.kind == "audioinput") {
        if (device.label) {
          isMicEnabled = true;
          break;
        }
      }
    }
    chrome.runtime.sendMessage({
      type: "TAB_LOADED",
      isMicEnabled: isMicEnabled
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case "START_LISTENING":
      case "PENDING_RESULT":
      case "RESULT":
        showAllCommandsButton = true;
        showSendFeedbackButton = true;
        lastRequest = request;
        break;
      case "INFO_NOTIFICATION":
        showAllCommandsButton = false;
        showSendFeedbackButton = false;
        lastRequest = request;
        break;
      case "CLEAR_NOTIFICATION":
        lastRequest = null;
        break;
      case "CHECK_NOTIFICATION":
        sendResponse({ hasNotification: lastRequest !== null });
        break;
    }
  });

  function close() {
    lastRequest = null;
    chrome.runtime.sendMessage({ type: "CLEAR_NOTIFICATION" });
  }

  function seeAllCommands() {
    chrome.runtime.sendMessage({
      type: "OPEN_URL",
      url: chrome.runtime.getURL("/options.html?tab=1")
    });
  }

  function sendFeedback() {
    chrome.runtime.sendMessage({
      type: "OPEN_URL",
      url:
        "https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
    });
  }
</script>

<style scoped>
  .chrome-voice-assistant {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
    background: rgba(225, 225, 225, 0.95);
    position: fixed;
    border-radius: 6px;
    width: 300px;
    height: 240px;
    z-index: 1000000;
    padding: 10px;
  }

  .chrome-voice-assistant-title,
  .chrome-voice-assistant-content,
  .chrome-voice-assistant-button,
  .chrome-voice-assistant-logo {
    font-family: Verdana, Geneva, sans-serif;
    font-weight: normal;
    color: black;
    line-height: 1em;
    letter-spacing: normal;
  }

  .chrome-voice-assistant-title {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .chrome-voice-assistant-content {
    font-size: 14px;
  }

  .chrome-voice-assistant-logo {
    font-size: 14px;
    vertical-align: middle;
  }

  .chrome-voice-assistant-close {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .chrome-voice-assistant-button {
    cursor: pointer;
    background: white;
    display: block;
    border: 1px solid #aaa;
    margin-top: 5px;
    padding: 5px;
  }

  .chrome-voice-assistant-action-panel {
    position: absolute;
    bottom: 10px;
    width: 300px;
  }
</style>

{#if lastRequest && lastRequest.title && lastRequest.content}
  <div
    class="chrome-voice-assistant"
    in:scale={{ easing: elasticOut, duration: 500 }}
    out:scale={{ duration: 200 }}>
    <svg
      width="24"
      height="24"
      on:click={close}
      class="chrome-voice-assistant-close"
      viewBox="0 0 24 24">
      <path
        fill="#666"
        d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59
        20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22
        12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2
        12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
    </svg>
    <h1 class="chrome-voice-assistant-title">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        class="chrome-voice-assistant-logo"
        viewBox="0 0 24 24"
        fill="#2196f3">
        <path
          d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9
          5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0
          3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
      {lastRequest.title}
    </h1>
    <p class="chrome-voice-assistant-content">{lastRequest.content}</p>
    <div class="chrome-voice-assistant-action-panel">
      {#if showAllCommandsButton}
        <div class="chrome-voice-assistant-button" on:click={seeAllCommands}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            class="chrome-voice-assistant-logo"
            viewBox="0 0 20 20">
            <path fill="none" d="M0 0h20v20H0V0z" />
            <path
              d="M15.95
              10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12
              2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3
              2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6
              2.77c-.1.18-.06.39.1.51l1.69
              1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37
              12.1c-.15.12-.19.34-.1.51l1.6
              2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3
              2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47
              1.35-.78l1.99.8c.18.07.39 0
              .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65
              0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
          </svg>
          See supported commands
        </div>
      {/if}
      {#if showSendFeedbackButton}
        <div class="chrome-voice-assistant-button" on:click={sendFeedback}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            class="chrome-voice-assistant-logo"
            viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9
              2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
          </svg>
          Rate / review us
        </div>
      {/if}
    </div>
  </div>
{/if}
