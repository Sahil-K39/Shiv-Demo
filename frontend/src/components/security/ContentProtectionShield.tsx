"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentProtectionShield() {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isShieldActive, setIsShieldActive] = useState(false);

  const isMobileDevice = useCallback(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTouchMac = navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/.test(ua);
    return isMobileUA || isTouchMac;
  }, []);

  const triggerDesktopShield = useCallback((notice?: string) => {
    if (isMobileDevice()) return;
    setIsShieldActive(true);
    if (notice) {
      setSecurityNotice(notice);
      setTimeout(() => setSecurityNotice(null), 3000);
    }
  }, [isMobileDevice]);

  const releaseDesktopShield = useCallback(() => {
    setIsShieldActive(false);
  }, []);

  useEffect(() => {
    // 1. Silent Protection for ALL platforms (Desktop & Mobile): prevent right-click & image drag
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
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "PICTURE" || target.tagName === "A") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("dragstart", handleDragStart);

    // If on Mobile, DO NOT add desktop screenshot modal or window blur/resize listeners!
    if (isMobileDevice()) {
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopyCut);
        document.removeEventListener("cut", handleCopyCut);
        document.removeEventListener("dragstart", handleDragStart);
      };
    }

    // 2. DESKTOP ONLY: Keyboard Screenshot Interception & Shield Overlay
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        triggerDesktopShield("Screenshot attempt detected on desktop.");
        try {
          navigator.clipboard.writeText("");
        } catch {}
        return;
      }

      const isMacMeta = e.metaKey;
      const isCtrl = e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      if (((isMacMeta || isCtrl) && isShift && e.key.toLowerCase() === "s") || (isAlt && (e.key === "PrintScreen" || e.keyCode === 44))) {
        e.preventDefault();
        triggerDesktopShield("Snipping tool intercepted by Shiv Shakti Security Shield.");
        return;
      }

      if ((isMacMeta && isShift) || (isCtrl && isShift && ["s", "S", "i", "I", "c", "C"].includes(e.key))) {
        triggerDesktopShield("Screen capture shortcut intercepted.");
        return;
      }

      if (isMacMeta && isShift && ["3", "4", "5", "6", "$", "%", "^"].includes(e.key)) {
        e.preventDefault();
        triggerDesktopShield("macOS Screen Capture protected.");
        return;
      }

      if ((isCtrl || isMacMeta) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return;
      }

      if (e.key === "F12" || ((isCtrl || isMacMeta) && e.key.toLowerCase() === "u")) {
        e.preventDefault();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        triggerDesktopShield("Screenshot attempt detected on desktop.");
      }
    };

    // Desktop window blur triggers temporary shield
    const handleWindowBlur = () => {
      triggerDesktopShield();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isMobileDevice, triggerDesktopShield]);

  return (
    <>
      {/* Desktop-Only Shield Overlay */}
      {isShieldActive && (
        <div
          onClick={releaseDesktopShield}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-neutral-950/98 p-8 text-center backdrop-blur-3xl select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md rounded-2xl border border-white/20 bg-neutral-900/95 p-8 shadow-2xl"
          >
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
              Shiv Shakti wholesale articles, garment specifications, and imagery are protected under proprietary IP security. Screen capture and snipping overlays are disabled on desktop.
            </p>
            <button
              type="button"
              onClick={releaseDesktopShield}
              className="mt-6 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              Click to resume wholesale session
            </button>
          </div>
        </div>
      )}

      {/* Desktop Toast Notification */}
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
