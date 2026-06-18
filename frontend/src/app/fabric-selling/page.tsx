import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import FabricQuoteForm from "@/components/fabric/FabricQuoteForm";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Shiv Shakti Project",
  description:
    "Bulk fabric selling for studios, boutiques, designers, and production partners, including cotton, linen, silk blends, handloom textures, trims, dyeing, and sampling support.",
};

const fabrics = [
  {
    name: "Textured Cotton",
    image: "/final-products/go15/go15-01.png",
    use: "Daily wear, sampling, kurtas, relaxed dresses",
    moq: "MOQ 50 meters",
  },
  {
    name: "Linen Blend",
    image: "/final-products/go22/go22-01.png",
    use: "Summer sets, overlays, resort silhouettes",
    moq: "MOQ 50 meters",
  },
  {
    name: "Silk Touch",
    image: "/final-products/go01/go01-01.png",
    use: "Premium drapes, occasionwear, limited capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Handloom Surface",
    image: "/final-products/go44/go44-01.png",
    use: "Statement panels, artisan capsules, slow fashion",
    moq: "MOQ 50 meters",
  },
];

const services = [
  "Bulk meterage supply",
  "Sample swatch support",
  "Natural and custom dye lots",
  "Trims, lining, and finishing guidance",
  "Production partner sourcing",
  "Boutique and designer order support",
];

export default function FabricSellingPage() {
  return (
    <div className="bg-white text-black">
      <section className="relative flex min-h-[calc(100svh-80px)] items-end overflow-hidden border-b border-black">
        <Image
          src="/final-products/go22/go22-01.png"
          alt="Fabric textures for wholesale selling"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 w-full px-6 pb-14 pt-28 md:px-10 md:pb-20">
          <div className="max-w-[1120px] animate-soft-reveal">
            <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-white/70">
              Fabric supply / wholesale sourcing
            </p>
            <h1 className="max-w-[1040px] text-[44px] font-light uppercase leading-[0.95] text-white md:text-[84px] lg:text-[104px]">
              Fabric Selling
            </h1>
            <p className="mt-8 max-w-2xl text-[14px] uppercase leading-loose tracking-[0.12em] text-white/75">
              Bulk fabrics, swatches, dye lots, and production-ready material sourcing for boutiques,
              designers, studios, and small manufacturing partners.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#fabric-list"
                className="group relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden border border-white px-8 text-[11px] uppercase tracking-[0.18em] text-white"
              >
                <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
                  View Fabrics
                </span>
                <ArrowRightIcon className="relative z-10 h-4 w-4 transition-colors duration-500 group-hover:text-black" />
                <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              </Link>
              <Link
                href="#fabric-quote"
                className="inline-flex min-h-[54px] items-center justify-center border border-white/35 px-8 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
              >
                Request Fabric Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="fabric-list" className="grid border-b border-black md:grid-cols-4">
        {fabrics.map((fabric) => (
          <article
            key={fabric.name}
            className="border-b border-black/10 p-6 md:border-b-0 md:border-r md:p-8 last:md:border-r-0"
          >
            <div className="relative mb-6 aspect-square w-full overflow-hidden bg-neutral-100">
              <Image
                src={fabric.image}
                alt={fabric.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-top transition-transform duration-700 hover:scale-105"
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{fabric.moq}</p>
            <h2 className="mt-3 text-[20px] font-light uppercase tracking-[0.12em] text-black">
              {fabric.name}
            </h2>
            <p className="mt-4 text-[13px] uppercase leading-loose tracking-[0.1em] text-gray-500">
              {fabric.use}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-28">
        <div className="animate-soft-reveal">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-gray-500">
            Buying Support
          </p>
          <h2 className="text-[36px] font-light uppercase leading-tight text-black md:text-[56px]">
            Fabric Orders For Small And Bulk Production
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service} className="flex items-center gap-3 border border-black/10 p-5">
              <CheckIcon className="h-4 w-4 shrink-0" />
              <span className="text-[12px] uppercase tracking-[0.14em] text-gray-600">
                {service}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-black bg-black px-6 py-16 text-white md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-white/45">
              Quote Process
            </p>
            <h2 className="max-w-3xl text-[32px] font-light uppercase leading-tight md:text-[54px]">
              Send fabric type, meter requirement, color, and delivery city.
            </h2>
          </div>
          <Link
            href="#fabric-quote"
            className="inline-flex min-h-[54px] items-center justify-center border border-white px-8 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black"
          >
            Start Enquiry
          </Link>
        </div>
      </section>

      <section
        id="fabric-quote"
        className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:grid-cols-[0.75fr_1.25fr] md:px-10 md:py-28"
      >
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-gray-500">
            Email Quote Request
          </p>
          <h2 className="text-[34px] font-light uppercase leading-tight text-black md:text-[52px]">
            Minimum 50 units. Quote, payment, and delivery details by email.
          </h2>
          <p className="mt-6 max-w-md text-[13px] uppercase leading-loose tracking-[0.12em] text-gray-500">
            Share the fabric type, quantity, preferred color, and delivery city. We review the
            request and reply from support with the next steps.
          </p>
        </div>
        <FabricQuoteForm />
      </section>
    </div>
  );
}
