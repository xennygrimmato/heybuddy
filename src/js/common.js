const DEBUG = (process.env.NODE_ENV === 'development');
const MAX_QUERIES_IN_CLOUD = 50;
const storage = chrome.storage.local;

const ICON_COLOR = '#2196f3';

module.exports = {
  DEBUG,
  ICON_COLOR,
  MAX_QUERIES_IN_CLOUD,
  storage
};
