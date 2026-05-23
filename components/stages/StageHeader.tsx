import type { ReactNode } from 'react';

const headerIconClass =
  'inline-flex shrink-0 items-center text-green-400 [&_svg]:size-7';

interface StageHeaderProps {
  badge: string;
  icon: ReactNode;
  trailingIcon: ReactNode;
  title: string;
  subtitle?: ReactNode;
}

export default function StageHeader({
  badge,
  icon,
  trailingIcon,
  title,
  subtitle,
}: StageHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <p className="tablet-label text-green-500">{badge}</p>
      <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-[0.2em] text-glow flex items-center gap-3 justify-center">
        <span className={headerIconClass} aria-hidden>
          {icon}
        </span>
        {title}
        <span className={headerIconClass} aria-hidden>
          {trailingIcon}
        </span>
      </h2>
      {subtitle && (
        <p className="text-green-500 tablet-fine-text">{subtitle}</p>
      )}
    </div>
  );
}
