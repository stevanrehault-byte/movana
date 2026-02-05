import Image from "next/image";

function MapPinIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BikeIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#E8B86D" : "none"}
      stroke={filled ? "#E8B86D" : "#5E726E"}
      strokeWidth="1.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

interface RouteCardProps {
  image: string;
  badge: string;
  badgeColor: string;
  location: string;
  distance: string;
  duration: string;
  title: string;
  description: string;
  rating: number;
  operator: string;
}

export function RouteCard({
  image,
  badge,
  badgeColor,
  location,
  distance,
  duration,
  title,
  description,
  rating,
  operator,
}: RouteCardProps) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-3xl bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      style={{
        boxShadow: "0 4px 24px rgba(59,118,137,0.08)",
        border: "1px solid rgba(59,118,137,0.05)",
      }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(31,46,43,0.4), transparent)" }}
        />
        <span
          className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--secondary-text)" }}>
          <span className="flex items-center gap-1.5">
            <MapPinIcon /> {location}
          </span>
          <span className="flex items-center gap-1.5">
            <BikeIcon /> {distance}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon /> {duration}
          </span>
        </div>

        {/* Title & desc */}
        <div>
          <h3 className="font-outfit mb-2 text-xl font-semibold" style={{ color: "var(--dark)" }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--secondary-text)" }}>
            {description}
          </p>
        </div>

        {/* Powered by */}
        <p className="text-xs" style={{ color: "var(--secondary-text)" }}>
          Powered by{" "}
          <span className="font-semibold" style={{ color: "var(--teal-deep)" }}>
            {operator}
          </span>
        </p>

        {/* Rating & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < Math.floor(rating)} />
            ))}
            <span className="ml-1 text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
              {rating}
            </span>
          </div>
          <button
            className="rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all hover:bg-[var(--teal-deep)] hover:text-white"
            style={{ color: "var(--teal-deep)", borderColor: "var(--teal-deep)" }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
