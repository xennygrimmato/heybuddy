navigator.webkitGetUserMedia({
  audio: true
}, (stream) => {}, () => {
  chrome.runtime.openOptionsPage();
});
const popupPort = chrome
  .runtime
  .connect(/* extensionId*/ undefined, {name: 'chrome-voice-assistant-popup'});
const input = document.getElementById('results');
let disableCache = false;

const suggestSearch = (val) => {
  const url = 'https://www.google.com/complete/search?xssi=t&client=psy-ab&psi=&q=' + encodeURIComponent(val);
  return new Promise((resolve, reject) => {
    const personalizedSearch = (localStorage.getItem('personalizedSearch') === 'true');
    return fetch(url, {
        mode: 'cors',
        cache: disableCache ? 'no-cache' : 'default',
        credentials: personalizedSearch ? 'include' : 'omit'
      })
      .then(result => {
        return result.text()
      })
      .then(result => {
        return JSON.parse(result.replace(')]}\'', ''))
      })
      .then(result => {
        const autocompletion = result[1];
        let outputList = []
        for (let token of autocompletion) {
          const term = token[0]
          let deletionToken = null
          if (token[3]) {
            deletionToken = `https://www.google.com${token[3].du}`
          }
          const simpleTerm = term.replace('<b>', '').replace('</b>', '')
          if (!outputList.find(item => item.query == simpleTerm)) {
            outputList.push({
              query: simpleTerm,
              deletionToken: deletionToken
            })
          }
        }
        resolve(outputList);
      });
    });
};

document
  .getElementById('query-form')
  .onsubmit = (event) => {
  if (input.value) {
    popupPort.postMessage({type: 'QUERY', query: input.value});
  }
  return false;
};

document
  .getElementById('personalized-search')
  .addEventListener('change', (event) => {
    localStorage.setItem('personalizedSearch', event.target.checked);
    // Disable caching because the results might have changed when sent
    // with / without cookies.
    disableCache = true;
    showAutocomplete();
  });

popupPort
  .onMessage
  .addListener((request) => {
    switch (request.type) {
      case 'RESULT':
        processQuery(request.userSaid);
        break;
      case 'PENDING_RESULT':
        input.value = '';
        input.placeholder = request.userSaid;
        break;
      case 'CLOSE':
        window.close();
        break;
    }
  });

const processQuery = (value) => {
  input.value = '';
  input.placeholder = value;
  showAutocomplete();
};

/*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
let currentFocus;
/*execute a function when someone writes in the text field:*/
const showAutocomplete = () => {
  let val = input.value;
  const showAutocompleteInternal = (autocompleteList) => {
    if (val != input.value) {
      return;
    }
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    currentFocus = -1;

    /*create a DIV element that will contain the items (values):*/
    let a = document.createElement("DIV");
    a.setAttribute("id", input.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    input
      .parentNode
      .appendChild(a);
    let numInserted = 0;
    /*for each item in the array...*/
    for (let item of autocompleteList) {
      /*check if the item starts with the same letters as the text field value:*/
      if (item.query.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        let b = document.createElement("div");
        if (item.type == 'history') {
          b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 2' +
              '4"><path d="M0 0h24v24H0z" fill="none"/><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89' +
              ' 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94' +
              '-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5' +
              'l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>'
        } else {
          b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 2' +
              '4"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9' +
              '.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.' +
              '49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9' +
              '.5 14z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
        }

        b.innerHTML += '&nbsp;&nbsp;';
        /*make the matching letters bold:*/
        b.innerHTML += "<strong>" + item
          .query
          .substr(0, val.length) + "</strong>";
        b.innerHTML += item
          .query
          .substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + item.query + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener('click', (e) => {
          /*insert the value for the autocomplete text field:*/
          const value = b.getElementsByTagName('input')[0].value;
          popupPort.postMessage({type: 'QUERY', query: value});
          processQuery(value);
        });
        if (item.deleteCallback) {
          let deleteButton = document.createElement('a');
          deleteButton.style.float = 'right';
          deleteButton.innerHTML = 'Remove';
          deleteButton.addEventListener('click', () => {
            item.deleteCallback();
            event.stopPropagation();
            return true;
          });
          b.appendChild(deleteButton);
        }
        a.appendChild(b);
        numInserted++;
        if (numInserted == 5) {
          break;
        }
      }
    };
  };
  suggestSearch(val).then(results => {
    let outputList = [];
    for (let item of results) {
      outputList.push({
        query: item.query,
        deleteCallback: item.deletionToken ? () => {
          fetch(item.deletionToken).then(() => {
            showAutocomplete();
          });
        } : undefined,
        type: item.deletionToken ? 'history' : 'search'
      });
    }
    showAutocompleteInternal(outputList);
  });
};
input.addEventListener("input", showAutocomplete);
/*execute a function presses a key on the keyboard:*/
input.addEventListener("keydown", function (e) {
  var x = document.getElementById(this.id + "autocomplete-list");
  if (x) 
    x = x.getElementsByTagName("div");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) { //up
    /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    //e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) 
        x[currentFocus].click();
      }
    }
});
const addActive = (x) => {
  /*a function to classify an item as "active":*/
  if (!x) 
    return false;
  
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) 
    currentFocus = 0;
  if (currentFocus < 0) 
    currentFocus = (x.length - 1);
  
  /*add class "autocomplete-active":*/
  x[currentFocus]
    .classList
    .add("autocomplete-active");
};
const removeActive = (x) => {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i]
      .classList
      .remove("autocomplete-active");
  }
};
const closeAllLists = (elmnt) => {
  /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    if (elmnt != x[i] && elmnt != input) {
      x[i]
        .parentNode
        .removeChild(x[i]);
    }
  }
};

document.getElementById('personalized-search').checked = (localStorage.getItem('personalizedSearch') === 'true');
showAutocomplete();  
