import { doGetLocations } from "../data.js";
import { html, useEffect } from "../preact.js";
import Header from "./header.js";
import SearchResults from "./search-results.js";
import Toaster from "./toaster.js";

export default () => {
  useEffect(() => {
    doGetLocations();
  }, []);
  return html`<div class="vh-100 container-fluid d-flex flex-column">
    <${Header} />
    <div class="flex-grow-1 row bg-body-tertiary">
      <${SearchResults} />
      <${Toaster} />
    </div>
  </div>`;
};
