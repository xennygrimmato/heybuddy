<script>
  import { scale } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import Card, { Content } from "@smui/card";

  let disableVoiceDictation = true;
  let lastRequest;
  let showAllCommandsButton = true;
  let showGrantPermissionButton = true;
  let showSendFeedbackButton = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case "START_LISTENING":
      case "PENDING_RESULT":
      case "RESULT":
        showAllCommandsButton = true;
        showGrantPermissionButton = false;
        lastRequest = request;
        break;
      case "PERMISSION_REQUEST":
        showAllCommandsButton = false;
        showGrantPermissionButton = true;
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
      url: "https://bewisse.com/heybuddy/commands/"
    });
  }

  function viewOptions() {
    chrome.runtime.sendMessage({
      type: "OPEN_URL",
      url: chrome.runtime.getURL("/options.html")
    });
  }

  function sendFeedback() {
    chrome.runtime.sendMessage({
      type: "OPEN_URL",
      url:
        "https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
    });
  }

  function reviewPermission() {
    chrome.permissions.request(
      {
        permissions: lastRequest.permissions
      },
      granted => {
        if (granted) {
          chrome.runtime.sendMessage({
            type: "QUERY",
            query: lastRequest.originalMessage
          });
        }
      }
    );
  }

  chrome.runtime.sendMessage({
    type: "TAB_LOADED"
  });
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
    font-size: 20px;
    margin-bottom: 10px;
  }

  .chrome-voice-assistant-content {
    font-size: 14px;
  }

  .chrome-voice-assistant-logo {
    height: 28px;
    vertical-align: middle;
  }

  .chrome-voice-assistant-icon {
    height: 20px;
    width: 20px;
    vertical-align: middle;
  }

  .chrome-voice-assistant-options {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 35px;
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
      on:click={viewOptions}
      class="chrome-voice-assistant-options"
      viewBox="0 0 24 24">
      <path
        fill="#666"
        d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1
        12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0
        12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34
        7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95
        4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78
        2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95
        2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66
        8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18
        14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66
        16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05
        19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22
        21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05
        21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04
        19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68
        14.87,18.93L14.5,21.58C14.46,21.82 14.25,22
        14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5
        7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64
        6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14
        10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5
        16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37
        17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86
        13.12,6.62L12.75,4H11.25Z" />
    </svg>
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
      <img
        class="chrome-voice-assistant-logo"
        src="img/icon_128.png"
        alt="Logo" />
      {lastRequest.title}
    </h1>
    <p class="chrome-voice-assistant-content">{lastRequest.content}</p>
    <div class="chrome-voice-assistant-action-panel">
      {#if showAllCommandsButton}
        <div class="chrome-voice-assistant-button" on:click={seeAllCommands}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="chrome-voice-assistant-icon"
            viewBox="0 0 24 24">
            <path
              d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" />
          </svg>
          See supported commands
        </div>
      {/if}
      {#if showGrantPermissionButton}
        <div class="chrome-voice-assistant-button" on:click={reviewPermission}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="chrome-voice-assistant-icon"
            viewBox="0 0 24 24">
            <path clip-rule="evenodd" fill="none" d="M0 0h24v24H0z" />
            <path
              d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9
              1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1
              9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
          </svg>
          Review permission
        </div>
      {/if}

      {#if showSendFeedbackButton}
        <div class="chrome-voice-assistant-button" on:click={sendFeedback}>
          <svg class="chrome-voice-assistant-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33
              15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32
              15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0
              9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5
              23,12.26 23,12V10M1,21H5V9H1V21Z" />
          </svg>
          Rate us
        </div>
      {/if}
    </div>
  </div>
{/if}
