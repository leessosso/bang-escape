import type { ReactNode } from 'react';

interface StageHeaderProps {
  badge: string;
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
}

export default function StageHeader({ badge, icon, title, subtitle }: StageHeaderProps) {
  return (
    <div className="text-center space-y-1">
      <p className="text-xs tracking-[0.4em] text-green-600">{badge}</p>
      <h2 className="text-3xl font-bold tracking-[0.25em] text-glow flex items-center gap-3 justify-center">
        {icon}
        {title}
      </h2>
      {subtitle && (
        <p className="text-green-600 text-sm tracking-widest">{subtitle}</p>
      )}
    </div>
  );
}
