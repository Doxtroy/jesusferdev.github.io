import React from 'react';

// All icons use currentColor for easy theming; strokeLinecap/Join set for crisp retro look
// Size is controlled via width/height props; default to 20

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size?: number): React.SVGProps<SVGSVGElement> => ({
  width: size ?? 20,
  height: size ?? 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  shapeRendering: 'crispEdges' as any,
  vectorEffect: 'non-scaling-stroke' as any,
});

export const WifiIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <path d="M2 7c4-4 12-4 16 0" />
    <path d="M5 10c3-3 7-3 10 0" />
    <path d="M8 13c2-2 2-2 4 0" />
    <circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const BatteryIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <rect x="2" y="6" width="14" height="8" rx="1" />
    <rect x="4" y="8" width="8" height="4" fill="currentColor" stroke="none" />
    <rect x="16" y="8" width="2" height="4" />
  </svg>
);

export const MailIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <rect x="2" y="5" width="16" height="10" rx="1" />
    <path d="M3 6l7 5 7-5" />
  </svg>
);

export const MonitorIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <rect x="2" y="4" width="16" height="10" rx="1" />
    <path d="M8 16h4M7 14h6" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <rect x="3" y="4" width="14" height="10" rx="1" />
    <path d="M6 15l-2 3 4-3h6" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <circle cx="10" cy="10" r="7" />
    <path d="M3 10h14M10 3c2 2 2 12 0 14M10 3c-2 2-2 12 0 14" />
  </svg>
);

export const CaretRightIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <path d="M7 5l6 5-6 5z" fill="currentColor" stroke="none" />
  </svg>
);

export const CaretUpIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...baseProps(size)} {...rest} aria-hidden>
    <path d="M5 12l5-6 5 6z" fill="currentColor" stroke="none" />
  </svg>
);

export default { WifiIcon, BatteryIcon, MailIcon, MonitorIcon, ChatIcon, GlobeIcon, CaretRightIcon, CaretUpIcon };
