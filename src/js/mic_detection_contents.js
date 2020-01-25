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
