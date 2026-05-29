

import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/components/ui/BrandLogo";
import { ArrowRightIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="relative mt-20 w-full overflow-hidden border-t border-black/10 bg-white px-6 py-16 text-black md:px-10">
      <Image
        src="/logos/logo4.png"
        alt=""
        aria-hidden="true"
        width={760}
        height={560}
        loading="eager"
        className="pointer-events-none absolute -bottom-20 -right-20 h-[420px] w-[560px] object-cover opacity-[0.04] md:h-[560px] md:w-[760px]"
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="space-y-6">
          <BrandLogo variant="footer" />
          <p className="text-[11px] tracking-[0.2em] text-gray-500 uppercase leading-loose max-w-[250px]">
            Neo-primitive fashion for ritual silhouettes, structured layers, and limited seasonal releases.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black uppercase mb-6">Collections</h4>
          <ul className="space-y-3 text-[11px] tracking-[0.1em] text-gray-500 uppercase">
            <li><Link href="/shop/shakti" className="hover:text-black transition-colors">Shakti</Link></li>
            <li><Link href="/shop/shiva" className="hover:text-black transition-colors">Shiva</Link></li>

            <li><Link href="/fabric-selling" className="hover:text-black transition-colors">Fabric Selling</Link></li>
            <li><Link href="/council" className="hover:text-black transition-colors">The Council</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black uppercase mb-6">Information</h4>
          <ul className="space-y-3 text-[11px] tracking-[0.1em] text-gray-500 uppercase">
            <li><Link href="/ngo" className="hover:text-black transition-colors">Women Employment NGO</Link></li>
            <li><Link href="/shipping" className="hover:text-black transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
            <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black uppercase mb-6">Transmission</h4>
          <p className="text-[10px] tracking-[0.1em] text-gray-500 uppercase leading-loose">
            Join the Council for early access to drops, fabric lots, and wholesale updates.
          </p>
          <div className="flex mt-4 border border-black/20 focus-within:border-black transition-colors">
            <input 
              type="email" 
              placeholder="ENTER EMAIL" 
              className="bg-transparent text-[11px] tracking-[0.1em] text-black px-4 py-3 w-full outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              aria-label="Submit email"
              className="px-4 text-gray-500 transition-colors hover:text-black"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase text-center md:text-left">
          © 2026 SHIV SHAKTI PROJECT. ALL RIGHTS RESERVED.
        </p>
        <BrandLogo variant="mark" />
      </div>
    </footer>
  );
}
