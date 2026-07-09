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
      ? "h-[42px] w-[34px] sm:h-[46px] sm:w-[38px] md:h-[50px] md:w-[40px]"
      : variant === "footer"
        ? "h-[76px] w-[62px] md:h-[92px] md:w-[74px]"
        : "h-10 w-8";

  return (
    <Link
      href={href}
      aria-label="Shiv Shakti Project home"
      className={`group inline-flex shrink-0 items-center text-black ${className}`}
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
    </Link>
  );
}

