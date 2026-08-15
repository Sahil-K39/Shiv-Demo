import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Shiv Shakti Project | NGO — Women Empowering Women",
  description:
    "Our mission is simple yet profound: Women giving work to women. We empower local female artisans through high-fashion craftsmanship and fair employment.",
};

export default function NGOPage() {
  return (
    <main className="bg-white text-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-black">
        <Image
          src="/ngo/hero.jpg"
          alt="Indian female artisans working together in a minimalist studio"
          fill
          priority
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-14 lg:p-20 text-white">
          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] opacity-80 font-medium">
            The Shakti Initiative
          </p>
          <h1 className="max-w-4xl text-[32px] md:text-[56px] lg:text-[72px] font-light uppercase leading-[1.1] tracking-tight">
            Women Giving Work <br /> to Women
          </h1>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 md:px-10 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-5">
            <h2 className="text-[20px] md:text-[28px] font-light uppercase leading-snug tracking-wide">
              Empowerment translated through the language of avant-garde craftsmanship.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-8 text-[13px] md:text-[14px] uppercase leading-loose tracking-[0.14em] text-black/70">
            <p>
              At the core of the Shiv Shakti Project lies a profound commitment to the divine feminine energy—Shakti. 
              Our non-profit initiative is built on a singular, powerful philosophy: Women giving work to women.
            </p>
            <p>
              We provide fair employment, skill development, and a safe, creative sanctuary for local female artisans. 
              By mastering intricate weaving techniques and avant-garde pattern making, these women achieve financial 
              independence while breathing life into our post-apocalyptic silhouettes.
            </p>
            <p>
              Every garment created in our studio carries the strength, resilience, and collaborative spirit of the women 
              who crafted it. This is more than fashion; it is a movement of self-reliance.
            </p>
          </div>
        </div>
      </section>

      {/* Artisan Gallery Grid */}
      <section className="w-full px-4 md:px-10 lg:px-14 pb-24 md:pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Portrait 1 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 group">
            <Image
              src="/ngo/artisan-1.jpg"
              alt="Empowered female artisan looking confidently at the camera"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
          
          {/* Portrait 2 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 group md:mt-12">
            <Image
              src="/ngo/artisan-2.jpg"
              alt="Female hands intricately weaving dark textured fabric on a loom"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          {/* Portrait 3 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 group lg:mt-24">
            <Image
              src="/ngo/artisan-3.jpg"
              alt="Female pattern maker cutting black fabrics in a dimly lit studio"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#f5f5f5] px-6 py-24 md:px-10 md:py-32 lg:py-40 text-center">
        <div className="mx-auto max-w-2xl flex flex-col items-center">
          <p className="mb-6 text-[11px] uppercase tracking-[0.25em] text-gray-500 font-medium">
            Join the Movement
          </p>
          <h2 className="mb-10 text-[32px] md:text-[48px] font-light uppercase leading-tight tracking-tight">
            Support the Artisans
          </h2>
          <p className="mb-12 text-[13px] uppercase leading-loose tracking-[0.15em] text-gray-600 max-w-xl">
            Partner with us to provide sustainable livelihoods and skill training to women in need. Every contribution directly funds workshop expansions and artisan wages.
          </p>
          <Link
            href="/contact"
            className="group flex min-h-[56px] w-[240px] items-center justify-between border border-black bg-black px-6 text-[12px] uppercase tracking-[0.15em] text-white transition-all hover:bg-transparent hover:text-black"
          >
            <span>Inquire to Support</span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
