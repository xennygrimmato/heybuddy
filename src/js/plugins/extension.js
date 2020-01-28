import { mdiMicrophone } from "@mdi/js";

const plugins = [
  {
    name: "Voice assistant",
    icon: mdiMicrophone,
    queries: ["bye", "good bye", "close"],
    commands: [],
  }
];

export default plugins;
