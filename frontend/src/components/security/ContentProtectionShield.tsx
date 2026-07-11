"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentProtectionShield() {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isScreenCaptureBlocked, setIsScreenCaptureBlocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

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
      showSecurityWarning("Right-click & long-press save is disabled on proprietary articles & imagery.");
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

    // 4. INSTANT CROSS-PLATFORM KEYBOARD INTERCEPTION (macOS + Windows)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen Key (Windows PrtScn / Alt+PrtScn / Ctrl+PrtScn)
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setIsScreenCaptureBlocked(true);
        showSecurityWarning("Windows Screenshot attempt detected. Display obscured for security.", true);
        try {
          navigator.clipboard.writeText("");
        } catch {}
        return;
      }

      const isMacMeta = e.metaKey;
      const isCtrl = e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // WINDOWS SNIPPING TOOL: Win + Shift + S or Ctrl + Shift + S
      if (((isMacMeta || isCtrl) && isShift && e.key.toLowerCase() === "s") || (isAlt && (e.key === "PrintScreen" || e.keyCode === 44))) {
        e.preventDefault();
        setIsScreenCaptureBlocked(true);
        showSecurityWarning("Windows Snipping Tool intercepted by Shiv Shakti Security Shield.", true);
        return;
      }

      // INSTANT PRE-EMPTIVE SHIELD: If Cmd + Shift (macOS) or Win + Shift (Windows) or Ctrl + Shift is held down
      if ((isMacMeta && isShift) || (isCtrl && isShift && ["s", "S", "i", "I", "c", "C"].includes(e.key))) {
        setIsScreenCaptureBlocked(true);
        showSecurityWarning("Screen capture shortcut intercepted by Shiv Shakti Security Shield.", true);
        return;
      }

      // macOS Explicit Screenshot Shortcuts: Cmd + Shift + 3, 4, 5, 6
      if (isMacMeta && isShift && ["3", "4", "5", "6", "$", "%", "^"].includes(e.key)) {
        e.preventDefault();
        setIsScreenCaptureBlocked(true);
        showSecurityWarning("macOS Screen Capture protected by Shiv Shakti Security Shield.", true);
        return;
      }

      // Save Page: Ctrl/Cmd + S
      if ((isCtrl || isMacMeta) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        showSecurityWarning("Saving HTML / article content is prohibited.");
        return;
      }

      // View Source & DevTools shortcuts: F12, Ctrl/Cmd + U
      if (e.key === "F12" || ((isCtrl || isMacMeta) && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        showSecurityWarning("Inspection & developer tools are locked on wholesale views.");
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        showSecurityWarning("Screenshot attempt detected. Display obscured for security.", true);
      }
    };

    // 5. MOBILE INTERCEPTION: 3+ Finger Swipe / Screenshot Gestures (iOS & Android)
    const handleTouchStart = (e: TouchEvent) => {
      // If 3 or more fingers touch the screen simultaneously (common Android/iOS screenshot gesture)
      if (e.touches && e.touches.length >= 3) {
        setIsScreenCaptureBlocked(true);
        showSecurityWarning("Multi-finger screen capture gesture blocked on mobile device.", true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        setIsScreenCaptureBlocked(true);
      }
    };

    // 6. CROSS-PLATFORM WINDOW BLUR / VISIBILITY / APP SWITCHER SHIELD
    // When macOS Screenshot app (Cmd+Shift+5), Windows Snipping Tool, mobile App Switcher (iOS/Android Multitasking),
    // or external screen recorders take focus, instantly obscure the viewport.
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const isShieldActive = isScreenCaptureBlocked || isWindowBlurred;

  return (
    <>
      {/* Repeating Foreground Security Watermark Matrix */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden opacity-[0.045] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='420' height='220' viewBox='0 0 420 220' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='15' y='110' fill='%23000000' font-family='monospace' font-size='11' font-weight='bold' transform='rotate(-24 210 110)' letter-spacing='4'%3ESHIV SHAKTI • CONFIDENTIAL WHOLESALE IP%3C/text%3E%3C/svg%3E")`,
        }}
      />

      {/* Screen Capture & Window Blur Shield Overlay */}
      {isShieldActive && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-neutral-950/98 p-8 text-center backdrop-blur-3xl select-none">
          <div className="max-w-md rounded-2xl border border-white/20 bg-neutral-900/95 p-8 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-red-500">
              <svg
                className="h-7 w-7"
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
            <h3 className="text-lg font-bold tracking-widest text-white uppercase">
              Confidential Content Shield
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-neutral-300">
              Shiv Shakti wholesale articles, garment specifications, and imagery are protected under proprietary IP security. Screen capture, snipping overlays, and background snapshots are disabled.
            </p>
            <div className="mt-6 border-t border-white/10 pt-4 text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
              Click or tap screen to resume wholesale session
            </div>
          </div>
        </div>
      )}

      {/* Security Toast Notification */}
      <AnimatePresence>
        {securityNotice && !isShieldActive && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[99990] flex max-w-sm items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
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
