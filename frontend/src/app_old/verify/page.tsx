"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { authAPI } from "@/lib/api";
import { useCartStore } from "@/store/cart";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const setUser = useCartStore((state) => state.setUser);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await authAPI.verify(token);
        if (cancelled) return;
        setUser(response.user);
        setStatus("success");
        setMessage("Email verified. Your account is now active.");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token, setUser]);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-white flex items-center justify-center px-6 py-16 text-black">
      <div className="w-full max-w-md border border-black p-8 md:p-10">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
          Account Verification
        </p>
        <h1 className="mb-8 text-[28px] font-light uppercase tracking-[0.12em]">
          {status === "success" ? "Identity Confirmed" : status === "error" ? "Verification Failed" : "Verifying"}
        </h1>
        <p
          className={`mb-10 text-[12px] uppercase leading-6 tracking-[0.14em] ${
            status === "error" ? "text-red-600" : "text-black/60"
          }`}
        >
          {message}
        </p>
        <Link
          href={status === "success" ? "/account" : "/login"}
          className="block w-full border border-black bg-black px-6 py-4 text-center text-[11px] uppercase tracking-[0.2em] text-white"
        >
          {status === "success" ? "Continue" : "Back To Login"}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-80px)] bg-white flex items-center justify-center text-[11px] uppercase tracking-[0.2em] text-black">
          Verifying...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
