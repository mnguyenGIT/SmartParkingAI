const pathsMap = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  parking: <><path d="M6 21V5a2 2 0 0 1 2-2h5.5a5.5 5.5 0 0 1 0 11H6" /><path d="M9 7h4.5a1.5 1.5 0 0 1 0 3H9" /></>,
  car: <><path d="m5 11 1.7-5.1A2 2 0 0 1 8.6 4h6.8a2 2 0 0 1 1.9 1.4L19 11" /><path d="M3 12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5H3z" /><path d="M5 17v2M19 17v2" /><circle cx="7" cy="14" r=".8" /><circle cx="17" cy="14" r=".8" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  sparkles: <><path d="m12 3-1.1 3.3a4 4 0 0 1-2.5 2.5L5 10l3.4 1.1a4 4 0 0 1 2.5 2.5L12 17l1.1-3.4a4 4 0 0 1 2.5-2.5L19 10l-3.4-1.2a4 4 0 0 1-2.5-2.5z" /><path d="m19 16-.5 1.5L17 18l1.5.5L19 20l.5-1.5L21 18l-1.5-.5z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6a1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 3.5a2.52 2.52 0 0 1 3.5 3.5L12 17l-4 1 1-4Z" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v2" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l4-4h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2Z" /><path d="M12 15v-3a3 3 0 0 1 6 0v3M9 10h6" /></>,
  cancel: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
  eye: <><path d="M1 12s8-7 14-7 10 7 10 7-8 7-14 7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M1 12s8-7 14-7 10 7 10 7-8 7-14 7z" /><line x1="3" y1="3" x2="21" y2="21" /><circle cx="12" cy="12" r="3" /></>,
};


export default function Icon({ name, size = 20 }) {
  const svgPaths = pathsMap[name] || pathsMap.search;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {svgPaths}
    </svg>
  );
}
