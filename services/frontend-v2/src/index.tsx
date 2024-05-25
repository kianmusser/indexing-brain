import { hydrate, prerender as ssr } from "preact-iso";

import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/header";
import SearchResults from "./components/searchResults";
import { useEffect } from "preact/hooks";
import { doGetLocations } from "./data";

export function App() {
  useEffect(() => {
    doGetLocations();
  }, []);
  return (
    <div class="vh-100 container-fluid d-flex flex-column">
      <Header />
      <div class="flex-grow-1 row bg-body-tertiary">
        <SearchResults />
        <p>toaster</p>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
