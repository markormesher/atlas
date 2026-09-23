import type { ReactElement } from "react";
import { Editor } from "./editor.js";
import { MapView } from "./map.js";
import { Toaster } from "./toaster.js";

function App(): ReactElement {
  let e: ReactElement;

  const path = window.location.pathname;
  if (path === "/") {
    e = <MapView />;
  } else if (path === "/edit") {
    e = <Editor />;
  } else {
    window.location.assign("/");
    e = <p>Redirecting...</p>;
  }

  return (
    <>
      {e}
      <Toaster />
    </>
  );
}

export { App };
