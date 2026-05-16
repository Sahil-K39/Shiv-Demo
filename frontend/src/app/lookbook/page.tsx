

import Image from "next/image";

export default function Lookbook() {
  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full py-20 text-center border-b border-black">
        <h1 className="animate-soft-reveal text-[40px] md:text-[60px] font-light text-black uppercase tracking-[0.16em]">
          VISIONS
        </h1>
      </div>

      <div className="w-full max-w-[1600px] px-10 py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] bg-black relative overflow-hidden group animate-soft-reveal">
          <Image
            src="/assets/images/lookbook-shakti-1.jpg" 
            alt="Look 1" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale opacity-90 transition-transform duration-[2000ms] group-hover:scale-105"
          />
        </div>
        <div className="aspect-[4/5] bg-black relative overflow-hidden group md:mt-20 animate-soft-reveal" style={{ animationDelay: "120ms" }}>
          <Image
            src="/assets/images/deconstructed-blazer.jpg" 
            alt="Look 2" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale opacity-90 transition-transform duration-[2000ms] group-hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
