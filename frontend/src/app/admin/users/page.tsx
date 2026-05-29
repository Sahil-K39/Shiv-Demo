"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminAPI } from "@/lib/api";
import type { AdminUser } from "@/types";

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Badge({
  tone,
  children,
}: {
  tone: "black" | "green" | "amber" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    black: "border-black bg-black text-white",
    green: "border-green-300 bg-green-50 text-green-700",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    neutral: "border-black/10 text-black/45",
  };

  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminAPI
      .listUsers()
      .then((response) => {
        if (!cancelled) setUsers(response.users);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load users");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [query, users]);

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const verified = users.filter((user) => user.is_verified).length;
    const loggedIn = users.filter(
      (user) => Boolean(user.last_login_at) || user.login_count > 0
    ).length;
    return { admins, verified, loggedIn };
  }, [users]);

  return (
    <AdminShell>
      <div className="mb-8">
        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/45">
          Accounts
        </p>
        <h1 className="text-[32px] font-light uppercase tracking-[0.12em]">
          Users
        </h1>
        <p className="mt-3 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.12em] text-black/45">
          Customer emails, verification state, admin roles, and login activity.
        </p>
      </div>

      {error && (
        <p className="mb-5 border border-red-200 bg-red-50 p-3 text-[11px] uppercase tracking-[0.12em] text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Users", users.length],
          ["Admins", summary.admins],
          ["Verified", summary.verified],
          ["Logged In", summary.loggedIn],
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
          placeholder="Search name, email, or role"
          className="min-h-11 w-full border border-black/10 px-4 text-[13px] outline-none focus:border-black"
        />
      </div>

      <div className="overflow-x-auto border border-black/10">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.16em] text-black/45">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Verified</th>
              <th className="p-4">Logins</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 text-[13px]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="p-4">
                  <p className="font-medium uppercase tracking-[0.08em]">
                    {user.name}
                  </p>
                  <p className="mt-1 text-[11px] normal-case tracking-normal text-black/55">
                    {user.email}
                  </p>
                </td>
                <td className="p-4">
                  <Badge tone={user.role === "admin" ? "black" : "neutral"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge tone={user.is_verified ? "green" : "amber"}>
                    {user.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </td>
                <td className="p-4">{user.login_count.toLocaleString()}</td>
                <td className="p-4 text-[12px] text-black/55">
                  {formatDate(user.last_login_at)}
                </td>
                <td className="p-4 text-[12px] text-black/55">
                  {formatDate(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="p-8 text-center text-[12px] uppercase tracking-[0.14em] text-black/45">
            No users match this search.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
