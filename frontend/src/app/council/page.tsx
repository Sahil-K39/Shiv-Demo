
import Link from "next/link";

export default function Council() {
  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-10 py-20 flex flex-col items-center border-b border-black">
        <h1 className="animate-soft-reveal text-[40px] md:text-[80px] font-light text-black uppercase tracking-[0.16em] mb-6">
          THE COUNCIL
        </h1>
        <p className="animate-soft-reveal max-w-2xl text-center text-[16px] uppercase leading-relaxed tracking-[0.1em] text-gray-500" style={{ animationDelay: "90ms" }}>
          The inner sanctum. Only those with the required clearance may access the encrypted transmissions and early drops. Log in to establish connection.
        </p>
      </div>
      
      <div className="flex min-h-[40vh] w-full max-w-[1200px] flex-col items-center justify-center px-6 py-20 text-center md:px-10">
        <p className="max-w-xl text-[14px] uppercase leading-loose tracking-[0.14em] text-gray-500">
          Sign in to access Council updates, or contact support for wholesale and partnership
          enquiries.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-[50px] items-center justify-center bg-black px-8 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800"
          >
            Log In
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[50px] items-center justify-center border border-black px-8 text-[11px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
