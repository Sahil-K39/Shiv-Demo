"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentProtectionShield() {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isScreenCaptureBlocked, setIsScreenCaptureBlocked] = useState(false);

  const showSecurityWarning = (message: string, blockScreen = false) => {
    setSecurityNotice(message);
    if (blockScreen) {
      setIsScreenCaptureBlocked(true);
      setTimeout(() => {
        setIsScreenCaptureBlocked(false);
      }, 2400);
    }
    setTimeout(() => {
      setSecurityNotice(null);
    }, 2800);
  };

  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu only inside text input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      showSecurityWarning("Right-click is disabled to protect proprietary articles & imagery.");
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
          "© SHIV SHAKTI PROJECT — CONFIDENTIAL WHOLESALE CONTENT. UNAUTHORIZED COPYING OR DISTRIBUTION IS STRICTLY PROHIBITED."
        );
      }
      showSecurityWarning("Copying is restricted on confidential wholesale articles.");
    };

    // 3. Prevent Image / Element Dragging
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "PICTURE" || target.tagName === "A") {
        e.preventDefault();
        showSecurityWarning("Dragging product images is disabled.");
      }
    };

    // 4. Intercept Screen Capture & Inspection Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen Key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        showSecurityWarning("Screenshot attempt detected. Display obscured for security.", true);
        try {
          navigator.clipboard.writeText("");
        } catch {}
        return;
      }

      const isMacMeta = e.metaKey;
      const isCtrl = e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // macOS Screenshots: Cmd + Shift + 3, 4, 5, 6
      if (isMacMeta && isShift && ["3", "4", "5", "6", "$", "%", "^"].includes(e.key)) {
        e.preventDefault();
        showSecurityWarning("macOS Screen Capture protected by Shiv Shakti Security Shield.", true);
        return;
      }

      // Windows Snipping Tool: Win/Ctrl + Shift + S
      if ((isCtrl || isMacMeta) && isShift && e.key.toLowerCase() === "s") {
        e.preventDefault();
        showSecurityWarning("Screen Snipping tool intercepted.", true);
        return;
      }

      // Save Page: Ctrl/Cmd + S
      if ((isCtrl || isMacMeta) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        showSecurityWarning("Saving HTML / article content is prohibited.");
        return;
      }

      // View Source & DevTools shortcuts: F12, Ctrl/Cmd + U, Ctrl/Cmd + Shift + I/J/C
      if (
        e.key === "F12" ||
        ((isCtrl || isMacMeta) && e.key.toLowerCase() === "u") ||
        ((isCtrl || isMacMeta) &&
          isShift &&
          ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        showSecurityWarning("Inspection & developer tools are locked on wholesale views.");
        return;
      }
    };

    // 5. Detect PrintScreen KeyUp
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        showSecurityWarning("Screenshot attempt detected. Display obscured for security.", true);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, []);

  return (
    <>
      {/* Subtle Repeating Security Watermark Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden opacity-[0.028] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='380' height='200' viewBox='0 0 380 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='100' fill='%23000000' font-family='monospace' font-size='10' font-weight='bold' transform='rotate(-22 190 100)' letter-spacing='3'%3ESHIV SHAKTI • CONFIDENTIAL ARTICLE BUYING ROOM%3C/text%3E%3C/svg%3E")`,
        }}
      />

      {/* Screen Capture Blurring Shield Overlay */}
      <AnimatePresence>
        {isScreenCaptureBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-8 text-center backdrop-blur-2xl"
          >
            <div className="max-w-md rounded-2xl border border-white/20 bg-neutral-900/90 p-8 shadow-2xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold tracking-wider text-white uppercase">
                Content Capture Protected
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Shiv Shakti wholesale designs, articles, and lookbooks are confidential proprietary assets. Screenshot capture and unauthorized reproduction are disabled.
              </p>
              <div className="mt-6 border-t border-white/10 pt-4 text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                Security Protocol SS-26 • ID: PROPRIETARY-BUYING-ROOM
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Toast Notification */}
      <AnimatePresence>
        {securityNotice && !isScreenCaptureBlocked && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[9990] flex max-w-sm items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">
                {securityNotice}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                Shiv Shakti IP Shield Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
