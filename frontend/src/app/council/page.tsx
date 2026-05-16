

export default function Council() {
  return (
    <div className="w-full bg-white min-h-[80vh] flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-10 py-20 flex flex-col items-center border-b border-black">
        <h1 className="animate-soft-reveal text-[40px] md:text-[80px] font-light text-black uppercase tracking-[0.16em] mb-6">
          THE COUNCIL
        </h1>
        <p className="animate-soft-reveal text-[14px] text-gray-500 uppercase tracking-[0.1em] text-center max-w-2xl leading-relaxed" style={{ animationDelay: "90ms" }}>
          The inner sanctum. Only those with the required clearance may access the encrypted transmissions and early drops. Log in to establish connection.
        </p>
      </div>
      
      <div className="w-full max-w-[1200px] px-10 py-20 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="text-[12px] uppercase tracking-[0.2em] text-gray-400 mb-8">
          AWAITING TRANSMISSION...
        </span>
        <div className="w-10 h-10 border border-black/20 border-t-black animate-spin"></div>
      </div>
    </div>
  );
}
