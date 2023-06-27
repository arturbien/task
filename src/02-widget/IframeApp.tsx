import React, { useEffect } from "react";
import { frameSizeChangeMessage } from "./frameMessages";

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
export const IframeApp = () => {
  // TODO: extract this to a custom hook/package to easily
  // use it in other apps embeddable within a Widget.
  useEffect(() => {
    // No need to send messages if we're not in an iframe.
    if (!inIframe()) return;

    // TODO: debounce this
    const sendSizeChangeMessage = () => {
      // Getting the size from html instead of getting it from the div below
      // to make sure we always include body paddings around it and similar.
      const html = document.documentElement;

      window.parent.postMessage(
        frameSizeChangeMessage({
          width: html.offsetWidth,
          height: html.offsetHeight,
        }),
        "*"
      );
    };
    sendSizeChangeMessage();

    window.addEventListener("resize", sendSizeChangeMessage);
    return () => {
      window.removeEventListener("resize", sendSizeChangeMessage);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "rebeccapurple",
        color: "white",
        padding: "2rem",
        borderRadius: "1rem",
        fontSize: "2rem",
      }}
    >
      Dynamic marketing content will be here
    </div>
  );
};
