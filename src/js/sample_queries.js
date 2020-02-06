import {
  mdiBookmark,
  mdiMicrophone,
  mdiPencil,
  mdiFileFind,
  mdiArrowRight,
  mdiPlayCircleOutline,
  mdiTab,
  mdiCamera,
  mdiNewspaper,
  mdiMap,
  mdiWikipedia,
  mdiVideo,
  mdiMusic,
  mdiShopping,
  mdiStar,
  mdiMagnify
} from "@mdi/js";

const plugins = [
  {
    name: "Browser tab",
    icon: mdiTab,
    queries: [
      "close tab",
      "close other tabs | close all tabs",
      "pin tab | unpin tab",
      "mute | unmute",
      "maximize window | minimize window",
      "enter fullscreen | exit fullscreen"
    ],
  },
  {
    name: "Media player",
    icon: mdiPlayCircleOutline,
    queries: [
      "pause | stop | play | resume",
      "volume up | volume down",
      "skip 10 seconds | skip 1 minute",
      "back 10 seconds | back 1 minute",
      "go back to the beginning",
      "go to the end"
    ],
  },
  {
    name: "Bookmark",
    icon: mdiBookmark,
    queries: ["bookmark", "bookmark (this) page", "remove bookmark"],
  },
  {
    name: "Navigation",
    icon: mdiArrowRight,
    queries: ["go back", "go forward", "reload | refresh"],
  },
  {
    name: "Page control",
    icon: mdiFileFind,
    queries: [
      "zoom in | make it larger",
      "zoom out | make it smaller",
      "reset zoom | make it normal size",
      "find <text> | look for <text>",
      "scroll down | page down",
      "scroll up | page up",
      "go to top | go to bottom"
    ],
  },
  {
    name: "Voice assistant",
    icon: mdiMicrophone,
    queries: [
      "bye | good bye | close",
      "see supported commands",
      "what can you do"
    ],
  },
  {
    name: "Voice input",
    icon: mdiPencil,
    queries: ["write <something to write>", "submit | enter"],
  },
  {
    name: "Image",
    icon: mdiCamera,
    queries: [
      "images of kittens",
      "pictures of puppies",
      "photos of Tailor Swift"
    ],
  },
  {
    name: "News",
    icon: mdiNewspaper,
    queries: ["news of Google", "news about technology", "news | today's news"],
  },
  {
    name: "Maps & directions",
    icon: mdiMap,
    queries: [
      "map of United States",
      "direction to Las Vegas",
      "direction from home to work"
    ],
  },
  {
    name: "Wikipedia",
    icon: mdiWikipedia,
    queries: ["about California", "wiki about the Universe", "wikipedia"],
  },
  {
    name: "Video",
    icon: mdiVideo,
    queries: ["video", "video of cats", "watch baby shark"],
  },
  {
    name: "Music",
    icon: mdiMusic,
    queries: ["music", "play music"],
  },
  {
    name: "Shopping",
    icon: mdiShopping,
    queries: ["shopping | buy something", "shop for paper towel"],
  },
  {
    name: "Quick links",
    icon: mdiStar,
    queries: ["go to Facebook", "open downloads", "open bookmarks"],
  },
  {
    name: "Search",
    icon: mdiMagnify,
    queries: [
      "Search for <text> | Google <text>",
      "<query> on (Bing | Yahoo | Amazon | and others)",
      "<All other queries>"
    ],
  }
];

export { plugins };
