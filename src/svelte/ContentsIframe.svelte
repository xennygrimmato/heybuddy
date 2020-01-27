<script>
  const url = chrome.runtime.getURL("/notification_ui.html");
  let showIframe = false;

  chrome.runtime.onMessage.addListener(async request => {
    switch (request.type) {
      case "START_LISTENING":
      case "PENDING_RESULT":
      case "RESULT":
        showIframe = true;
        break;
      case "CLEAR_NOTIFICATION":
        showIframe = false;
        break;
    }
  });
</script>

<style>
  .chrome-voice-assistant {
    border: none;
    position: fixed;
    width: 330px;
    height: 270px;
    bottom: 10px;
    right: 10px;
    z-index: 1000000;
  }
</style>

{#if showIframe}
  <iframe
    class="chrome-voice-assistant"
    seamless
    src={url}
    title="Chrome Voice Assistant" />
{/if}
