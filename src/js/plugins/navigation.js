import { executeScripts } from '../core';

const selectResultScript = `
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function selectResult(index) {
  const anchor = getElementByXpath(
    '((//*[not(ancestor::*[contains(@class,"related-question-pair")])][@class="r"]/a)'
    + '|(//a[@id="thumbnail"][not(ancestor::*[@hidden])]))'
    + '[' + (index + 1) + ']');
  if (anchor && anchor.href) {
    if (anchor.href.startsWith('https://www.amazon.com/')) {
      const url = new URL(anchor.href);
      url.searchParams.set('tag', 'bewisse-20');
      window.location.href = url.href;
    } else {
      window.location.href = anchor.href;
    }
  }  
}
`;

const commands = [
  {
    commands: ["go back"],
    callback: () => {
      executeScripts("window.history.back();");
    }
  },

  {
    commands: ["go forward"],
    callback: () => {
      executeScripts("window.history.forward();");
    }
  },

  {
    commands: [
      "reload",
      "reload tab",
      "reload this tab",
      "reload the tab",
      "refresh",
      "refresh tab",
      "refresh this tab",
      "refresh the tab"
    ],
    callback: () => {
      chrome.tabs.reload({});
    }
  },
];

const wordToIndices = [
  { words: ['best', 'first', 'top', '1st'], index: 0 },
  { words: ['second', '2nd'], index: 1 },
  { words: ['third', '3rd'], index: 2 },
  { words: ['fourth', '4th'], index: 3 },
  { words: ['fifth', '5th'], index: 4 },
  { words: ['sixth', '6th'], index: 5 },
  { words: ['seventh', '7th'], index: 6 },
  { words: ['eighth', '8th'], index: 7 },
  { words: ['ninth', '9th'], index: 8 },
  { words: ['tenth', '10th'], index: 9 },
];

for (const wordToIndex of wordToIndices) {
  const words = [];
  for (const word of wordToIndex.words) {
    words.push(...[
      word,
      `${word} result`,
      `${word} results`,
      `${word} link`,
      `${word} answer`,
      `${word} response`
    ]);
  }
  commands.push({
      commands: words,
      callback: () => {
        executeScripts(selectResultScript + `selectResult(${wordToIndex.index});`)
      }
    });
}

export default commands;
