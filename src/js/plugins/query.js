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
import commander from "../commander";
import cheerio from "cheerio";
import axios from "axios";

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

async function loadAndParsePage(url) {
  const response = await axios.get(url);
  const parsedResponse = cheerio.load(response.data);
  return parsedResponse;
}

async function generateGoogleLuckyUrl(query) {
  const parsedResponse = await loadAndParsePage(
    "https://www.google.com/"
  );
  const sxsrf = parsedResponse("input[name='sxsrf']").attr("value");
  const ei = parsedResponse("input[name='ei']").attr("value");
  const iflsig = parsedResponse("input[name='iflsig']").attr("value");
  const source = parsedResponse("input[name='source']").attr("value");
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("sxsrf", sxsrf);
  url.searchParams.set("ei", ei);
  url.searchParams.set("iflsig", iflsig);
  url.searchParams.set("source", source);
  url.searchParams.set("btnI", "I'm Feeling Lucky");
  url.searchParams.set("q", query);
  return url.href;
}

const plugins = [];

plugins.push({
  name: "Image",
  icon: mdiCamera,
  queries: [
    "images of kittens",
    "pictures of puppies",
    "photos of Tailor Swift"
  ],
  commands: [
    {
      commands: prependQueryPhrase([
        "image of *query",
        "photo of *query",
        "picture of *query",
        "images of *query",
        "photos of *query",
        "pictures of *query"
      ]),
      callback: query => {
        commander.openTabWithUrl(
          "https://www.google.com/search?tbm=isch&q=" + query
        );
      }
    }
  ]
});

plugins.push({
  name: "News",
  icon: mdiNewspaper,
  queries: ["news of Google", "news about technology", "news | today's news"],
  commands: [
    {
      commands: prependQueryPhrase(["news of *query", "news about *query"]),
      callback: query => {
        commander.openTabWithUrl(
          "https://www.google.com/search?tbm=nws&q=" + query
        );
      }
    },
    {
      commands: prependQueryPhrase([
        "news",
        "news today",
        "today news",
        "today's news"
      ]),
      callback: () => {
        commander.openTabWithUrl("https://news.google.com/");
      }
    }
  ]
});

plugins.push({
  name: "Maps & directions",
  icon: mdiMap,
  queries: [
    "map of United States",
    "direction to Las Vegas",
    "direction from home to work"
  ],
  commands: [
    {
      commands: prependQueryPhrase([
        "map of *query",
        "map to *query",
        "how to get to *query",
        "how do I get to *query"
      ]),
      callback: query => {
        commander.openTabWithUrl("https://www.google.com/maps?q=" + query);
      }
    },

    {
      commands: prependQueryPhrase([
        "direction from *from to *to",
        "directions from *from to *to"
      ]),
      callback: (from, to) => {
        commander.performActionWithDelay(() => {
          commander.openTabWithUrl(
            "https://www.google.com/maps/dir/" + from + "/" + to
          );
        });
      }
    },

    {
      commands: prependQueryPhrase([
        "direction from *query",
        "directions from *query"
      ]),
      callback: query => {
        commander.openTabWithUrl("https://www.google.com/maps/dir/" + query);
      }
    },

    {
      commands: prependQueryPhrase([
        "direction to *query",
        "directions to *query"
      ]),
      callback: query => {
        commander.openTabWithUrl("https://www.google.com/maps/dir//" + query);
      }
    }
  ]
});

plugins.push({
  name: "Wikipedia",
  icon: mdiWikipedia,
  queries: ["about California", "wiki about the Universe", "wikipedia"],
  commands: [
    {
      commands: ["wikipedia"],
      callback: () => {
        commander.openTabWithUrl("https://wikipedia.org/");
      }
    },
    {
      commands: [
        "about *query",
        "wiki about *query",
        "wiki *query",
        "wikipedia about *query",
        "wikipedia *query"
      ],
      callback: query => {
        commander.openTabWithUrl(
          "https://en.wikipedia.org/wiki/Special:Search/" + query
        );
      }
    }
  ]
});

