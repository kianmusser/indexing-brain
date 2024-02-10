import { render, html } from "./preact.js";
import App from "./components/app.js";

render(html`<${App} />`, document.body);
