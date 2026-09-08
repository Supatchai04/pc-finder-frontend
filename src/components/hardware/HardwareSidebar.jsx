import { Cpu, CircuitBoard, MemoryStick, HardDrive, Zap, Box } from 'lucide-react';

const categories = [
  { key: 'CPU', label: 'CPU', icon: Cpu },
  { key: 'MAINBOARD', label: 'Mainboard', icon: CircuitBoard },
  { key: 'VGA', label: 'VGA Card', icon: Box },
  { key: 'RAM', label: 'Memory', icon: MemoryStick },
  { key: 'STORAGE', label: 'Storage', icon: HardDrive },
  { key: 'PSU', label: 'Power Supply', icon: Zap },
];

export default function HardwareSidebar({ active, selected = {}, onSelect }) {
  return (
    <aside className="hardware-sidebar">
      <div className="hardware-sidebar-title">เลือกฮาร์ดแวร์ที่ต้องการ</div>
      {categories.map(({ key, label, icon: Icon }) => {
        const count = Array.isArray(selected[key]) ? selected[key].length : (selected[key] ? 1 : 0);
        return (
          <button key={key} className={active === key ? 'active' : ''} onClick={() => onSelect(key)}>
            <Icon size={19} /><span>{label}</span>{count > 0 && <span className="selection-dot" title={`เลือกแล้ว ${count} รายการ`}>{count}</span>}
          </button>
        );
      })}
    </aside>
  );
}
