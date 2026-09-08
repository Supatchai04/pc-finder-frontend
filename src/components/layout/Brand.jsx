import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand({ compact = false }) {
  return (
    <Link to="/" className={`brand ${compact ? 'compact' : ''}`}>
      <span className="brand-mark"><Search size={18} /></span>
      <span>PC FINDER</span>
    </Link>
  );
}
