"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ngoAPI } from "@/lib/api";
import type { NGOInterestInput } from "@/types";

const initialForm: NGOInterestInput = {
  name: "",
  email: "",
  phone: "+91 ",
  message: "",
};

export default function NgoApplicationForm() {
  const [form, setForm] = useState<NGOInterestInput>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const updateField = <K extends keyof NGOInterestInput>(field: K, value: NGOInterestInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      await ngoAPI.submitInterest(form);
      setStatus("success");
      setFeedback(
        "Application submitted successfully. We will review your details and contact you soon."
      );
      setForm(initialForm);
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setFeedback(error.message || "Failed to submit application. Please try again later.");
    }
  }

  return (
    <div className="w-full max-w-2xl bg-white p-8 md:p-12 shadow-sm border border-black/10 mx-auto">
      <div className="mb-8">
        <h3 className="text-[18px] md:text-[22px] font-light uppercase tracking-widest text-black mb-2">
          Apply as an Artisan
        </h3>
        <p className="text-[12px] uppercase tracking-[0.15em] text-gray-500 leading-relaxed">
          Submit your details to join our artisan network. We provide skill training, fair wages, and a supportive community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="ngo-name" className="text-[10px] uppercase tracking-[0.2em] text-black font-semibold">
              Full Name *
            </label>
            <input
              id="ngo-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              disabled={status === "sending"}
              className="border-b border-black/20 bg-transparent py-3 text-[13px] uppercase tracking-[0.1em] text-black transition-colors focus:border-black focus:outline-none disabled:opacity-50"
              placeholder="Your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ngo-phone" className="text-[10px] uppercase tracking-[0.2em] text-black font-semibold">
              Phone Number *
            </label>
            <input
              id="ngo-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              disabled={status === "sending"}
              className="border-b border-black/20 bg-transparent py-3 text-[13px] uppercase tracking-[0.1em] text-black transition-colors focus:border-black focus:outline-none disabled:opacity-50"
              placeholder="+91"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ngo-email" className="text-[10px] uppercase tracking-[0.2em] text-black font-semibold">
            Email Address
          </label>
          <input
            id="ngo-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={status === "sending"}
            className="border-b border-black/20 bg-transparent py-3 text-[13px] tracking-[0.1em] text-black transition-colors focus:border-black focus:outline-none disabled:opacity-50"
            placeholder="email@example.com (optional)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ngo-message" className="text-[10px] uppercase tracking-[0.2em] text-black font-semibold">
            Experience / Skills / Message *
          </label>
          <textarea
            id="ngo-message"
            required
            rows={4}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            disabled={status === "sending"}
            className="resize-none border-b border-black/20 bg-transparent py-3 text-[13px] uppercase tracking-[0.1em] text-black transition-colors focus:border-black focus:outline-none disabled:opacity-50"
            placeholder="Tell us about your weaving, sewing, or crafting experience..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === "sending"}
            className="flex min-h-[52px] w-full items-center justify-center bg-black px-6 text-[12px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Submit Application"
            )}
          </button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-4 text-center text-[11px] uppercase tracking-[0.15em] ${
                status === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
