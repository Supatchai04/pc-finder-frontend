import {
  Check,
  CircuitBoard,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Search,
  Zap,
} from 'lucide-react';


const fallbackCategories = [
  {
    value: 'CPU',
    label: 'CPU',
  },
  {
    value: 'MAINBOARD',
    label: 'Mainboard',
  },
  {
    value: 'VGA',
    label: 'VGA Card',
  },
  {
    value: 'RAM',
    label: 'Memory',
  },
  {
    value: 'STORAGE',
    label: 'Storage',
  },
  {
    value: 'PSU',
    label: 'Power Supply',
  },
];


const categoryIcons = {
  CPU: Cpu,
  MAINBOARD: CircuitBoard,
  VGA: Monitor,
  RAM: MemoryStick,
  STORAGE: HardDrive,
  PSU: Zap,
};


export default function HardwareSidebar({
  active,
  selected = {},
  categories = fallbackCategories,
  onSelect,
  onCompare,
}) {
  const categoryList = (
    Array.isArray(categories) && categories.length
      ? categories
      : fallbackCategories
  ).filter((item) =>
    String(item?.value || item?.key || '').trim().toUpperCase() !== 'COOLER'
  );


  const totalSelected =
    Object.values(selected).reduce(
      (total, value) => {
        if (Array.isArray(value)) {
          return total + value.length;
        }

        return total + (value ? 1 : 0);
      },
      0
    );


  return (
    <aside className="hardware-selector-panel">

      <div className="hardware-selector-card">

        <div className="hardware-selector-title">
          <strong>
            เลือกฮาร์ดแวร์ที่
            <br />
            ต้องการ
          </strong>
        </div>


        <div className="hardware-selector-menu">

          {categoryList.map(
            (item) => {
              const key =
                String(
                  item.value ||
                  item.key ||
                  ''
                ).toUpperCase();


              const fallback =
                fallbackCategories.find(
                  (category) =>
                    category.value ===
                    key
                );


              const label =
                fallback?.label ||
                item.label ||
                key;


              const Icon =
                categoryIcons[key] ||
                CircuitBoard;


              const selectedValue =
                selected[key];


              const count =
                Array.isArray(
                  selectedValue
                )
                  ? selectedValue.length
                  : selectedValue
                    ? 1
                    : 0;


              const isActive =
                active === key;


              return (
                <button
                  key={key}
                  type="button"
                  className={
                    `hardware-selector-item ${
                      isActive
                        ? 'active'
                        : ''
                    }`
                  }
                  onClick={() =>
                    onSelect?.(key)
                  }
                >

                  <span className="hardware-selector-icon">
                    <Icon size={20} />
                  </span>


                  <span className="hardware-selector-label">
                    {label}
                  </span>


                  {count > 0 && (
                    <span className="hardware-selector-status">

                      <span className="hardware-selector-count">
                        {count}
                      </span>


                      {isActive && (
                        <span className="hardware-selector-check">
                          <Check size={13} />
                        </span>
                      )}

                    </span>
                  )}

                </button>
              );
            }
          )}

        </div>


        {onCompare && (
          <button
            type="button"
            className="hardware-selector-search"
            disabled={
              totalSelected === 0
            }
            onClick={onCompare}
          >
            <Search size={18} />

            ค้นหาร้านค้า

            {totalSelected > 0 && (
              <span>
                ({totalSelected})
              </span>
            )}
          </button>
        )}

      </div>

    </aside>
  );
}