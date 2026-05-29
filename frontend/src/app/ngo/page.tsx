import type { Metadata } from "next";
import Image from "next/image";

import Link from "next/link";
import NGOInterestForm from "@/components/ngo/NGOInterestForm";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Women Employment NGO — SHIV SHAKTI PROJECT",
  description:
    "Shiv Shakti Project NGO initiative for training women and connecting them to paid jobs in tailoring, quality, packing, studio, and digital operations.",
};

const pathways = [
  {
    title: "Training",
    body: "Skill-building in stitching, finishing, packaging, communication, and basic digital catalogue work.",
  },
  {
    title: "Paid Jobs",
    body: "Shortlisted women are matched with paid roles across production, fulfilment, quality, and studio support.",
  },
  {
    title: "Growth",
    body: "Experienced members can lead batches, mentor new workers, and move into higher responsibility roles.",
  },
];

const jobs = [
  "Tailoring and stitching",
  "Hand finishing and repair",
  "Quality checking",
  "Packing and dispatch",
  "Studio preparation",
  "Digital catalogue support",
];

export default function NGOPage() {
  return (
    <div className="bg-white text-black">
      <section className="relative flex min-h-[calc(100svh-80px)] items-end overflow-hidden border-b border-black">
        <Image
          src="/assets/images/20-153A1078.jpg"
          alt="Woman wearing Shiv Shakti garment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 w-full px-6 pb-14 pt-28 md:px-10 md:pb-20">
          <div className="max-w-[1100px] animate-soft-reveal">
            <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-white/70">
              Shiv Shakti NGO Initiative
            </p>
            <h1 className="max-w-[980px] text-[44px] font-light uppercase leading-[0.95] text-white md:text-[84px] lg:text-[104px]">
              Women Employment Program
            </h1>
            <p className="mt-8 max-w-2xl text-[14px] uppercase leading-loose tracking-[0.12em] text-white/75">
              We train women, provide paid work opportunities, and help them build stable income through production, studio, fulfilment, and digital support roles.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#apply"
                className="group relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden border border-white px-8 text-[11px] uppercase tracking-[0.18em] text-white"
              >
                <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
                  Apply For Work
                </span>
                <ArrowRightIcon className="relative z-10 h-4 w-4 transition-colors duration-500 group-hover:text-black" />
                <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              </Link>
              <Link
                href="#jobs"
                className="inline-flex min-h-[54px] items-center justify-center border border-white/35 px-8 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
              >
                View Job Areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid border-b border-black md:grid-cols-3">
        {[
          ["Training First", "Practical skill sessions before placement.", "/assets/images/25-153A1093.jpg"],
          ["Paid Roles", "Work mapped to skill, location, and availability.", "/assets/images/55-153A0055.jpg"],
          ["Women Led", "Mentorship from women already in the program.", "/assets/images/95-153A0198.jpg"],
        ].map(([title, body, src]) => (
          <div key={title} className="border-b border-black/10 p-6 md:border-b-0 md:border-r md:p-10 last:md:border-r-0">
            <div className="relative mb-6 h-48 w-full overflow-hidden">
              <Image
                src={src}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{title}</p>
            <p className="mt-4 text-[18px] font-light leading-relaxed text-black">{body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-28">
        <div className="animate-soft-reveal">
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-gray-500">
            How It Works
          </p>
          <h2 className="text-[36px] font-light uppercase leading-tight text-black md:text-[56px]">
            From Training To Income
          </h2>
        </div>

        <div className="divide-y divide-black/10 border-y border-black/10">
          {pathways.map((item, index) => (
            <div key={item.title} className="grid gap-4 py-8 md:grid-cols-[96px_1fr]">
              <span className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-[22px] font-light uppercase tracking-[0.08em] text-black">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[14px] leading-loose text-gray-600">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="jobs" className="border-y border-black bg-black px-6 py-20 text-white md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-white/50">
              Job Areas
            </p>
            <h2 className="text-[36px] font-light uppercase leading-tight md:text-[56px]">
              Work We Provide
            </h2>
            <p className="mt-6 max-w-xl text-[14px] uppercase leading-loose tracking-[0.12em] text-white/60">
              Roles are offered after a skill conversation and training review. Some women join part-time, others move into full-time production support.
            </p>
          </div>

          <div className="grid gap-px bg-white/20 sm:grid-cols-2">
            {jobs.map((job) => (
              <div key={job} className="flex min-h-[96px] items-center gap-4 bg-black p-5">
                <CheckIcon className="h-5 w-5 text-white" />
                <span className="text-[13px] uppercase tracking-[0.14em] text-white/85">
                  {job}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-28">
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-gray-500">
            For Women And Partners
          </p>
          <h2 className="text-[34px] font-light uppercase leading-tight text-black md:text-[52px]">
            Apply, Refer, Or Collaborate
          </h2>
          <p className="mt-6 max-w-xl text-[14px] leading-loose text-gray-600">
            Women looking for work can submit interest directly. Community partners, trainers, and NGOs can also refer candidates for upcoming batches.
          </p>
        </div>

        <NGOInterestForm />
      </section>
    </div>
  );
}
