import commander from "../commander";

const commands = [
  {
    commands: ["go back"],
    callback: query => {
      commander.executeScripts("window.history.back();");
    }
  },

  {
    commands: ["go forward"],
    callback: query => {
      commander.executeScripts("window.history.forward();");
    }
  },

  {
    commands: [
      "reload",
      "reload tab",
      "reload this tab",
      "reload the tab",
      "refresh",
      "refresh tab",
      "refresh this tab",
      "refresh the tab"
    ],
    callback: () => {
      chrome.tabs.reload({});
    }
  }
];

export default commands;
