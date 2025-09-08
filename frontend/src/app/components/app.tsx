import React from "react";
import { ReactElement } from "react";
import { Editor } from "./editor.js";
import { Map } from "./map.js";
import { Toaster } from "./toaster.js";

function App(): ReactElement {
  let e: ReactElement;

  const path = window.location.pathname;
  if (path == "/") {
    e = <Map />;
  } else if (path == "/edit") {
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
