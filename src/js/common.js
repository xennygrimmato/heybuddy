const DEBUG = process.env.NODE_ENV === "development";
const MAX_QUERIES_IN_CLOUD = 50;
const storage = chrome.storage.local;

module.exports = {
  DEBUG,
  MAX_QUERIES_IN_CLOUD,
  storage
};
