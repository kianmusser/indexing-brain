import { signal } from "@preact/signals";

const apiServer = "https://api.ib.com";

const searchParametersSignal = signal({
  nameType: signal("N"),
  curLocation: signal("US"),
  query: signal(""),
});

const searchStatusSignal = signal("ok"); // ok, loading, error
const locationsSignal = signal([]);

const emptySearchResults = {
  specificResults: [],
  relatedResults: [],
  extendedResults: [],
};

const searchResultsSignal = signal(emptySearchResults);

const toastSignal = signal("Welcome to the Indexing-Brain!");

function toast(msg) {
  toastSignal.value = "";
  toastSignal.value = msg;
}

const doGetLocations = async () => {
  const resp = await fetch(`${apiServer}/locations`);
  const body = await resp.json();
  locationsSignal.value = body;
};

const doSearch = async () => {
  searchStatusSignal.value = "loading";
  const q = encodeURIComponent(searchParametersSignal.value.query.value);
  const type = encodeURIComponent(searchParametersSignal.value.nameType.value);
  const loc = encodeURIComponent(
    searchParametersSignal.value.curLocation.value
  );
  const url = `${apiServer}/search?query=${q}&type=${type}&loc=${loc}`;

  const resp = await fetch(url);
  const j = await resp.json();
  if (j.error !== undefined) {
    searchStatusSignal.value = "error";
    searchResultsSignal.value = emptySearchResults;
    toast(j.error);
  } else {
    searchResultsSignal.value = j;
    if (
      searchResultsSignal.value.relatedResults.length === 0 &&
      searchResultsSignal.value.specificResults.length === 0 &&
      searchResultsSignal.value.extendedResults.length === 0
    ) {
      toast("No results");
    }
    searchStatusSignal.value = "ok";
  }
};

export {
  searchParametersSignal,
  locationsSignal,
  searchStatusSignal,
  searchResultsSignal,
  toastSignal,
  doSearch,
  doGetLocations,
};
