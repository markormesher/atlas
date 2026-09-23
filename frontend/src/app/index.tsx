import { createRoot } from "react-dom/client";
import { App } from "./components/app.js";

document.body.innerHTML = `<div id="app"></div>`;
const appEl = document.getElementById("app");
if (appEl) {
  const root = createRoot(appEl);
  root.render(<App />);
} else {
  document.body.innerHTML = "Error: couldn't find app div.";
}
