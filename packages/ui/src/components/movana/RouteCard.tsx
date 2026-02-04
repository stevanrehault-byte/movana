import { MapPin, Clock, Bike, Star, Mountain } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface RouteCardProps {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverUrl: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance: number; // in km
  duration: number; // in minutes
  elevation?: number; // in meters
  location: string;
  rating: number;
  reviewCount?: number;
  themes?: string[];
  operator: {
    name: string;
    logo?: string;
    slug: string;
  };
  className?: string;
  onView?: () => void;
}

const difficultyConfig = {
  easy: { label: 'Facile', color: '#68B59B', bg: 'rgba(104, 181, 155, 0.9)' },
  moderate: { label: 'Modéré', color: '#E8B86D', bg: 'rgba(232, 184, 109, 0.9)' },
  challenging: { label: 'Difficile', color: '#E07A5F', bg: 'rgba(224, 122, 95, 0.9)' },
  expert: { label: 'Expert', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.9)' },
};

const themeConfig: Record<string, { label: string; color: string }> = {
  scenic: { label: 'Paysages', color: '#3B7689' },
  cultural: { label: 'Culture', color: '#E8B86D' },
  beach: { label: 'Plage', color: '#68B59B' },
  mountain: { label: 'Montagne', color: '#8B5CF6' },
  food: { label: 'Gastronomie', color: '#E07A5F' },
  family: { label: 'Famille', color: '#68B59B' },
  adventure: { label: 'Aventure', color: '#E07A5F' },
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
}

export function RouteCard({
  id,
  slug,
  title,
  description,
  coverUrl,
  difficulty,
  distance,
  duration,
  elevation,
  location,
  rating,
  reviewCount,
  themes = [],
  operator,
  className,
  onView,
}: RouteCardProps) {
  const diffConfig = difficultyConfig[difficulty];

  return (
    <article
      className={cn(
        'group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer',
        className
      )}
      style={{
        boxShadow: '0 4px 24px rgba(59, 118, 137, 0.08)',
        border: '1px solid rgba(59, 118, 137, 0.05)',
      }}
      onClick={onView}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 118, 137, 0.16)';
        e.currentTarget.style.borderColor = 'rgba(104, 181, 155, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(59, 118, 137, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(59, 118, 137, 0.05)';
      }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(31, 46, 43, 0.4), transparent)',
          }}
        />
        
        {/* Difficulty Badge */}
        <span
          className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm text-white font-semibold"
          style={{ backgroundColor: diffConfig.bg }}
        >
          {diffConfig.label}
        </span>

        {/* Theme Badges */}
        {themes.length > 0 && (
          <div className="absolute top-4 right-4 flex gap-1">
            {themes.slice(0, 2).map((theme) => {
              const config = themeConfig[theme];
              if (!config) return null;
              return (
                <span
                  key={theme}
                  className="px-2 py-1 rounded-full text-xs backdrop-blur-sm text-white font-medium"
                  style={{ backgroundColor: `${config.color}CC` }}
                >
                  {config.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Meta Info */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: '#5E726E' }}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bike className="w-4 h-4" />
            <span>{distance} km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(duration)}</span>
          </div>
          {elevation && (
            <div className="flex items-center gap-1.5">
              <Mountain className="w-4 h-4" />
              <span>{elevation}m D+</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3
            className="mb-2 line-clamp-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: 600,
              color: '#1F2E2B',
            }}
          >
            {title}
          </h3>
          {description && (
            <p 
              className="text-sm leading-relaxed line-clamp-2" 
              style={{ color: '#5E726E' }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Rating & Operator */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  fill={i < Math.floor(rating) ? '#E8B86D' : 'none'}
                  stroke={i < Math.floor(rating) ? '#E8B86D' : '#5E726E'}
                  strokeWidth={1.5}
                />
              ))}
              <span className="ml-1 text-sm font-medium" style={{ color: '#5E726E' }}>
                {rating.toFixed(1)}
                {reviewCount !== undefined && (
                  <span className="font-normal"> ({reviewCount})</span>
                )}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            className="px-5 py-2 rounded-full text-sm transition-all font-semibold"
            style={{
              color: '#3B7689',
              border: '1.5px solid #3B7689',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3B7689';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#3B7689';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
          >
            Voir
          </button>
        </div>

        {/* Operator Badge */}
        <div 
          className="flex items-center gap-2 pt-2 border-t"
          style={{ borderColor: 'rgba(59, 118, 137, 0.1)' }}
        >
          {operator.logo ? (
            <img 
              src={operator.logo} 
              alt={operator.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#3B7689' }}
            >
              {operator.name.charAt(0)}
            </div>
          )}
          <span className="text-xs" style={{ color: '#5E726E' }}>
            Powered by <strong style={{ color: '#3B7689' }}>{operator.name}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}
