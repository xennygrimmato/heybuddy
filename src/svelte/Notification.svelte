<script>
  import Card, { Content } from "@smui/card";
  let disableVoiceDictation = true;
  let lastRequest;

  chrome.runtime.onMessage.addListener(request => {
    switch (request.type) {
      case "NOTIFICATION":
        lastRequest = request;
        break;
    }
  });
  const TRIGGER_INPUT_TYPES = [
    "text",
    "email",
    "number",
    "search",
    "tel",
    "url"
  ];
  const onFocus = () => {
    if (disableVoiceDictation) {
      return;
    }
    const focusedElement = document.activeElement;
    const tagName = focusedElement.tagName.toLowerCase();
    const contenteditable = focusedElement.getAttribute("contenteditable");
    if (tagName == "input") {
      const inputType = focusedElement.getAttribute("type");
      if (
        !inputType ||
        TRIGGER_INPUT_TYPES.indexOf(inputType.toLowerCase()) >= 0
      ) {
        chrome.runtime.sendMessage({ type: "START_TEXT_INPUT" });
      }
    } else if (tagName == "textarea" || contenteditable) {
      chrome.runtime.sendMessage({ type: "START_TEXT_INPUT" });
    }
  };

  const onFocusOut = () => {
    if (disableVoiceDictation) {
      return;
    }
    chrome.runtime.sendMessage({ type: "STOP_TEXT_INPUT" });
  };

  document.addEventListener("focusin", onFocus);
  document.addEventListener("focusout", onFocusOut);

  chrome.storage.local.get(["disableVoiceDictation"], result => {
    disableVoiceDictation = result.disableVoiceDictation;
    if (!disableVoiceDictation) {
      document.body.classList.add("chrome-voice-assistant-icon");
    }
  });

  chrome.storage.onChanged.addListener(changes => {
    disableVoiceDictation =
      changes.disableVoiceDictation && changes.disableVoiceDictation.newValue;
    if (!disableVoiceDictation) {
      document.body.classList.add("chrome-voice-assistant-icon");
    } else {
      chrome.runtime.sendMessage({ type: "STOP_TEXT_INPUT" });
      document.body.classList.remove("chrome-voice-assistant-icon");
    }
  });
</script>

<style>
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000000;
  }
</style>

{#if lastRequest && lastRequest.title && lastRequest.content}
  <div class="notification">
    <Card>
      <Content>
        <h1>{lastRequest.title}</h1>
        <p>{lastRequest.content}</p>
      </Content>
    </Card>
  </div>
{/if}
