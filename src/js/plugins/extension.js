import { mdiMicrophone } from "@mdi/js";

const plugins = [
  {
    name: "Voice assistant",
    icon: mdiMicrophone,
    queries: ["bye | good bye", "close", "stay open"],
    addCommandHandler: commander => {}
  }
];

export default plugins;
