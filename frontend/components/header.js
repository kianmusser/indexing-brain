import { html } from "../preact.js";
import {
  doSearch,
  locationsSignal,
  searchParametersSignal,
  searchStatusSignal,
} from "../data.js";
import { SearchIcon } from "../icons.js";

export default () => {
  let searchButton;
  const status = searchStatusSignal.value;
  if (status === "ok" || status === "error") {
    const btnBgClass = status === "ok" ? "btn-primary" : "btn-danger";
    searchButton = html`<button
      type="button"
      class="btn ${btnBgClass}"
      onClick=${doSearch}
    >
      ${SearchIcon}
    </button>`;
  } else {
    searchButton = html`<button type="button" class="btn btn-warning">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </button>`;
  }

  return html`
    <nav class="row navbar navbar-expand-lg bg-secondary">
      <div class="container-fluid">
        <form
          class="row"
          onSubmit=${(e) => {
            e.preventDefault();
            doSearch();
          }}
        >
          <select
            class="col form-select fs-3"
            id="loc"
            value=${searchParametersSignal.value.curLocation}
            onChange=${(e) =>
              (searchParametersSignal.value.curLocation.value.value =
                e.target.value)}
          >
            ${locationsSignal.value.map(
              (l) =>
                html`<option value=${l.abbr}>${l.name}</option>`
            )}
          </select>

	<!--
	<div class="col">
		<input type="radio" name="type" id="type-names" class="btn-check">
		<label for="type-names" class="btn btn-primary fs-3">Names</label><input type="radio" name="type" id="type-places" class="btn-check">
		<label for="type-places" class="btn btn-primary fs-3">Places</label>
		<input type="radio" name="type" id="type-other" class="btn-check">
		<label for="type-other" class="btn btn-primary fs-3">Other</label>
	</div>
	-->


          <select
            class="col form-select fs-3"
            id="type"
            value=${searchParametersSignal.value.nameType}
            onChange=${(e) =>
              (searchParametersSignal.value.nameType.value = e.target.value)}
          >
            <option value="N">Names</option>
            <option value="P">Places</option>
            <option value="O">Other</option>
          </select>
          <div class="input-group col">
            <input
              type="text"
              class="form-control fs-3"
              id="query"
              placeholder="Search"
              value=${searchParametersSignal.value.query}
              onInput=${(e) =>
                (searchParametersSignal.value.query.value = e.target.value)}
            />
            ${searchButton}
          </div>
        </form>
      </div>
    </nav>
  `;
};
