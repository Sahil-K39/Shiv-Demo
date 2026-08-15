"use client";

import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const { user, logout, checkSession } = useCartStore();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkSession().finally(() => {
      if (!cancelled) {
        setIsCheckingSession(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  useEffect(() => {
    if (!isCheckingSession && !user) {
      router.replace("/login");
    }
  }, [isCheckingSession, user, router]);

  if (isCheckingSession || !user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin border border-black/30 border-t-black" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-white flex items-center justify-center p-10 md:p-20">
      <div className="w-full max-w-md border border-black p-10">
        <h1 className="text-[28px] font-light tracking-[0.15em] uppercase mb-10 text-black">ACCOUNT PROFILE</h1>
        
        <div className="space-y-6 mb-10">
          <div>
            <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase">DESIGNATION</p>
            <p className="text-black text-[14px] tracking-[0.05em] mt-1">{user.name}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase">EMAIL ADDRESS</p>
            <p className="text-black text-[14px] tracking-[0.05em] mt-1">{user.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="relative overflow-hidden group w-full border border-black text-white bg-black px-10 py-5 text-[11px] tracking-[0.2em] uppercase transition-colors duration-500"
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-500">TERMINATE SESSION</span>
          <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
        </button>
      </div>
    </div>
  );
}
