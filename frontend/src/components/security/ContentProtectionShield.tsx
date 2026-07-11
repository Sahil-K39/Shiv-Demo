"use client";

import React, { useEffect } from "react";

export default function ContentProtectionShield() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu (Desktop & Mobile Long-Press)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
    };

    // 2. Prevent Copy & Cut Actions
    const handleCopyCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          "text/plain",
          "© SHIV SHAKTI PROJECT — CONFIDENTIAL WHOLESALE CONTENT."
        );
      }
    };

    // 3. Prevent Image / Element Dragging
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "PICTURE" || target.tagName === "A") {
        e.preventDefault();
      }
    };

    // 4. Silently prevent desktop keyboard inspection/save shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMacMeta = e.metaKey;
      const isCtrl = e.ctrlKey;
      const isShift = e.shiftKey;

      if ((isCtrl || isMacMeta) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return;
      }

      if (e.key === "F12" || ((isCtrl || isMacMeta) && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return null;
}
