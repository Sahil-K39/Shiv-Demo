import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shiv Shakti Project | NGO",
  description: "Information about our NGO initiatives and community work.",
};

export default function NGOPage() {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-[1000px] px-6 py-24 md:px-10 md:py-32">
        <p className="mb-5 text-[12px] uppercase tracking-[0.28em] text-gray-500">
          Shiv Shakti NGO
        </p>
        <h1 className="text-[40px] font-light uppercase leading-tight md:text-[68px]">
          Empowering communities through sustainable initiatives.
        </h1>
        <div className="mt-10 grid gap-8 border-t border-black/10 pt-10 text-[16px] uppercase leading-loose tracking-[0.12em] text-gray-600 md:grid-cols-2">
          <p>
            This page is currently under construction. More information about our non-profit initiatives, 
            community programs, and sustainability efforts will be available here soon.
          </p>
          <p>
            For any urgent inquiries regarding our NGO activities, please contact our support team.
          </p>
        </div>
      </section>
    </main>
  );
}
