import {
  mdiCamera,
  mdiNewspaper,
  mdiMap,
  mdiWikipedia,
  mdiVideo,
  mdiMusic,
  mdiShopping,
  mdiStar,
  mdiPencil,
  mdiMagnify
} from "@mdi/js";

/** ------- Search query ------- */
const prependQueryPhrase = queries => {
  let updatedQueries = Array.from(queries);
  for (let query of queries) {
    updatedQueries.push("show me " + query);
    updatedQueries.push("show me a " + query);
    updatedQueries.push("show me the " + query);
  }
  return updatedQueries;
};

const plugins = [];

plugins.push({
  name: "Image",
  icon: mdiCamera,
  queries: [
    "images of kittens",
    "pictures of puppies",
    "photos of Tailor Swift"
  ],
  addCommandHandler: commander => {
    commander.addCommands(
      prependQueryPhrase([
        "image of *query",
        "photo of *query",
        "picture of *query",
        "images of *query",
        "photos of *query",
        "pictures of *query"
      ]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.google.com/search?tbm=isch&q=" + query
          );
        });
      }
    );
  }
});

plugins.push({
  name: "News",
  icon: mdiNewspaper,
  queries: ["news of Google", "news about technology", "news | today's news"],
  addCommandHandler: commander => {
    commander.addCommands(
      prependQueryPhrase(["news of *query", "news about *query"]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.google.com/search?tbm=nws&q=" + query
          );
        });
      }
    );

    commander.addCommands(
      prependQueryPhrase(["news", "news today", "today news", "today's news"]),
      () => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://news.google.com/");
        });
      }
    );
  }
});

plugins.push({
  name: "Maps & directions",
  icon: mdiMap,
  queries: [
    "map of United States",
    "direction to Las Vegas",
    "direction from home to work"
  ],
  addCommandHandler: commander => {
    commander.addCommands(
      prependQueryPhrase([
        "map of *query",
        "map to *query",
        "how to get to *query",
        "how do I get to *query"
      ]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://www.google.com/maps?q=" + query);
        });
      }
    );

    commander.addCommands(
      prependQueryPhrase([
        "direction from *from to *to",
        "directions from *from to *to"
      ]),
      (from, to) => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.google.com/maps/dir/" + from + "/" + to
          );
        });
      }
    );

    commander.addCommands(
      prependQueryPhrase(["direction from *query", "directions from *query"]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://www.google.com/maps/dir/" + query);
        });
      }
    );

    commander.addCommands(
      prependQueryPhrase(["direction to *query", "directions to *query"]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://www.google.com/maps/dir//" + query);
        });
      }
    );
  }
});

plugins.push({
  name: "Wikipedia",
  icon: mdiWikipedia,
  queries: ["about California", "wiki about the Universe", "wikipedia"],
  addCommandHandler: commander => {
    commander.addCommands(["wikipedia"], () => {
      commander.performActionWithDelay(() => {
        commander.openTabWithUrl("https://wikipedia.org/");
      });
    });

    commander.addCommands(
      [
        "about *query",
        "wiki about *query",
        "wiki *query",
        "wikipedia about *query",
        "wikipedia *query"
      ],
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://en.wikipedia.org/wiki/Special:Search/" + query
          );
        });
      }
    );
  }
});

plugins.push({
  name: "Video",
  icon: mdiVideo,
  queries: ["video", "video of cats"],
  addCommandHandler: commander => {
    commander.addCommands(
      ["play video", "video", "play videos", "videos"],
      () => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://www.youtube.com/");
        });
      }
    );

    commander.addCommands(
      prependQueryPhrase([
        "video of *query",
        "video about *query",
        "video *query",
        "videos of *query",
        "videos about *query",
        "videos *query"
      ]),
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.youtube.com/results?search_query=" + query
          );
        });
      }
    );
  }
});

plugins.push({
  name: "Music",
  icon: mdiMusic,
  queries: ["music", "play music"],
  addCommandHandler: commander => {
    commander.addCommands(["play music", "music"], () => {
      commander.performActionWithDelay(() => {
        commander.openTabWithUrl("https://play.google.com/music/listen");
      });
    });
  }
});

plugins.push({
  name: "Shopping",
  icon: mdiShopping,
  queries: ["shopping | buy something", "shop for paper towel"],
  addCommandHandler: commander => {
    commander.addCommands(["shopping", "buy something"], () => {
      commander.performActionWithDelay(() => {
        commander.openTabWithUrl("https://www.amazon.com/");
      });
    });

    commander.addCommands(
      ["shop for a *query", "shop for *query", "buy a *query", "buy *query"],
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.amazon.com/s/field-keywords=" + query
          );
        });
      }
    );
  }
});

plugins.push({
  name: "Quick links",
  icon: mdiStar,
  queries: ["go to Facebook", "open downloads", "open bookmarks"],
  addCommandHandler: commander => {
    commander.addCommands(
      ["go to download", "open download", "go to downloads", "open downloads"],
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("chrome://downloads");
        });
      }
    );

    commander.addCommands(
      ["go to bookmark", "open bookmark", "go to bookmarks", "open bookmarks"],
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("chrome://bookmarks");
        });
      }
    );

    commander.addCommands(["go to history", "open history"], query => {
      commander.performActionWithDelay(() => {
        commander.openTabWithUrl("chrome://history");
      });
    });

    commander.addCommands(["go to *query", "open *query"], query => {
      commander.performActionWithDelay(() => {
        commander.openTabWithUrl("https://duckduckgo.com/?q=!" + query);
      });
    });
  }
});

plugins.push({
  name: "Voice input",
  icon: mdiPencil,
  queries: ["Submit", "<Anything to write>"],
  addCommandHandler: commander => {}
});

plugins.push({
  name: "Search",
  icon: mdiMagnify,
  queries: [
    "Search for <text> | Google <text>",
    "<query> on (Bing | Yahoo | Amazon | and others)",
    "<All other queries>"
  ],
  addCommandHandler: commander => {
    const siteToUrl = {
      Bing: "https://www.bing.com/search?q=",
      AOL: "https://search.aol.com/aol/search?q=",
      Yahoo: "https://search.yahoo.com/search?p=",
      Amazon: "https://www.amazon.com/s/?field-keywords=",
      Walmart: "https://www.walmart.com/search/?query=",
      Target: "https://www.target.com/s?searchTerm=",
      YouTube: "https://www.youtube.com/results?search_query=",
      Baidu: "http://www.baidu.com/s?wd=",
      Wikipedia: "https://www.wikipedia.org/wiki/"
    };
    for (const key in siteToUrl) {
      commander.addCommands(
        [
          "search for *query on " + key,
          "search for *query at " + key,
          "*query on " + key,
          "*query at " + key
        ],
        query => {
          commander.performActionWithDelay(() => {
            commander.openTabWithUrl(siteToUrl[key] + query);
          });
        }
      );
    }
    commander.addCommands(
      [
        "search for *query on *site",
        "search for *query at *site",
        "*query on *site",
        "*query at *site"
      ],
      (query, site) => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.google.com/search?btnI=1&q=" +
              encodeURIComponent(query + " on " + site)
          );
        });
      }
    );
    commander.addCommands(
      ["search for *query", "google *query", "*query"],
      query => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl("https://www.google.com/search?q=" + query);
        });
      }
    );
  }
});

export default plugins;
