import React, { useState, useEffect } from "react";

import "./widget.css";
import { FrameMessageType, FrameSizeChangeMessage } from "./frameMessages";

export const Widget = () => {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onFrameResizeMessage = (
      message: MessageEvent<
        FrameSizeChangeMessage | object | string | boolean | number
      >
    ) => {
      // We might have multiple widgets displayed at the same time, so
      // if the message comes from a different widget, we ignore it.
      if (message.source !== iframe.contentWindow) return;

      const data = message.data;
      if (
        typeof data === "object" &&
        "type" in data &&
        data.type === FrameMessageType.FrameSizeChange
      ) {
        setSize({
          width: data.width,
          height: data.height,
        });
      }
    };

    window.addEventListener("message", onFrameResizeMessage);
    return () => {
      window.removeEventListener("message", onFrameResizeMessage);
    };
  }, []);

  return (
    <div className="widget">
      <h1>App content</h1>
      <p>Check out our latest podcast</p>
      <div
        style={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          ref={iframeRef}
          width="100%"
          height={size.height + "px"}
          src="/iframe"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
};
