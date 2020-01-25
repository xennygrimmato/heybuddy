import { mdiArrowRight } from "@mdi/js";

const plugins = [
  {
    name: "Navigation",
    icon: mdiArrowRight,
    queries: ["go back", "go forward", "reload | refresh"],
    addCommandHandler: commander => {
      commander.addCommands(["go back"], query => {
        commander.executeScripts("window.history.back();");
      });

      commander.addCommands(["go forward"], query => {
        commander.executeScripts("window.history.forward();");
      });

      commander.addCommands(
        [
          "reload",
          "reload tab",
          "reload this tab",
          "reload the tab",
          "refresh",
          "refresh tab",
          "refresh this tab",
          "refresh the tab"
        ],
        () => {
          chrome.tabs.reload({});
        }
      );
    }
  }
];

export default plugins;
