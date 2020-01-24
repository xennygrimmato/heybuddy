<script>
  import List, { Graphic, Item, Text } from "@smui/list";
  import { mdiMagnify, mdiHistory } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";

  navigator.webkitGetUserMedia(
    {
      audio: true
    },
    stream => {},
    () => {
      // chrome.runtime.openOptionsPage();
    }
  );
  const popupPort = chrome.runtime.connect(/* extensionId*/ undefined, {
    name: "chrome-voice-assistant-popup"
  });

  const MAX_SUGGESTIONS = 6;
  let disableCache = false;
  let personalizedSearch = true;
  let activeIndex = -1;
  let query = "";
  let placeholder = "Hi, how can I help you?";
  let suggestionsPromise;

  popupPort.onMessage.addListener(request => {
    switch (request.type) {
      case "RESULT":
        processUserSaid(request.userSaid);
        break;
      case "PENDING_RESULT":
        query = "";
        placeholder = request.userSaid;
        break;
      case "CLOSE":
        window.close();
        break;
    }
  });

  async function suggestSearch(val) {
    if (!val) {
      return [];
    }
    const url =
      "https://www.google.com/complete/search?xssi=t&client=psy-ab&psi=&q=" +
      encodeURIComponent(val);
    const result = await fetch(url, {
      mode: "cors",
      cache: disableCache ? "no-cache" : "default",
      credentials: personalizedSearch ? "include" : "omit"
    });
    const responseText = await result.text();
    const jsonResult = JSON.parse(responseText.replace(")]}'", ""));

    const autocompletion = jsonResult[1];
    let results = [];
    for (let token of autocompletion) {
      const term = token[0];
      let deletionToken = null;
      console.log(token);
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
      outputList.push({
        query: item.query,
        deleteCallback: item.deletionToken
          ? () => {
              console.log(`Deleting ${item.deletionToken}`);
              return fetch(item.deletionToken, {
                mode: "cors",
                cache: "no-cache",
                credentials: "include"
              });
            }
          : undefined,
        type: item.deletionToken ? "history" : "search"
      });
    }
    return outputList.slice(0, MAX_SUGGESTIONS);
  }

  function processQuery(q) {
    popupPort.postMessage({ type: "QUERY", query: q });
    processUserSaid(q);
  }

  function processUserSaid(q) {
    input.value = '';
    input.placeholder = q;
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
      case 13:  // ENTER key
        if (activeIndex > -1 && suggestions[activeIndex]) {
          /* and simulate a click on the "active" item: */
          processQuery(suggestions[activeIndex].query);
        } else {
          processQuery(query);
        }
    }
  }

  $: suggestionsPromise = suggestSearch(query);
</script>

<style>
  :global(html) {
    width: 480px;
    height: 400px;
    overflow: hidden;
  }

  :global(a) {
    color: #2196f3;
  }

  .main {
    text-align: center;
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

  .autocomplete-active {
    /* when navigating through the items using the arrow keys: */
    background-color: DodgerBlue !important;
    color: #ffffff;
  }

  .reviews {
    right: 10px;
    position: absolute;
  }
</style>

<div class="main">
  <img src="img/baseline-mic-24px.svg" alt="Logo" />
  <a
    class="reviews"
    href="https://chrome.google.com/webstore/detail/chrome-voice-assistant/aollofiafbblhopkofbfmlmbhbdcblem"
    target="_blank">
    Review / Send feedbacks
  </a>
  <form class="query-form">
    <input
      class="results"
      autofocus
      autocomplete="off"
      placeholder={placeholder}
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
      <input
        type="checkbox"
        id="personalized-search"
        bind:checked={personalizedSearch} />
      <label for="personalized-search">
        Show personalized search suggestions
      </label>
      &middot;
      <a href="/options.html" target="_blank">See all supported commands</a>
      .
    </div>
  </form>
</div>
