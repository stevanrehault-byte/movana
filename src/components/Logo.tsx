export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="8"
            y1="8"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B7689" />
            <stop offset="50%" stopColor="#68B59B" />
            <stop offset="100%" stopColor="#92D99E" />
          </linearGradient>
        </defs>
        <path
          d="M20 4C12.268 4 6 10.268 6 18c0 9 14 18 14 18s14-9 14-18c0-7.732-6.268-14-14-14z"
          fill="url(#logo-gradient)"
        />
        <path
          d="M14 16c0 0 2-4 6-4s6 4 6 4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 20c0 0 1.5 3 4 3s4-3 4-3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="22" cy="14" r="2" fill="white" />
      </svg>
      <span className="font-outfit text-2xl font-bold tracking-tight text-gradient">
        MOVANA
      </span>
    </div>
  );
}
