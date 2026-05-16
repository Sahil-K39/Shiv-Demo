import Link from "next/link";
import { BrandMark } from "@/components/ui/Icons";

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

  return (
    <Link
      href={href}
      aria-label="Shiv Shakti Project home"
      className={`group inline-flex items-center gap-3 text-black ${className}`}
    >
      <span
        className={`grid place-items-center border border-black/15 bg-white transition-colors duration-300 group-hover:border-black ${
          isFooter ? "h-14 w-12" : "h-11 w-10"
        }`}
      >
        <BrandMark className={isFooter ? "h-10 w-8" : "h-8 w-7"} />
      </span>

      {!isMarkOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-light uppercase tracking-[0.08em] ${
              isFooter ? "text-[24px]" : "text-[18px] md:text-[20px]"
            }`}
          >
            Shiv Shakti
          </span>
          <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.28em] text-black/50">
            Project
          </span>
        </span>
      )}
    </Link>
  );
}
