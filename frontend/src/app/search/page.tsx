

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Search() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div
        className="w-full max-w-3xl px-10"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[12px] uppercase tracking-[0.24em] text-gray-500 mb-4">
          SEARCH ARCHIVE
        </h1>
        <div className="relative border-b border-black">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[40px] md:text-[60px] font-light text-black uppercase outline-none placeholder:text-gray-200 py-4"
            placeholder="ENTER KEYWORD"
            autoFocus
          />
        </div>
        <AnimatePresence>
          {query && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 text-center">
                No matching records found in the current archive.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
