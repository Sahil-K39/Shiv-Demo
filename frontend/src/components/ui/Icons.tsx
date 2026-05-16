import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.3-3.7 3.6-5.5 7-5.5s5.7 1.8 7 5.5" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 8h10l1 12H6L7 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 12h12" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 6v12" />
      <path d="M6 12h12" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

export function BrandMark(props: IconProps) {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M14 3v26M14 3l-3.2 13.2L14 20l3.2-3.8L14 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 29c-4.9-1.9-8-5.8-8-11.3V9M14 29c4.9-1.9 8-5.8 8-11.3V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 9c0-2 1.5-3.7 3.4-4M22 9c0-2-1.5-3.7-3.4-4M10.8 31h6.4M12 34h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 8.5C2.5 4.9 5.4 2 9 2M25.5 8.5C25.5 4.9 22.6 2 19 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
