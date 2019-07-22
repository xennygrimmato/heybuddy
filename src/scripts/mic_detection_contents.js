navigator
  .mediaDevices
  .enumerateDevices()
  .then((devices) => {
    let isMicEnabled = false;
    for (let device of devices) {
      if (device.kind == 'audioinput') {
        if (device.label) {
          isMicEnabled = true;
          break;
        }
      }
    }
    const contentsPort = chrome
      .runtime
      .connect({ name: 'contents' });
    contentsPort.postMessage({ type: 'TAB_LOADED', isMicEnabled: isMicEnabled });
  });
