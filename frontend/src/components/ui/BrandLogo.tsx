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

  if (variant === "nav") {
    return (
      <Link
        href={href}
        aria-label="Shiv Shakti Project home"
        className={`group inline-flex shrink-0 items-center text-black ${className}`}
      >
        <span className="relative block h-[36px] w-[129px] shrink-0 overflow-hidden transition-opacity duration-300 group-hover:opacity-85 sm:h-[40px] sm:w-[143px] md:h-[52px] md:w-[186px] lg:h-[58px] lg:w-[207px] xl:h-[64px] xl:w-[228px]">
          <Image
            src="/logos/nav-logo.webp"
            alt="Shiv Shakti Premium Wear"
            fill
            priority
            sizes="(max-width: 640px) 129px, (max-width: 768px) 143px, (max-width: 1024px) 186px, (max-width: 1280px) 207px, 228px"
            className="object-contain object-left brightness-0"
          />
        </span>
      </Link>
    );
  }

  const logoSrc = isMarkOnly
    ? "/logos/mark-logo.webp"
    : "/logos/footer-logo.webp";

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
          sizes={
            isMarkOnly
              ? "32px"
              : "(max-width: 768px) 150px, 178px"
          }
          className="object-contain brightness-0"
        />
      </span>
    </Link>
  );
}
