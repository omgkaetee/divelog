export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Scuba tank body */}
      <rect
        x="12"
        y="8"
        width="16"
        height="26"
        rx="4"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Tank valve */}
      <rect
        x="16"
        y="4"
        width="8"
        height="6"
        rx="2"
        fill="currentColor"
      />
      {/* Tank bands */}
      <rect x="12" y="14" width="16" height="2" fill="currentColor" fillOpacity="0.5" />
      <rect x="12" y="28" width="16" height="2" fill="currentColor" fillOpacity="0.5" />
      {/* Bubbles */}
      <circle cx="32" cy="12" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="35" cy="8" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="34" cy="16" r="1" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}
