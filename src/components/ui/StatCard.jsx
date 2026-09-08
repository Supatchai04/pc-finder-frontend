import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, tone = 'blue' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{Icon && <Icon size={19} />}</div>
      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        {trend && <small><ArrowUpRight size={13} /> {trend}</small>}
      </div>
    </div>
  );
}
