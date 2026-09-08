export default function StatusBadge({ status }) {
  const value = String(status || '').toUpperCase();
  let cls = 'status-neutral';
  if (['ACTIVE', 'OPEN', 'ปกติ', 'มีสินค้า'].includes(value)) cls = 'status-good';
  else if (['PENDING', 'LOW', 'รออนุมัติ', 'สต็อกต่ำ'].includes(value)) cls = 'status-warn';
  else if (['SUSPENDED', 'REJECTED', 'OUT', 'CLOSED', 'หมด', 'ระงับ'].includes(value)) cls = 'status-bad';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
