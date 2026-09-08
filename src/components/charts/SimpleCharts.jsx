export function MiniLine({ values = [] }) {
  if (!values.length) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const points = values.map((v, i) => {
    const x = 5 + (i * 90) / Math.max(values.length - 1, 1);
    const y = 31 - ((v - min) / Math.max(max - min, 1)) * 22;
    return `${x},${y}`;
  }).join(' ');
  return <svg viewBox="0 0 100 36" className="mini-chart" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Donut({ values = [30, 22, 18, 15, 9, 6], center = '78,620' }) {
  const total = values.reduce((a, b) => a + b, 0);
  let offset = 25;
  const segments = values.map((v, i) => {
    const dash = `${(v / total) * 100} ${100 - (v / total) * 100}`;
    const node = <circle key={i} cx="50" cy="50" r="35" fill="none" stroke={`var(--chart-${i + 1})`} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={offset} pathLength="100" />;
    offset -= (v / total) * 100;
    return node;
  });
  return <div className="donut-wrap"><svg viewBox="0 0 100 100" className="donut-chart">{segments}</svg><div className="donut-center"><strong>{center}</strong><span>รายการ</span></div></div>;
}

export function HorizontalBars({ labels, values }) {
  const max = Math.max(...values);
  return <div className="bar-chart">{values.map((v, i) => <div className="bar-row" key={labels[i]}><span>{labels[i]}</span><div className="bar-track"><div className={`bar-fill bar-${(i % 6) + 1}`} style={{ width: `${(v / max) * 100}%` }} /></div><strong>{v.toLocaleString()}</strong></div>)}</div>;
}
