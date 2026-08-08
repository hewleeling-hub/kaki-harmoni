import type { SVGProps } from "react";
import type { IconName } from "@/config/navigation";

/** Consistent outline icon set (Lucide-style: rounded 1.75 stroke, currentColor). */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="3" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </Base>
);
export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);
export const MapPinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
);
export const CoffeeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M8 3.5c-.6.7-.6 1.3 0 2M12 3.5c-.6.7-.6 1.3 0 2" />
  </Base>
);
export const UsersIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 20a5.5 5.5 0 0 0-3-4.9" />
  </Base>
);
export const HeartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7-4.4-9.2-8.6A4.9 4.9 0 0 1 12 6.1a4.9 4.9 0 0 1 9.2 5.3C19 15.6 12 20 12 20Z" />
  </Base>
);
export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
  </Base>
);
export const GiftIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
    <path d="M5 12.5V20h14v-7.5M12 8.5V20" />
    <path d="M12 8.5S10.5 4 8 4a2 2 0 0 0 0 4.5M12 8.5S13.5 4 16 4a2 2 0 0 1 0 4.5" />
  </Base>
);
export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Base>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Base>
);
export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12.5 10 17l9-10" />
  </Base>
);
export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 3.5 9 4l1 4-2 1.5a11 11 0 0 0 4.5 4.5L14 16l4 1 .5 2.5a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 7.7 2 2 0 0 1 6.5 3.5Z" />
  </Base>
);
export const MessageIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" />
    <path d="M8.5 10h7M8.5 12.5h4" />
  </Base>
);
export const InfoIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.6h.01" />
  </Base>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9.5 12 15l6-5.5" />
  </Base>
);
export const NavigationIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4 4 11l6.5 2.5L13 20 20 4Z" />
  </Base>
);
export const SparklesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3Z" />
    <path d="M18 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </Base>
);
export const ArmchairIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
    <path d="M4 12a2 2 0 0 1 2 2v2h12v-2a2 2 0 1 1 2 0v4H4v-4a2 2 0 0 1 0-4Z" />
    <path d="M6 20v1M18 20v1" />
  </Base>
);
export const WavesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 8c1.8 0 1.8-1.5 3.6-1.5S7.4 8 9.2 8 11 6.5 12.8 6.5 14.6 8 16.4 8s1.8-1.5 3.6-1.5" />
    <path d="M2 13c1.8 0 1.8-1.5 3.6-1.5S7.4 13 9.2 13s1.8-1.5 3.6-1.5S14.6 13 16.4 13s1.8-1.5 3.6-1.5" />
    <path d="M2 18c1.8 0 1.8-1.5 3.6-1.5S7.4 18 9.2 18s1.8-1.5 3.6-1.5S14.6 18 16.4 18s1.8-1.5 3.6-1.5" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Base>
);
export const DropletIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
  </Base>
);

export const NAV_ICONS: Record<IconName, (p: IconProps) => React.ReactElement> = {
  home: HomeIcon,
  info: InfoIcon,
  gift: GiftIcon,
  mappin: MapPinIcon,
  user: UserIcon,
  calendar: CalendarIcon,
  sparkles: SparklesIcon,
};
