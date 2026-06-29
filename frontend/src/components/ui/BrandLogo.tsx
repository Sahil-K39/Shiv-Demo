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
  const isFooter = variant === "footer";
  const isMarkOnly = variant === "mark";
  const logoSrc = isMarkOnly
    ? "/logos/mark-logo.png"
    : isFooter
      ? "/logos/footer-logo.png"
      : "/logos/nav-logo.png";

  return (
    <Link
      href={href}
      aria-label="Shiv Shakti Project home"
      className={`group inline-flex shrink-0 items-center text-black ${className}`}
    >
      <span
        className={`relative block shrink-0 overflow-hidden transition-opacity duration-300 group-hover:opacity-90 ${
          isMarkOnly
            ? "h-10 w-8"
            : isFooter
              ? "h-[132px] w-[150px] md:h-[160px] md:w-[178px]"
              : "h-[48px] w-[128px] sm:w-[146px] lg:h-[52px] lg:w-[164px] xl:w-[188px]"
        }`}
      >
        <Image
          src={logoSrc}
          alt={isMarkOnly ? "Shiv Shakti icon" : "Shiv Shakti Premium Wear"}
          fill
          priority={variant === "nav"}
          sizes={
            isMarkOnly
              ? "32px"
              : isFooter
                ? "(max-width: 768px) 150px, 178px"
                : "(max-width: 640px) 128px, (max-width: 1024px) 146px, 188px"
          }
          className="object-contain"
        />
        {variant === "nav" ? (
          <span
            aria-hidden="true"
            className="absolute left-[36%] right-0 top-[52%] flex h-[25%] items-center justify-center bg-white text-[7px] font-semibold uppercase tracking-[0.12em] text-black md:text-[8px]"
          >
            Premium Wear
          </span>
        ) : null}
      </span>
    </Link>
  );
}
