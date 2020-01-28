import { mdiMicrophone } from "@mdi/js";
import commander from "../commander";

const plugins = [
  {
    name: "Voice assistant",
    icon: mdiMicrophone,
    queries: [
      "bye",
      "good bye",
      "close",
      "see supported commands",
      "what can you do"
    ],
    commands: [
      {
        commands: ["see supported commands", "what can you do"],
        callback: () => {
          commander.openTabWithUrl(chrome.runtime.getURL("/options.html?tab=1"));
        }
      }
    ]
  }
];

export default plugins;
