import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationBar({ page = 1, pages = 1, onChange = () => {} }) {
  const total = Math.max(1, Number(pages) || 1);
  const current = Math.min(total, Math.max(1, Number(page) || 1));
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  const list = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const go = (next) => {
    if (next >= 1 && next <= total && next !== current) onChange(next);
  };

  return (
    <div className="pagination-bar" aria-label="Pagination">
      <button type="button" disabled={current <= 1} onClick={() => go(current - 1)} aria-label="หน้าก่อนหน้า"><ChevronLeft size={16} /></button>
      {start > 1 && <><button type="button" onClick={() => go(1)}>1</button>{start > 2 && <span>…</span>}</>}
      {list.map((n) => <button type="button" key={n} className={current === n ? 'active' : ''} onClick={() => go(n)} aria-current={current === n ? 'page' : undefined}>{n}</button>)}
      {end < total && <>{end < total - 1 && <span>…</span>}<button type="button" onClick={() => go(total)}>{total}</button></>}
      <button type="button" disabled={current >= total} onClick={() => go(current + 1)} aria-label="หน้าถัดไป"><ChevronRight size={16} /></button>
    </div>
  );
}
