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
        <span className="relative flex h-[48px] w-[128px] shrink-0 items-center sm:w-[146px] lg:h-[52px] lg:w-[164px] xl:w-[188px]">
          <span className="relative h-10 w-[28px] shrink-0 md:h-11 md:w-[30px] lg:h-12 lg:w-8">
            <Image
              src="/logos/mark-logo.png"
              alt=""
              fill
              priority
              sizes="32px"
              className="object-contain transition-opacity duration-300 group-hover:opacity-85"
            />
          </span>

          <span className="ml-3 mr-2 h-7 w-px shrink-0 bg-black/42 md:mx-2 md:h-8 lg:h-9" />

          <span className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <span
              className="whitespace-nowrap text-[14px] font-semibold uppercase leading-none tracking-[0.04em] md:text-[15px] lg:text-[16px] xl:text-[18px]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Shiv Shakti
            </span>
            <span className="mt-1 flex w-full items-center justify-center gap-1 md:mt-1 md:gap-1">
              <span className="h-px w-2 bg-black/45 md:w-2 lg:w-3" />
              <span className="whitespace-nowrap text-[8px] font-semibold uppercase leading-none tracking-[0.08em] md:text-[8px] lg:text-[9px] xl:text-[10px]">
                Premium Wear
              </span>
              <span className="h-px w-2 bg-black/45 md:w-2 lg:w-3" />
            </span>
          </span>
        </span>
      </Link>
    );
  }

  const logoSrc = isMarkOnly
    ? "/logos/mark-logo.png"
    : "/logos/footer-logo.png";

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
          className="object-contain"
        />
      </span>
    </Link>
  );
}
