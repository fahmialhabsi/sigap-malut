import React from "react";

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-white px-4 py-2 rounded z-50"
      aria-label="Skip to main content"
    >
      Skip to Content
    </a>
  );
}
