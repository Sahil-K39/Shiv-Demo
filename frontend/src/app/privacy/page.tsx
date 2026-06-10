import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SHIV SHAKTI PROJECT",
  description: "Privacy policy for Shiv Shakti enquiry, account, and wholesale order data.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-[1000px] px-6 py-24 md:px-10 md:py-32">
        <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-gray-500">
          Privacy Policy
        </p>
        <h1 className="text-[40px] font-light uppercase leading-tight md:text-[68px]">
          We use enquiry details to respond and process requests.
        </h1>
        <div className="mt-10 grid gap-8 border-t border-black/10 pt-10 text-[13px] uppercase leading-loose tracking-[0.12em] text-gray-600 md:grid-cols-2">
          <p>
            Contact, fabric quote, account, shipping, and wholesale enquiry details are used to
            reply by email, confirm availability, and coordinate delivery.
          </p>
          <p>
            Payment details are not collected by the website. Payment instructions are shared only
            after review through the official support email.
          </p>
        </div>
      </section>
    </main>
  );
}
