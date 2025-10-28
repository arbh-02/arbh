export const AuthGraphic = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="max-w-sm"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.5" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="400" height="400" rx="20" fill="transparent" />
    <path
      d="M50 150 Q 150 50, 250 150 T 450 150"
      stroke="url(#grad1)"
      strokeWidth="2"
      fill="none"
      filter="url(#glow)"
    />
    <path
      d="M50 250 Q 150 350, 250 250 T 450 250"
      stroke="url(#grad1)"
      strokeWidth="2"
      fill="none"
      strokeDasharray="5,5"
    />
    <circle cx="100" cy="200" r="10" fill="hsl(var(--primary))" />
    <circle cx="200" cy="100" r="5" fill="hsl(var(--primary-glow))" />
    <circle cx="300" cy="300" r="8" fill="hsl(var(--primary))" />
    <rect x="150" y="280" width="100" height="10" rx="5" fill="hsl(var(--muted))" />
    <rect x="180" y="310" width="40" height="10" rx="5" fill="hsl(var(--muted))" />
  </svg>
);