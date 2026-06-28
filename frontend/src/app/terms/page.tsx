import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shiv Shakti Project",
  description: "Terms for using Shiv Shakti wholesale enquiry and product catalogue services.",
};

export default function TermsPage() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-[1000px] px-6 py-24 md:px-10 md:py-32">
        <p className="mb-5 text-[12px] uppercase tracking-[0.28em] text-gray-500">
          Terms of Service
        </p>
        <h1 className="text-[40px] font-light uppercase leading-tight md:text-[68px]">
          Website enquiries are not payment confirmation.
        </h1>
        <div className="mt-10 grid gap-8 border-t border-black/10 pt-10 text-[16px] uppercase leading-loose tracking-[0.12em] text-gray-600 md:grid-cols-2">
          <p>
            Product and fabric submissions are enquiry requests. Pricing, stock, payment method, and
            delivery terms are confirmed by email before order processing.
          </p>
          <p>
            Payments should only be made using instructions sent from the official Shiv Shakti
            support email after your enquiry is reviewed.
          </p>
        </div>
      </section>
    </main>
  );
}
