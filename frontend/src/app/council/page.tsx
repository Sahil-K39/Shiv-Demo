

export default function Council() {
  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-10 py-20 flex flex-col items-center border-b border-black">
        <h1 className="animate-soft-reveal text-[40px] md:text-[80px] font-light text-black uppercase tracking-[0.16em] mb-6">
          THE COUNCIL
        </h1>
        <p className="animate-soft-reveal max-w-2xl text-center text-[15px] font-medium uppercase leading-[1.8] tracking-[0.08em] text-neutral-800 md:text-[16px]" style={{ animationDelay: "90ms" }}>
          The inner sanctum. Only those with the required clearance may access the encrypted transmissions and early drops. Log in to establish connection.
        </p>
      </div>
      
      <div className="w-full max-w-[1200px] px-10 py-20 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="mb-8 text-[13px] font-medium uppercase tracking-[0.16em] text-neutral-700">
          AWAITING TRANSMISSION...
        </span>
        <div className="w-10 h-10 border border-black/20 border-t-black animate-spin"></div>
      </div>
    </div>
  );
}
