"use client";
// src/registry.js
import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";

export default function StyledComponentsRegistry({ children }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    // Reset the sheet after injecting to keep server/client order aligned
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  const shouldForwardProp = (prop, element) => {
    // Only filter for native DOM elements; always forward props for custom components
    if (typeof element !== "string") return true;
    // Allow standard aria/data props and valid DOM props; filter others like variant, component, etc.
    return isPropValid(prop) || prop.startsWith("aria-") || prop.startsWith("data-");
  };

  if (typeof window !== "undefined") {
    return (
      <StyleSheetManager enableVendorPrefixes shouldForwardProp={shouldForwardProp}>
        {children}
      </StyleSheetManager>
    );
  }

  return (
    <StyleSheetManager
      sheet={styledComponentsStyleSheet.instance}
      enableVendorPrefixes
      shouldForwardProp={shouldForwardProp}
    >
      {children}
    </StyleSheetManager>
  );
}
