import { mdiBookmark } from "@mdi/js";
import commander from "../commander";

const plugins = [
  {
    name: "Bookmark",
    icon: mdiBookmark,
    queries: ["bookmark", "bookmark (this) page", "remove bookmark"],
    commands: [
      {
        commands: [
          "bookmark",
          "bookmark (this) page",
          "add (this) (page) (to) bookmark"
        ],
        callback: query => {
          const bookmarkHandler = () => {
            commander.getActiveTab(activeTab => {
              chrome.bookmarks.create({
                title: activeTab.title,
                url: activeTab.url
              });
            });
          };
          if (!chrome.bookmarks) {
            commander.requestPermissions(["bookmarks"], bookmarkHandler);
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
        callback: query => {
          const unbookmarkHandler = () => {
            commander.getActiveTab(activeTab => {
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
            });
          };
          if (!chrome.bookmarks) {
            commander.requestPermissions(["bookmarks"], unbookmarkHandler);
          } else {
            unbookmarkHandler();
          }
        }
      }
    ]
  }
];

export default plugins;
