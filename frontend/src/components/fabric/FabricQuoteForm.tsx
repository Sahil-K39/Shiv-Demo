"use client";

import { FormEvent, useState } from "react";

import { fabricAPI } from "@/lib/api";
import type { FabricQuoteInput } from "@/types";

const initialForm: FabricQuoteInput = {
  name: "",
  email: "",
  phone: "+91 ",
  fabric_type: "Textured Cotton",
  quantity: 50,
  preferred_color: "",
  delivery_city: "",
  timeline: "",
  message: "",
};

const fabricOptions = [
  "Textured Cotton",
  "Linen Blend",
  "Silk Touch",
  "Handloom Surface",
  "Custom Fabric Requirement",
];

export default function FabricQuoteForm() {
  const [form, setForm] = useState<FabricQuoteInput>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const updateField = <K extends keyof FabricQuoteInput>(field: K, value: FabricQuoteInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      await fabricAPI.submitQuote({
        ...form,
        quantity: Number(form.quantity),
      });
      setStatus("success");
      setMessage(
        "Quote request sent. We will email quote, payment instructions, and delivery details after review."
      );
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not send the enquiry.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Name
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Fabric Type
          <select
            required
            value={form.fabric_type}
            onChange={(event) => updateField("fabric_type", event.target.value)}
            className="h-12 border border-black/15 bg-white px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          >
            {fabricOptions.map((fabric) => (
              <option key={fabric} value={fabric}>
                {fabric}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Quantity
          <input
            required
            type="number"
            min={50}
            value={form.quantity}
            onChange={(event) => updateField("quantity", Number(event.target.value))}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Preferred Color
          <input
            value={form.preferred_color}
            onChange={(event) => updateField("preferred_color", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Delivery City
          <input
            required
            value={form.delivery_city}
            onChange={(event) => updateField("delivery_city", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>

        <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Timeline
          <input
            value={form.timeline}
            onChange={(event) => updateField("timeline", event.target.value)}
            className="h-12 border border-black/15 px-4 text-[13px] normal-case tracking-normal text-black outline-none transition-colors focus:border-black"
          />
        </label>
      </div>

      <label className="grid gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
        Requirement Details
        <textarea
          rows={5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="resize-none border border-black/15 px-4 py-3 text-[13px] normal-case leading-relaxed tracking-normal text-black outline-none transition-colors focus:border-black"
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-[52px] items-center justify-center bg-black px-8 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {status === "sending" ? "Sending" : "Send Quote Request"}
        </button>
        {message ? (
          <p
            className={`text-[12px] uppercase leading-relaxed tracking-[0.12em] ${
              status === "error" ? "text-red-700" : "text-gray-600"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
