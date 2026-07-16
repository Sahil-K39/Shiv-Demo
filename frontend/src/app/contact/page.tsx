import type { Metadata } from "next";
import Link from "next/link";

import FabricQuoteForm from "@/components/fabric/FabricQuoteForm";

export const metadata: Metadata = {
  title: "Shiv Shakti Project",
  description:
    "Send wholesale and fabric enquiries to Shiv Shakti. Quotes, payment instructions, and delivery details are handled by email.",
};

export default function ContactPage() {
  return (
    <main className="bg-white text-black">
      <section className="border-b border-black px-6 pt-6 sm:pt-8 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-5 text-[12px] uppercase tracking-[0.28em] text-gray-500">
              Contact
            </p>
            <h1 className="max-w-2xl text-[42px] font-light uppercase leading-tight md:text-[72px]">
              Enquiries by email only.
            </h1>
            <p className="mt-8 max-w-xl text-[16px] uppercase leading-loose tracking-[0.12em] text-gray-500">
              Send your requirement and our team will reply with quote, payment instructions, and
              delivery details. The website does not collect payment.
            </p>
            <Link
              href="/fabric-selling"
              className="mt-8 inline-flex min-h-[48px] items-center justify-center border border-black px-6 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              View Fabric Selling
            </Link>
          </div>
          <FabricQuoteForm />
        </div>
      </section>
    </main>
  );
}
