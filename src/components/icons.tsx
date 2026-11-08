import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
});

export function WhatsAppIcon({ size = 18, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...rest}>
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.351-.643-.182-.066-.315-.099-.445.099-.133.197-.513.643-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.595-.985-.589-.525-.988-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.347.099-.115.131-.198.197-.33.066-.132.033-.247-.016-.346-.05-.099-.445-1.076-.61-1.474-.16-.386-.323-.334-.445-.34l-.379-.007a.729.729 0 0 0-.529.247c-.182.198-.694.677-.694 1.65 0 .974.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.473.204.842.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.479 1.336-.943.165-.464.165-.86.116-.943-.049-.083-.182-.133-.38-.232z" />
    </svg>
  );
}

export function TelegramIcon({ size = 18, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...rest}>
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, ...rest }: P) {
  return (
    <svg {...stroke(size, rest)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const ArrowRight = ({ size = 15, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
export const ArrowDown = ({ size = 16, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);
export const ChevronLeft = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const ChevronRight = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);
export const SearchIcon = ({ size = 18, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
export const ClockIcon = ({ size = 13, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
export const CalendarIcon = ({ size = 13, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
export const CheckIcon = ({ size = 16, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const XIcon = ({ size = 16, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const HomeIcon = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const ChatIcon = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.8A8.38 8.38 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
  </svg>
);
export const VideoIcon = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="m22 8-6 4 6 4z" />
  </svg>
);
export const InfoIcon = ({ size = 20, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
export const ShieldIcon = ({ size = 18, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const PinIcon = ({ size = 18, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const MailIcon = ({ size = 18, ...rest }: P) => (
  <svg {...stroke(size, rest)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);
