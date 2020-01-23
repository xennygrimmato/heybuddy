{
  let disableVoiceDictation = true;
  const contentsPort = chrome
    .runtime
    .connect({ name: 'mic_detection_contents' });

  const TRIGGER_INPUT_TYPES = ['text', 'email', 'number', 'search', 'tel', 'url'];
  const onFocus = () => {
    if (disableVoiceDictation) {
      return;
    }
    const focusedElement = document.activeElement;
    const tagName = focusedElement.tagName.toLowerCase();
    const contenteditable = focusedElement.getAttribute('contenteditable');
    if (tagName == 'input') {
      const inputType = focusedElement.getAttribute('type');
      if (!inputType || TRIGGER_INPUT_TYPES.indexOf(inputType.toLowerCase()) >= 0) {
        contentsPort.postMessage({ type: 'START_TEXT_INPUT' });
      }
    } else if (tagName == 'textarea' || contenteditable) {
      contentsPort.postMessage({ type: 'START_TEXT_INPUT' });
    }
  };

  const onFocusOut = () => {
    if (disableVoiceDictation) {
      return;
    }
    contentsPort.postMessage({ type: 'STOP_TEXT_INPUT' });
  };

  document.addEventListener('focusin', onFocus);
  document.addEventListener('focusout', onFocusOut);

  chrome.storage.local.get(['disableVoiceDictation'], (result) => {
    disableVoiceDictation = result.disableVoiceDictation;
    if (!disableVoiceDictation) {
      document.body.classList.add('chrome-voice-assistant-icon');
    }
  });


  chrome
    .storage
    .onChanged
    .addListener((changes) => {
      disableVoiceDictation = changes.disableVoiceDictation &&
          changes.disableVoiceDictation.newValue;
      if (!disableVoiceDictation) {
        document.body.classList.add('chrome-voice-assistant-icon');
      } else {
        contentsPort.postMessage({ type: 'STOP_TEXT_INPUT' });
        document.body.classList.remove('chrome-voice-assistant-icon');
      }
    });
}
