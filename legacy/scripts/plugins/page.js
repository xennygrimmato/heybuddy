registerPlugin({
  name: 'Page control',
  icon: 'pageview',
  queries: [
    'zoom in | make it larger',
    'zoom out | make it smaller',
    'reset zoom | make it normal size',
    'find <text> | look for <text>',
    'scroll down | page down',
    'scroll up | page up',
    'go to top | go to bottom'
  ],
  addCommandHandler: (commander) => {
    const ZOOM_LEVEL = [
      .25,
      .33,
      .5,
      .67,
      .75,
      .8,
      .9,
      1,
      1.1,
      1.25,
      1.5,
      1.75,
      2,
      2.5,
      3,
      4,
      5
    ];

    commander.addCommands([
      'zoom in', 'zoom', 'enlarge', 'make (it) larger', 'make (it) bigger'
    ], (query) => {
      commander.getActiveTab(activeTab => {
        chrome
          .tabs
          .getZoom(activeTab.id, zoomFactor => {
            for (let zoomLevel of ZOOM_LEVEL) {
              if (zoomFactor + .01 < zoomLevel) {
                chrome
                  .tabs
                  .setZoom(activeTab.id, zoomLevel);
                break;
              }
            }
          });
      });
    });

    commander.addCommands([
      'zoom out', 'make (it) smaller'
    ], (query) => {
      commander.getActiveTab(activeTab => {
        chrome
          .tabs
          .getZoom(activeTab.id, zoomFactor => {
            for (let i = ZOOM_LEVEL.length - 1; i >= 0; i--) {
              const zoomLevel = ZOOM_LEVEL[i];
              if (zoomFactor - .01 > zoomLevel) {
                chrome
                  .tabs
                  .setZoom(activeTab.id, zoomLevel);
                break;
              }
            }
          });
      });
    });

    commander.addCommands([
      'reset zoom', 'make (it) normal size'
    ], (query) => {
      commander.getActiveTab(activeTab => {
        chrome
          .tabs
          .setZoom(activeTab.id, 1);
      });
    });

    commander.addCommands([
      'find *query', 'look for *query'
    ], (query) => {
      commander.executeScripts(`window.find('${query}');`);
    });

    commander.addCommands([
      'scroll down', '(go) down'
    ], (query) => {
      commander.executeScripts('window.scrollBy(0, 250);');
    });

    commander.addCommands(['page down'], (query) => {
      commander.executeScripts('window.scrollBy(0, 1000);');
    });

    commander.addCommands([
      'scroll up', '(go) up'
    ], (query) => {
      commander.executeScripts('window.scrollBy(0, -250);');
    });

    commander.addCommands(['page up'], (query) => {
      commander.executeScripts('window.scrollBy(0, -1000);');
    });

    commander.addCommands([
      'go to (the) top', 'scroll to (the) top'
    ], (query) => {
      commander.executeScripts('window.scrollTo(0, 0);');
    });

    commander.addCommands([
      'go to (the) bottom', 'scroll to (the) bottom'
    ], (query) => {
      commander.executeScripts('window.scrollTo(0, document.body.scrollHeight);');
    });
  }
});
