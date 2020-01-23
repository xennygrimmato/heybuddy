<script>
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon/index";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";
  import List, { Graphic, Item, Text } from "@smui/list";
  import { mdiMagnify, mdiHistory } from "@mdi/js";

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

  let disableCache = false;
  let personalizedSearch;
  let query = "";
  let suggestionsPromise;

  popupPort.onMessage.addListener(request => {
    switch (request.type) {
      case "RESULT":
        processQuery(request.userSaid);
        break;
      case "PENDING_RESULT":
        // input.value = "";
        // input.placeholder = request.userSaid;
        break;
      case "CLOSE":
        window.close();
        break;
    }
  });

  const processQuery = value => {
    // input.value = '';
    // input.placeholder = value;
    // showAutocomplete();
    console.log(value);
  };

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
      if (token[3]) {
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
              fetch(item.deletionToken).then(() => {
                showAutocomplete();
              });
            }
          : undefined,
        type: item.deletionToken ? "history" : "search"
      });
    }
    return outputList.slice(0, 5);
  }

  function selectSuggestion(suggestion) {
    popupPort.postMessage({ type: "QUERY", query: suggestion.query });
    // processQuery(suggestion.query);
  }

  $: suggestionsPromise = suggestSearch(query);
</script>

<style>
  :global(html) {
    width: 520px;
    height: 400px;
    overflow: hidden;
  }

  :global(a) {
    color: #2196f3;
  }

  .main {
    text-align: center;
  }

  :global(.query-form .results) {
    width: 100%;
  }

  .hint {
    bottom: 5px;
    color: #aaa;
    position: absolute;
    left: 0;
    right: 0;
  }

  :global(.autocomplete-graphic) {
    width: 32px;
    margin: 0 5px 0 0;
  }

  .autocomplete-items {
    position: absolute;
    border: 1px solid #ddd;
    border-bottom: none;
    border-top: none;
    color: #888;
    margin: auto;
    top: 111px;
    left: 0;
    right: 0;
    text-align: left;
    width: 452px;
  }

  .autocomplete-items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }

  .autocomplete-items div:hover {
    /*when hovering an item:*/
    background-color: #eee;
  }

  .autocomplete-active {
    /*when navigating through the items using the arrow keys:*/
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
    <Textfield
      variant="outlined"
      withLeadingIcon
      class="results"
      label="Hi, how can I help you?"
      autocomplete="off"
      input$autofocus
      bind:value={query}>
      <Icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24">
          <path d={mdiMagnify} />
        </svg>
      </Icon>
    </Textfield>

    {#if suggestionsPromise}
      {#await suggestionsPromise then suggestions}
        <List>
          {#each suggestions as suggestion}
            <Item
              class="autocomplete-items"
              on:SMUI:action={() => selectSuggestion(suggestion)}>
              <Graphic class="autocomplete-graphic">
                {#if suggestion.type === 'history'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24">
                    <path d={mdiHistory} />
                  </svg>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24">
                    <path d={mdiMagnify} />
                  </svg>
                {/if}
              </Graphic>
              <Text>
                {@html suggestion.query}
              </Text>
            </Item>
          {/each}
        </List>
      {/await}
    {/if}

    <div class="hint">
      <FormField>
        <Checkbox bind:checked={personalizedSearch} />
        <span slot="label">Show personalized search suggestions</span>
      </FormField>
      &middot;
      <a href="/options.html" target="_blank">See all supported commands</a>
      .
    </div>
  </form>
</div>
