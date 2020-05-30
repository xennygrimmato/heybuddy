import { activeListening } from './store';

activeListening.subscribe(enabled => {
  if (enabled) {
    chrome.browserAction.setIcon({
      path: "/img/icon_128.png"
    });
  } else {
    chrome.browserAction.setIcon({
      path: "/img/icon_128_bw.png"
    });
  }
});
