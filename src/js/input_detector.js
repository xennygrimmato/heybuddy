const TRIGGER_INPUT_TYPES = ["text", "email", "number", "search", "tel", "url"];
function onFocus() {
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
}

function onFocusOut() {
  if (disableVoiceDictation) {
    return;
  }
  chrome.runtime.sendMessage({ type: "STOP_TEXT_INPUT" });
}

document.addEventListener("focusin", onFocus);
document.addEventListener("focusout", onFocusOut);

chrome.storage.local.get(["disableVoiceDictation"], result => {
  disableVoiceDictation = result.disableVoiceDictation;
});

chrome.storage.onChanged.addListener(changes => {
  disableVoiceDictation =
    changes.disableVoiceDictation && changes.disableVoiceDictation.newValue;
  if (disableVoiceDictation) {
    chrome.runtime.sendMessage({ type: "STOP_TEXT_INPUT" });
  }
});
