import { signal } from "./preact.js";

const apiServer = "https://ib.kianmusser.com/node";

const searchParametersSignal = signal({
  nameType: signal("N"),
  curLocation: signal("US"),
  query: signal(""),
});

const searchStatusSignal = signal("ok"); // ok, loading, error
const locationsSignal = signal([]);
const errorMsgSignal = signal("");

const searchResultsSignal = signal({
  specificResults: [],
  relatedResults: [],
  extendedResults: [],
});

const toastSignal = signal("Welcome to the Indexing-Brain!");

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
    errorMsgSignal.value = j.error;
    console.log("err", resp.status);
  } else {
    searchResultsSignal.value = j;
    if (
      searchResultsSignal.value.relatedResults.length === 0 &&
      searchResultsSignal.value.specificResults.length === 0 &&
      searchResultsSignal.value.extendedResults.length === 0
    ) {
      toastSignal.value = "";
      toastSignal.value = "No results";
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
