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
    name: "Floral Mesh 001",
    image: "/fabric/fabric-001.jpg",
    use: "Statement overlays, resort panels, occasion capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Washed Jacquard 004",
    image: "/fabric/fabric-004.jpg",
    use: "Soft tailoring, resort layers, tonal coordinates",
    moq: "MOQ 50 meters",
  },
  {
    name: "Lace Surface 006",
    image: "/fabric/fabric-006.jpg",
    use: "Premium dresses, bridal separates, delicate panels",
    moq: "MOQ 50 meters",
  },
  {
    name: "Embroidered Net 007",
    image: "/fabric/fabric-007.jpg",
    use: "Occasionwear, overlays, soft statement capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Open Weave 008",
    image: "/fabric/fabric-008.jpg",
    use: "Layering pieces, breathable panels, craft textures",
    moq: "MOQ 50 meters",
  },
  {
    name: "Dobby Texture 009",
    image: "/fabric/fabric-009.jpg",
    use: "Casual sets, shirts, dresses, small batch uniforms",
    moq: "MOQ 50 meters",
  },
  {
    name: "Printed Cotton 036",
    image: "/fabric/fabric-036.jpg",
    use: "Evening overlays, lace panels, statement trims",
    moq: "MOQ 50 meters",
  },
  {
    name: "Artisan Surface 038",
    image: "/fabric/fabric-038.jpg",
    use: "Layered silhouettes, panels, boutique capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Textured Overlay 040",
    image: "/fabric/fabric-040.jpg",
    use: "Statement overlays, resort panels, occasion capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Boutique Fabric 044",
    image: "/fabric/fabric-044.jpg",
    use: "Soft tailoring, resort layers, tonal coordinates",
    moq: "MOQ 50 meters",
  },
  {
    name: "Resort Weave 047",
    image: "/fabric/fabric-047.jpg",
    use: "Premium dresses, bridal separates, delicate panels",
    moq: "MOQ 50 meters",
  },
  {
    name: "Statement Textile 051",
    image: "/fabric/fabric-051.jpg",
    use: "Occasionwear, overlays, soft statement capsules",
    moq: "MOQ 50 meters",
  },
  {
    name: "Raw Handloom Linen 052",
    image: "/fabric/fabric-052.jpg",
    use: "Layering pieces, breathable panels, craft textures",
    moq: "MOQ 50 meters",
  },
  {
    name: "Silk Organza Blend 053",
    image: "/fabric/fabric-053.jpg",
    use: "Casual sets, shirts, dresses, small batch uniforms",
    moq: "MOQ 50 meters",
  },
  {
    name: "Ceremonial Brocade 057",
    image: "/fabric/fabric-057.jpg",
    use: "Evening overlays, lace panels, statement trims",
    moq: "MOQ 50 meters",
  },
  {
    name: "Deconstructed Canvas 062",
    image: "/fabric/fabric-062.jpg",
    use: "Layered silhouettes, panels, boutique capsules",
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
      <section className="relative min-h-[calc(100svh-80px)] w-full bg-white text-black border-b border-black/10 overflow-hidden px-6 py-10 md:px-10 lg:py-16 flex items-center">
        <div className="mx-auto w-full max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 flex flex-col items-start justify-center">
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.28em] text-black">
              FABRIC SUPPLY / WHOLESALE SOURCING
            </p>
            <h1 className="text-[40px] sm:text-[54px] md:text-[68px] font-normal uppercase leading-[0.95] text-black mb-8">
              FABRIC SELLING
            </h1>
            <p className="max-w-xl text-[14px] sm:text-[15px] uppercase leading-relaxed tracking-[0.12em] text-gray-800 mb-10">
              Bulk fabrics, swatches, dye lots, and production-ready material sourcing for boutiques, designers, studios, and small manufacturing partners.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
              <Link
                href="#fabric-list"
                className="inline-flex min-h-[54px] items-center justify-center gap-3 bg-black px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-gray-800 transition-colors"
              >
                <span>VIEW FABRICS</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="#fabric-quote"
                className="inline-flex min-h-[54px] items-center justify-center border border-black px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
              >
                REQUEST FABRIC QUOTE
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[14/10] w-full overflow-hidden bg-white">
            <Image
              src="/fabric/fabric-007.jpg"
              alt="Fabric textures for wholesale selling"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
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
            <p className="text-[12px] uppercase tracking-[0.22em] text-gray-500">{fabric.moq}</p>
            <h2 className="mt-3 text-[20px] font-light uppercase tracking-[0.12em] text-black">
              {fabric.name}
            </h2>
            <p className="mt-4 text-[14px] uppercase leading-loose tracking-[0.1em] text-gray-500">
              {fabric.use}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-28">
        <div className="animate-soft-reveal">
          <p className="mb-4 text-[12px] uppercase tracking-[0.24em] text-gray-500">
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
              <span className="text-[13px] uppercase tracking-[0.14em] text-gray-600">
                {service}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white px-6 py-16 text-black md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-[12px] uppercase tracking-[0.28em] text-gray-500 font-medium">
              Quote Process
            </p>
            <h2 className="max-w-3xl text-[32px] font-light uppercase leading-tight text-black md:text-[54px]">
              Send fabric type, meter requirement, color, and delivery city.
            </h2>
          </div>
          <Link
            href="#fabric-quote"
            className="inline-flex min-h-[54px] items-center justify-center border border-black px-8 text-[11px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white font-medium"
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
          <p className="mb-4 text-[12px] uppercase tracking-[0.24em] text-gray-500">
            Email Quote Request
          </p>
          <h2 className="text-[34px] font-light uppercase leading-tight text-black md:text-[52px]">
            Minimum 50 units. Quote, payment, and delivery details by email.
          </h2>
          <p className="mt-6 max-w-md text-[16px] uppercase leading-loose tracking-[0.12em] text-gray-500">
            Share the fabric type, quantity, preferred color, and delivery city. We review the
            request and reply from support with the next steps.
          </p>
        </div>
        <FabricQuoteForm />
      </section>
    </div>
  );
}
