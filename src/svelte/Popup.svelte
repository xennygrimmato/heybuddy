<script>
  import { mdiMagnify, mdiHistory } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";

  navigator.webkitGetUserMedia(
    {
      audio: true
    },
    stream => {},
    () => {
      chrome.runtime.openOptionsPage();
    }
  );
  const popupPort = chrome.runtime.connect({
    name: "chrome-voice-assistant-popup"
  });

  const MAX_SUGGESTIONS = 6;
  let disableCache = false;
  let activeIndex = -1;
  let query = "";
  let placeholder = "Hi, how can I help you?";
  let suggestionsPromise = suggestSearch(query);

  chrome.runtime.onMessage.addListener(request => {
    switch (request.type) {
      case "RESULT":
        processUserSaid(request.content);
        break;
      case "PENDING_RESULT":
        query = "";
        placeholder = request.content;
        break;
      case "CLEAR_NOTIFICATION":
        window.close();
        break;
    }
  });

  async function suggestSearch(val) {
    const url =
      "https://www.google.com/complete/search?xssi=t&client=psy-ab&psi=&q=" +
      encodeURIComponent(val);
    const result = await fetch(url, {
      mode: "cors",
      cache: disableCache ? "no-cache" : "default",
      credentials: "include"
    });
    const responseText = await result.text();
    const jsonResult = JSON.parse(responseText.replace(")]}'", ""));

    const autocompletion = jsonResult[1];
    let results = [];
    for (let token of autocompletion) {
      const term = token[0];
      let deletionToken = null;
      if (token[3] && token[3].du) {
        deletionToken = `https://www.google.com${token[3].du}`;
      }
      const simpleTerm = term.replace("<b>", "").replace("</b>", "");
      if (!results.find(item => item.query === simpleTerm)) {
        results.push({
          query: simpleTerm,
          deletionToken: deletionToken
        });
      }
    }
    let outputList = [];
    for (let item of results) {
      let deleteCallback;
      if (item.deletionToken) {
        deleteCallback = () =>
          fetch(item.deletionToken, {
            mode: "cors",
            cache: "no-cache",
            credentials: "include"
          });
      }
      outputList.push({
        query: item.query,
        deleteCallback,
        type: item.deletionToken ? "history" : "search"
      });
    }
    return outputList.slice(0, MAX_SUGGESTIONS);
  }

  function processQuery(q) {
    chrome.runtime.sendMessage({ type: "QUERY", query: q });
    processUserSaid(q);
  }

  function processUserSaid(q) {
    query = "";
    placeholder = q;
  }

  function removeSuggestion(suggestion) {
    suggestion.deleteCallback().then(() => {
      suggestionsPromise = suggestSearch(query);
    });
    event.stopPropagation();
    return true;
  }

  async function onKeyDown(event) {
    const suggestions = await suggestionsPromise;
    switch (event.keyCode) {
      case 40: // UP arrow
        activeIndex = activeIndex + 1;
        if (activeIndex >= suggestions.length) {
          activeIndex = -1;
        }
        break;
      case 38: // DOWN arrow
        if (activeIndex < 0) {
          activeIndex = suggestions.length;
        }
        activeIndex = activeIndex - 1;
        break;
      case 13: // ENTER key
        if (activeIndex > -1 && suggestions[activeIndex]) {
          /* and simulate a click on the "active" item: */
          processQuery(suggestions[activeIndex].query);
        } else {
          processQuery(query);
        }
        break;
    }
  }

  $: suggestionsPromise = suggestSearch(query);
</script>

<style>
  :global(html) {
    width: 480px;
    height: 390px;
    overflow: hidden;
    font-size: 16px;
  }

  :global(a) {
    color: #2196f3;
    text-decoration: none;
  }

  .main {
    text-align: center;
  }

  .logo {
    text-align: left;
  }

  .results {
    font-size: 2em;
    left: 0;
    margin: auto;
    padding: 10px;
    position: absolute;
    right: 0;
    width: 430px;
  }

  .remove-link {
    float: right;
    margin-top: 4px;
  }

  .hint {
    font-size: 16px;
    bottom: 5px;
    color: #aaa;
    position: absolute;
    left: 0;
    right: 0;
  }

  .autocomplete-items {
    position: absolute;
    border: 1px solid #ddd;
    border-bottom: none;
    border-top: none;
    color: #888;
    font-size: 1.2em;
    margin: auto;
    top: 111px;
    left: 0;
    right: 0;
    text-align: left;
    width: 452px;
  }

  .autocomplete-items div {
    padding: 8px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }

  .autocomplete-items div:hover {
    /* when hovering an item: */
    background-color: #eee;
  }

  .autocomplete-active,
  .autocomplete-active .remove-link {
    /* when navigating through the items using the arrow keys: */
    background-color: DodgerBlue !important;
    color: #ffffff;
  }

  .thumb-up-icon {
    vertical-align: middle;
    width: 18px;
    height: 18px;
  }

  .reviews {
    font-size: 16px;
    right: 10px;
    position: absolute;
  }
</style>

<div class="main">
  <img class="logo" src="img/icon_128.png" height="48" alt="Logo" />
  <a
    class="reviews"
    href="https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
    target="_blank">
    <svg class="thumb-up-icon" viewBox="0 0 24 24">
      <path
        fill="#2196f3"
        d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22
        15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95
        7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5
        19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
    </svg>
    Rate us!
  </a>
  <div class="query-form">
    <input
      class="results"
      autofocus
      autocomplete="off"
      {placeholder}
      on:keydown={onKeyDown}
      bind:value={query} />

    {#if suggestionsPromise}
      {#await suggestionsPromise then suggestions}
        <div class="autocomplete-items">
          {#each suggestions as suggestion, i}
            <div
              on:click={() => processQuery(suggestion.query)}
              class:autocomplete-active={i === activeIndex}>
              {#if suggestion.type === 'history'}
                <MdiIcon size="24" icon={mdiHistory} />
              {:else}
                <MdiIcon size="24" icon={mdiMagnify} />
              {/if}
              {@html suggestion.query}
              {#if suggestion.deleteCallback}
                <a
                  class="remove-link"
                  href={void 0}
                  on:click={() => removeSuggestion(suggestion)}>
                  Remove
                </a>
              {/if}
            </div>
          {/each}
        </div>
      {/await}
    {/if}

    <div class="hint">
      <a href="/options.html?tab=1" target="_blank">
        See all supported commands
      </a>
    </div>
  </div>
</div>
