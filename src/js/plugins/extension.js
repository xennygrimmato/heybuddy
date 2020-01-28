import { mdiMicrophone } from "@mdi/js";
import commander from "../commander";

const plugins = [
  {
    name: "Voice assistant",
    icon: mdiMicrophone,
    queries: [
      "bye | good bye | close",
      "start writing | start dictating",
      "stop writing | stop dictating",
      "see supported commands",
      "what can you do"
    ],
    commands: [
      {
        commands: ["see supported commands", "what can you do"],
        callback: () => {
          commander.openTabWithUrl(
            chrome.runtime.getURL("/options.html?tab=1")
          );
        }
      },
      {
        commands: ["start writing", "start dictating", "start dictation"],
        callback: () => {
          commander.startListeningToTextInput();
        },
        priority: 1
      },
      {
        commands: ["stop writing", "stop dictating", "stop dictation"],
        callback: () => {
          commander.stopListeningToTextInput();
        },
        priority: 1
      }
    ]
  }
];

export default plugins;
