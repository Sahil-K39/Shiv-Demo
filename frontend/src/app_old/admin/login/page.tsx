"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await adminAPI.login({ email, password });
      if (response.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white px-6 py-16 text-black">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-black/10 md:grid-cols-[1fr_420px]">
        <div className="hidden bg-black p-10 text-white md:flex md:flex-col md:justify-end">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-white/45">
            Shiv Shakti Admin
          </p>
          <h1 className="text-[42px] font-light uppercase leading-none tracking-[0.12em]">
            Product Control
          </h1>
        </div>
        <form className="p-8 md:p-10" onSubmit={handleSubmit}>
          <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
            Secure Login
          </p>
          <h2 className="mb-10 text-[28px] font-light uppercase tracking-[0.12em]">
            Admin Access
          </h2>

          {error && (
            <p className="mb-6 text-[11px] uppercase tracking-[0.12em] text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              className="w-full border-0 border-b border-black/20 bg-transparent py-4 text-[14px] outline-none focus:border-black"
            />
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full border-0 border-b border-black/20 bg-transparent py-4 text-[14px] outline-none focus:border-black"
            />
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="mt-10 w-full border border-black bg-black px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-white disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