plugins.push({
  name: "Video",
  icon: mdiVideo,
  queries: ["video", "video of cats", "watch baby shark"],
  commands: [
    {
      commands: ["play video", "video", "play videos", "videos"],
      callback: () => {
        commander.openTabWithUrl("https://www.youtube.com/");
      }
    },
    {
      commands: prependQueryPhrase([
        "video of *query",
        "video about *query",
        "video *query",
        "videos of *query",
        "videos about *query",
        "videos *query",
        "watch *query"
      ]),
      callback: query => {
        commander.openTabWithUrl(
          "https://www.youtube.com/results?search_query=" + query
        );
      }
    }
  ]
});

plugins.push({
  name: "Music",
  icon: mdiMusic,
  queries: ["music", "play music"],
  commands: [
    {
      commands: ["play music", "music"],
      callback: () => {
        commander.openTabWithUrl("https://play.google.com/music/listen");
      }
    }
  ]
});

plugins.push({
  name: "Shopping",
  icon: mdiShopping,
  queries: ["shopping | buy something", "shop for paper towel"],
  commands: [
    {
      commands: ["shopping", "buy something"],
      callback: () => {
        commander.openTabWithUrl("https://www.amazon.com/");
      }
    },
    {
      commands: [
        "shop for a *query",
        "shop for *query",
        "buy a *query",
        "buy *query"
      ],
      callback: query => {
        commander.openTabWithUrl(
          "https://www.amazon.com/s/field-keywords=" + query
        );
      }
    }
  ]
});

plugins.push({
  name: "Quick links",
  icon: mdiStar,
  queries: ["go to Facebook", "open downloads", "open bookmarks"],
  commands: [
    {
      commands: [
        "go to download",
        "open download",
        "go to downloads",
        "open downloads"
      ],
      callback: query => {
        commander.openTabWithUrl("chrome://downloads");
      }
    },

    {
      commands: [
        "go to bookmark",
        "open bookmark",
        "go to bookmarks",
        "open bookmarks"
      ],
      callback: query => {
        commander.openTabWithUrl("chrome://bookmarks");
      }
    },

    {
      commands: ["go to history", "open history"],
      callback: query => {
        commander.openTabWithUrl("chrome://history");
      }
    },

    {
      commands: ["go to *query", "open *query"],
      callback: async query => {
        commander.openTabWithUrl(await generateGoogleLuckyUrl(query));
      }
    }
  ]
});

plugins.push({
  name: "Voice input",
  icon: mdiPencil,
  queries: ["Submit", "<Anything to write>"],
  commands: []
});

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

const searchCommands = [];
for (const key in siteToUrl) {
  searchCommands.push({
    commands: [
      "search for *query on " + key,
      "search for *query at " + key,
      "*query on " + key,
      "*query at " + key
    ],
    callback: query => {
      commander.openTabWithUrl(siteToUrl[key] + query);
    },
    priority: 0.3
  });
}

plugins.push({
  name: "Search",
  icon: mdiMagnify,
  queries: [
    "Search for <text> | Google <text>",
    "<query> on (Bing | Yahoo | Amazon | and others)",
    "<All other queries>"
  ],
  commands: [
    ...searchCommands,
    {
      commands: [
        "search for *query on *site",
        "search for *query at *site",
        "*query on *site",
        "*query at *site"
      ],
      callback: async (query, site) => {
        commander.openTabWithUrl(await generateGoogleLuckyUrl(query + " on " + site));
      },
      priority: 0.3
    },
    {
      commands: ["search for *query", "google *query", "*query"],
      callback: query => {
        commander.openTabWithUrl(
          "https://www.google.com/search?gs_ivs=1&q=" +
            encodeURIComponent(query)
        );
        commander.clearNotifications();
      },
      priority: 0.2
    }
  ]
});

export default plugins;
