import { performActionWithDelay } from '../core';


/** ------- Docs management commands ------- */
const commands = [
  {
    action: 'CREATE_DOCS',
    callback: query => {
      performActionWithDelay(() => {
        let url = "https://";
        if (query === "doc" || query === "document") {
            url += "docs.new"
        } else if (query === "sheet" || query === "spreadsheet" || query === "excel sheet") {
            url += "sheets.new"
        } else if (query === "presentation" || query === "ppt" || query === "slides" || query === "slide deck") {
            url += "slides.new"
        }
        chrome.tabs.create({ url: url });
      });
    }
  }
];

export default commands;
