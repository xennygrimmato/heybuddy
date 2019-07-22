registerPlugin({
  name: 'Bookmark',
  icon: 'bookmark',
  queries: [
    'bookmark', 'bookmark (this) page', 'remove bookmark'
  ],
  addCommandHandler: (commander) => {
    commander.addCommands([
      'bookmark', 'bookmark (this) page', 'add (this) (page) (to) bookmark'
    ], (query) => {
      const bookmarkHandler = () => {
        commander.getActiveTab(activeTab => {
          chrome
            .bookmarks
            .create({title: activeTab.title, url: activeTab.url});
        });
      };
      if (!chrome.bookmarks) {
        commander.requestPermissions(['bookmarks'], bookmarkHandler);
      } else {
        bookmarkHandler();
      }
    });

    commander.addCommands([
      'remove (from) bookmark', 'remove this bookmark', 'remove the bookmark'
    ], (query) => {
      const unbookmarkHandler = () => {
        commander.getActiveTab(activeTab => {
          chrome
            .bookmarks
            .search({
              url: activeTab.url
            }, (results) => {
              if (results.length > 0) {
                chrome
                  .bookmarks
                  .remove(results[0].id);
              }
            });
        });
      };
      if (!chrome.bookmarks) {
        commander.requestPermissions(['bookmarks'], unbookmarkHandler);
      } else {
        unbookmarkHandler();
      }
    });
  }
});
