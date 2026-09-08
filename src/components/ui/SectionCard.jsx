export default function SectionCard({ title = '', action = null, children = null, className = '' }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || action) && <div className="section-card-header"><h3>{title}</h3>{action}</div>}
      {children}
    </section>
  );
}
