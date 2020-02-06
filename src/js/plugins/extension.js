import commander from "../commander";

const commands = [
  {
    commands: ["bye", "bye bye", "goodbye", "good bye", "close"],
    callback: () => {
      commander.clearNotifications();
    }
  },
  {
    commands: ["see supported commands", "what can you do"],
    callback: () => {
      commander.openTabWithUrl(
        chrome.runtime.getURL("/options.html?tab=1")
      );
    }
  },
  {
    commands: ["submit", "enter"],
    callback: () => {
      commander.executeScripts(`
          const focusedElement = document.activeElement;
          if (focusedElement.form) {
            focusedElement.form.submit();
          } else {
            focusedElement.dispatchEvent(new KeyboardEvent("keydown", {
              view: window,
              keyCode: 13,
              bubbles: true,
              cancelable: true
            }));
          }
        `);
    }
  },
  {
    commands: ["write *query"],
    callback: query => {
      query = query.replace("'", "\\'");
      commander.executeScripts(`
          const focusedElement = document.activeElement;
          const tagName = focusedElement.tagName.toLowerCase();
          const contenteditable = focusedElement.getAttribute('contenteditable') != '';
          let value = '${query}';
          if (tagName == 'input') {
            if (document.activeElement.value) {
              value = ' ' + value;
            }
            document.activeElement.value += value;
          } else if (tagName == 'textarea') {
            value = value.charAt(0).toUpperCase() + value.substr(1);
            value += '. ';
            const startPos = focusedElement.selectionStart;
            const endPos = focusedElement.selectionEnd;
            focusedElement.value = focusedElement.value.substring(0, startPos)
                + value
                + focusedElement.value.substring(endPos, focusedElement.value.length);
            focusedElement.selectionEnd = startPos + value.length;
          } else if (contenteditable) {
            value = value.charAt(0).toUpperCase() + value.substr(1);
            value += '. ';
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
              const range = sel.getRangeAt(0);
              range.deleteContents();
              const newValueNode = document.createTextNode(value);
              range.insertNode(newValueNode);
              range.setStart(newValueNode, value.length);
              range.setEnd(newValueNode, value.length);
            }
          }
        `);
    }
  }
];

export default commands;
