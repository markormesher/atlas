import React from "react";
import { ReactElement } from "react";
import { Editor } from "./editor";
import { Map } from "./map";
import { Toaster } from "./toaster";

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
