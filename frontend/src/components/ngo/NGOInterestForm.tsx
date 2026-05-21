"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

export default function NGOInterestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <form
      id="apply"
      className="border border-black/15 bg-white p-6 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setIsSubmitted(true);
      }}
    >
      <div className="mb-8">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gray-500">
          Apply For Work
        </p>
        <h2 className="text-[28px] font-light uppercase leading-tight text-black md:text-[40px]">
          Start With Your Skill
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          Full Name
          <input
            required
            type="text"
            className="border-b border-black/20 bg-transparent py-3 text-[14px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
            placeholder="Your name"
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          Phone Number
          <input
            required
            type="tel"
            className="border-b border-black/20 bg-transparent py-3 text-[14px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
            placeholder="+91"
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          City
          <input
            required
            type="text"
            className="border-b border-black/20 bg-transparent py-3 text-[14px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
            placeholder="Where you live"
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          Preferred Work
          <select
            required
            className="border-b border-black/20 bg-transparent py-3 text-[14px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
            defaultValue=""
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="tailoring">Tailoring and stitching</option>
            <option value="quality">Quality checking</option>
            <option value="packing">Packing and dispatch</option>
            <option value="digital">Digital catalogue support</option>
          </select>
        </label>
      </div>

      <label className="mt-5 flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
        Current Skill Or Training Need
        <textarea
          rows={4}
          className="resize-none border border-black/15 bg-transparent p-4 text-[14px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          placeholder="Tell us what you can do or what you want to learn"
        />
      </label>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="group relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden border border-black px-8 text-[11px] uppercase tracking-[0.18em] text-black"
        >
          <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
            Submit Interest
          </span>
          <ArrowRightIcon className="relative z-10 h-4 w-4 transition-colors duration-500 group-hover:text-white" />
          <span className="absolute inset-0 translate-y-full bg-black transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
        </button>

        {isSubmitted && (
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-black">
            <CheckIcon className="h-4 w-4" />
            Interest received
          </p>
        )}
      </div>
    </form>
  );
}
