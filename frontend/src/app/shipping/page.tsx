import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shiv Shakti Project",
  description:
    "Shipping, delivery, and return handling for Shiv Shakti wholesale enquiries.",
};

export default function ShippingPage() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-[1000px] px-6 py-24 md:px-10 md:py-32">
        <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          Shipping & Returns
        </p>
        <h1 className="text-[40px] font-light uppercase leading-tight md:text-[68px]">
          Delivery details are confirmed after enquiry review.
        </h1>
        <div className="mt-10 grid gap-8 border-t border-black/10 pt-10 text-[15px] font-medium uppercase leading-[1.8] tracking-[0.08em] text-neutral-800 md:grid-cols-2 md:text-[16px]">
          <p>
            Wholesale and fabric orders are reviewed before payment. Our team shares shipping cost,
            dispatch timeline, and delivery method by email.
          </p>
          <p>
            Return or exchange eligibility depends on product type, quantity, customization, and
            dispatch status. Final terms are confirmed in the email quotation.
          </p>
        </div>
      </section>
    </main>
  );
}
