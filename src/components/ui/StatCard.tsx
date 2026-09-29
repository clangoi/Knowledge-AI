import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="stat">
      <div className="stat__icon">
        <Icon size={18} />
      </div>
      <div>
        <p className="stat__label">{label}</p>
        <p className="stat__value">{value}</p>
        {hint && <p className="stat__hint">{hint}</p>}
      </div>
    </div>
  );
}
