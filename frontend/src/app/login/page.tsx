"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useCartStore } from "@/store/cart";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const router = useRouter();
  const setUser = useCartStore((state) => state.setUser);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      setUser(res.user);
      router.push("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      const res = await authAPI.register({ email, password, name });
      setNotice(res.message);
      setTab("login");
      setPassword("");
      setName("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    setError("");
    setNotice("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col md:flex-row bg-white">
      <div className="hidden md:block w-1/2 h-full bg-black relative overflow-hidden border-r border-black">
        <Image
          src="/assets/images/10-153A0999.jpg"
          alt="Identity" 
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <h2 className="text-white text-[40px] font-light tracking-[0.2em] uppercase leading-tight mix-blend-difference">
            ESTABLISH<br/>CONNECTION
          </h2>
          <p className="text-white/40 text-[11px] tracking-[0.2em] uppercase mt-4">SECURE ENCRYPTED TRANSMISSION</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center p-10 md:p-20 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="relative flex mb-16 border-b border-black/10">
            <button 
              type="button"
              onClick={() => handleTabChange("login")} 
              className={`flex-1 py-4 text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 text-center ${tab === "login" ? "text-black" : "text-gray-400"}`}
            >
              AUTHORIZE
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange("register")} 
              className={`flex-1 py-4 text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 text-center ${tab === "register" ? "text-black" : "text-gray-400"}`}
            >
              CREATE IDENTITY
            </button>
            <div 
              className="absolute bottom-0 left-0 h-[2px] bg-black w-1/2 transition-transform duration-300"
              style={{ transform: tab === "register" ? "translateX(100%)" : "translateX(0%)" }}
            />
          </div>

          <div className="relative min-h-[390px]">
            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -24, filter: "blur(8px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-[28px] font-light tracking-[0.15em] uppercase mb-10 text-black">IDENTIFICATION</h1>
                  
                  {error && (
                    <p className="text-red-500 text-[11px] tracking-[0.1em] uppercase mb-6">{error}</p>
                  )}
                  {notice && (
                    <p className="text-emerald-700 text-[11px] tracking-[0.1em] uppercase mb-6">{notice}</p>
                  )}

                  <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="relative mt-6">
                      <input 
                        type="email" 
                        placeholder="EMAIL" 
                        className="w-full border-0 border-b border-black/20 bg-transparent py-4 px-0 text-[14px] text-black focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative mt-6">
                      <input 
                        type="password" 
                        placeholder="ACCESS CODE" 
                        className="w-full border-0 border-b border-black/20 bg-transparent py-4 px-0 text-[14px] text-black focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="relative overflow-hidden group w-full border border-black text-white bg-black px-10 py-5 text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 mt-8 disabled:opacity-50"
                    >
                      <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                        {isLoading ? "AUTHORIZING..." : "AUTHORIZE"}
                      </span>
                      <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 24, filter: "blur(8px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-[28px] font-light tracking-[0.15em] uppercase mb-10 text-black">NEW SUBJECT</h1>
                  
                  {error && (
                    <p className="text-red-500 text-[11px] tracking-[0.1em] uppercase mb-6">{error}</p>
                  )}
                  {notice && (
                    <p className="text-emerald-700 text-[11px] tracking-[0.1em] uppercase mb-6">{notice}</p>
                  )}

                  <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="relative mt-6">
                      <input 
                        type="text" 
                        placeholder="NAME / DESIGNATION" 
                        className="w-full border-0 border-b border-black/20 bg-transparent py-4 px-0 text-[14px] text-black focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="relative mt-6">
                      <input 
                        type="email" 
                        placeholder="EMAIL" 
                        className="w-full border-0 border-b border-black/20 bg-transparent py-4 px-0 text-[14px] text-black focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative mt-6">
                      <input 
                        type="password" 
                        placeholder="ACCESS CODE" 
                        className="w-full border-0 border-b border-black/20 bg-transparent py-4 px-0 text-[14px] text-black focus:border-black focus:ring-0 transition-colors placeholder:text-gray-400" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="relative overflow-hidden group w-full border border-black text-black bg-white px-10 py-5 text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 mt-8 disabled:opacity-50"
                    >
                      <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                        {isLoading ? "INITIALIZING..." : "INITIALIZE"}
                      </span>
                      <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
