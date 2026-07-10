

import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/components/ui/BrandLogo";
import LanguageSwitcherButton from "@/components/ui/LanguageSwitcherButton";
import { ArrowRightIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="relative mt-20 w-full overflow-hidden border-t border-black/10 bg-white px-6 py-16 text-black md:px-10">
      <Image
        src="/logos/logo4.webp"
        alt=""
        aria-hidden="true"
        width={760}
        height={560}
        loading="lazy"
        className="pointer-events-none absolute -bottom-20 -right-20 h-[420px] w-[560px] object-cover opacity-[0.06] md:h-[560px] md:w-[760px]"
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="space-y-6">
          <BrandLogo variant="footer" />
          <p className="max-w-[250px] text-[13px] uppercase leading-loose tracking-[0.2em] text-gray-500">
            Neo-primitive fashion for ritual silhouettes, structured layers, and limited seasonal releases.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black font-semibold uppercase mb-6">Collections</h4>
          <ul className="space-y-3 text-[11px] tracking-[0.1em] text-gray-600 uppercase">
            <li><Link href="/shop/shakti" className="hover:text-black transition-colors">Shakti</Link></li>
            <li><Link href="/shop/shiva" className="hover:text-black transition-colors">Shiva</Link></li>

            <li><Link href="/fabric-selling" className="hover:text-black transition-colors">Fabric Selling</Link></li>
            <li><Link href="/council" className="hover:text-black transition-colors">The Council</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black font-semibold uppercase mb-6">Information</h4>
          <ul className="space-y-3 text-[11px] tracking-[0.1em] text-gray-600 uppercase">
            <li><Link href="/shipping" className="hover:text-black transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
            <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[12px] tracking-[0.3em] text-black font-semibold uppercase mb-6">Transmission</h4>
          <p className="text-[12px] uppercase leading-loose tracking-[0.1em] text-gray-600">
            Join the Council for early access to drops, fabric lots, and wholesale updates.
          </p>
          <Link
            href="/contact"
            className="mt-4 flex min-h-[46px] items-center justify-between border border-black/20 px-4 text-[11px] uppercase tracking-[0.1em] text-gray-600 transition-colors hover:border-black hover:text-black"
          >
            Contact Support
            <span aria-hidden="true">
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </Link>
        </div>

      </div>

      <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <LanguageSwitcherButton variant="footer" />
          <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase text-center sm:text-left">
            © 2026 SHIV SHAKTI PROJECT. ALL RIGHTS RESERVED.
          </p>
        </div>
        <BrandLogo variant="mark" />
      </div>
    </footer>
  );
}
