/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Revelations
 * page.tsx — News, updates, and philosophical texts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export default function Revelations() {
  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full py-20 text-center border-b border-black">
        <h1 className="animate-soft-reveal text-[40px] md:text-[60px] font-light text-black uppercase tracking-[0.16em]">
          REVELATIONS
        </h1>
      </div>

      <div className="w-full max-w-[800px] mx-auto py-20 px-10 flex flex-col gap-16">
        <article className="animate-soft-reveal border-l border-black/20 pl-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">TRANSMISSION 001 — SS26</p>
          <h2 className="text-[24px] uppercase tracking-[0.1em] text-black mb-6">THE ARCHITECTURE OF SILENCE</h2>
          <p className="text-[14px] leading-[1.8] text-gray-600 mb-8">
            A conceptual exploration of form, void, and structure. The new collection strips away ornamentation to reveal the brutalist core of high-end avant-garde design. Garments are treated as mobile habitats for a fractured world.
          </p>
          <button className="text-[11px] uppercase tracking-[0.15em] text-black border-b border-black pb-1 hover:text-gray-500 transition-colors">
            READ ARCHIVE
          </button>
        </article>
      </div>
    </div>
  );
}
