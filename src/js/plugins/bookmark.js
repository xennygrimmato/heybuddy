import commander from "../commander";
import { getActiveTab } from '../core';

const commands = [
  {
    commands: [
      "bookmark",
      "bookmark (this) page",
      "add (this) (page) (to) bookmark"
    ],
    callback: () => {
      const bookmarkHandler = async () => {
        const activeTab = await getActiveTab();
        chrome.bookmarks.create({
          title: activeTab.title,
          url: activeTab.url
        });
      };
      if (!chrome.bookmarks) {
        commander.requestPermissions(
          ["bookmarks"],
          "bookmark",
          "Hey Buddy needs permission to manage your bookmarks.",
          bookmarkHandler
        );
      } else {
        bookmarkHandler();
      }
    }
  },
  {
    commands: [
      "remove (from) bookmark",
      "remove this bookmark",
      "remove the bookmark"
    ],
    callback: () => {
      const unbookmarkHandler = async () => {
        const activeTab = await getActiveTab();
        chrome.bookmarks.search(
          {
            url: activeTab.url
          },
          results => {
            if (results.length > 0) {
              chrome.bookmarks.remove(results[0].id);
            }
          }
        );
      };
      if (!chrome.bookmarks) {
        commander.requestPermissions(
          ["bookmarks"],
          "remove bookmark",
          "Hey Buddy needs permission to manage your bookmarks.",
          unbookmarkHandler
        );
      } else {
        unbookmarkHandler();
      }
    }
  }
];

export default commands;
