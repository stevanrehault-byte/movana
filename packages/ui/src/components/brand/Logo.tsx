import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
}

const sizes = {
  sm: { icon: 28, text: 18 },
  md: { icon: 40, text: 24 },
  lg: { icon: 56, text: 32 },
  xl: { icon: 72, text: 40 },
};

export function Logo({ 
  className = '', 
  showText = true, 
  size = 'md',
  variant = 'default' 
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];
  
  // Colors based on variant
  const gradientId = `logo-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const textColor = variant === 'white' 
    ? '#FFFFFF' 
    : variant === 'dark' 
      ? '#1F2E2B' 
      : undefined; // Use gradient for default

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Icon - Pin with Bird */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3B7689" />
            <stop offset="50%" stopColor="#68B59B" />
            <stop offset="100%" stopColor="#92D99E" />
          </linearGradient>
        </defs>
        
        {/* Pin Shape */}
        <path
          d="M50 5C28 5 10 23 10 45C10 67 50 95 50 95C50 95 90 67 90 45C90 23 72 5 50 5Z"
          fill={`url(#${gradientId})`}
        />
        
        {/* Bird/Flamingo silhouette inside */}
        <path
          d="M55 25C55 25 45 30 40 40C35 50 38 60 45 65C45 65 42 55 48 48C54 41 58 38 60 42C62 46 55 52 52 55C49 58 50 62 50 62"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Bird eye */}
        <circle cx="58" cy="35" r="3" fill="rgba(255,255,255,0.9)" />
        
        {/* Decorative leaf/wave elements */}
        <path
          d="M30 50C35 45 40 48 40 55C40 48 45 45 50 50"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 55C65 50 70 53 70 60C70 53 75 50 80 55"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <span 
          className="font-bold tracking-tight"
          style={{ 
            fontFamily: "'Outfit', sans-serif",
            fontSize: `${textSize}px`,
            ...(textColor 
              ? { color: textColor }
              : {
                  background: 'linear-gradient(135deg, #3B7689 0%, #68B59B 50%, #92D99E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
            ),
          }}
        >
          MOVANA
        </span>
      )}
    </div>
  );
}
