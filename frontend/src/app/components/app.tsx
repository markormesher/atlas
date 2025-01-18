import React from "react";
import { ReactElement } from "react";
import { Editor } from "./editor";
import { Map } from "./map";

function App(): ReactElement {
  const path = window.location.pathname;
  if (path == "/") {
    return <Map />;
  } else if (path == "/edit") {
    return <Editor />;
  } else {
    window.location.assign("/");
    return <p>Redirecting...</p>;
  }
}

export { App };
