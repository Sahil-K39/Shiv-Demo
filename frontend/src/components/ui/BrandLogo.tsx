import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  variant?: "nav" | "footer" | "mark";
  className?: string;
}

export default function BrandLogo({
  href = "/",
  variant = "nav",
  className = "",
}: BrandLogoProps) {
  const sizeClasses =
    variant === "nav"
      ? "h-[42px] w-[34px] sm:h-[48px] sm:w-[38px] md:h-[52px] md:w-[42px]"
      : variant === "footer"
        ? "h-[110px] w-[90px] md:h-[140px] md:w-[114px]"
        : "h-14 w-11 md:h-16 md:w-13";

  return (
    <Link
      href={href}
      aria-label="Shiv Shakti Project home"
      className={`group inline-flex shrink-0 items-center gap-2.5 text-black ${className}`}
    >
      <span
        className={`relative block shrink-0 overflow-hidden transition-opacity duration-300 group-hover:opacity-85 ${sizeClasses}`}
      >
        <Image
          src="/logos/mark-logo.webp"
          alt="Shiv Shakti Trident Mark"
          fill
          priority={variant === "nav"}
          sizes="(max-width: 640px) 42px, 74px"
          className="object-contain object-center brightness-0"
        />
      </span>
      {variant === "nav" && (
        <span className="font-serif text-[17px] sm:text-[21px] md:text-[24px] font-light tracking-[0.28em] text-black uppercase transition-opacity duration-300 group-hover:opacity-80">
          Shiv<span className="font-bold ml-1.5">Shakti</span>
        </span>
      )}
    </Link>
  );
}

