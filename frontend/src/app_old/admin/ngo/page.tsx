"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import type { NGOInterest } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminNGOPage() {
  const [interests, setInterests] = useState<NGOInterest[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminAPI
      .listNGOInterests()
      .then((response) => {
        if (!cancelled) setInterests(response.interests);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load NGO forms");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInterests = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return interests;
    return interests.filter((interest) =>
      [interest.name, interest.email, interest.phone, interest.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [interests, query]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const todayCount = interests.filter(
      (interest) => new Date(interest.created_at).toDateString() === today
    ).length;
    const withMessage = interests.filter((interest) => interest.message.trim()).length;
    const uniqueEmails = new Set(interests.map((interest) => interest.email)).size;
    return { todayCount, withMessage, uniqueEmails };
  }, [interests]);

  return (
    <AdminShell>
      <div className="mb-8">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
          Community Intake
        </p>
        <h1 className="text-[32px] font-light uppercase tracking-[0.12em]">
          NGO Forms
        </h1>
        <p className="mt-3 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
          NGO partnership interest details from the public form.
        </p>
      </div>

      {error && (
        <p className="mb-5 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Forms", interests.length],
          ["Today", summary.todayCount],
          ["With Message", summary.withMessage],
          ["Unique Emails", summary.uniqueEmails],
        ].map(([label, value]) => (
          <div key={label} className="border border-black/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">
              {label}
            </p>
            <p className="mt-2 text-[24px] font-light">
              {Number(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 border border-black/10 p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, phone, or message"
          className="min-h-11 w-full border border-black/10 px-4 text-[13px] outline-none focus:border-black"
        />
      </div>

      <div className="overflow-x-auto border border-black/10">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.16em] text-black/45">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Message</th>
              <th className="p-4">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 text-[13px]">
            {filteredInterests.map((interest) => (
              <tr key={interest.id} className="align-top">
                <td className="p-4">
                  <p className="font-medium uppercase tracking-[0.08em]">
                    {interest.name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/45">
                    Form #{interest.id}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-[12px] normal-case tracking-normal text-black/70">
                    {interest.email}
                  </p>
                  <p className="mt-1 text-[12px] tracking-[0.04em] text-black/55">
                    {interest.phone}
                  </p>
                </td>
                <td className="max-w-[420px] p-4">
                  <p className="whitespace-pre-line text-[12px] leading-relaxed text-black/65">
                    {interest.message || "No message added."}
                  </p>
                </td>
                <td className="p-4 text-[12px] text-black/55">
                  {formatDate(interest.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInterests.length === 0 && (
          <p className="p-8 text-center text-[12px] uppercase tracking-[0.14em] text-black/45">
            No NGO forms match this search.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
