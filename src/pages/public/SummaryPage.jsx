import {
  ArrowLeft,
  Printer,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Brand from '../../components/layout/Brand';
import LoadingState from '../../components/ui/LoadingState';

import { hardwareService } from '../../services/hardwareService';

import { getApiErrorMessage } from '../../utils/api';
import { buildStorage } from '../../utils/buildStorage';


/* =========================================================
   ADDRESS
   ========================================================= */

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
};


const addPrefix = (
  value,
  prefix
) => {
  const text =
    cleanText(value);

  if (!text) {
    return '';
  }

  /*
   * ถ้า Backend ส่งคำว่า แขวง / เขต /
   * ตำบล / อำเภอ มาอยู่แล้ว
   * จะไม่เติมซ้ำ
   */
  if (
    text.startsWith(prefix)
  ) {
    return text;
  }

  return `${prefix}${text}`;
};


const buildFullAddress = (shop) => {
  if (!shop) {
    return '-';
  }


  const addressText =
    cleanText(
      shop.addressText ||
      shop.shopAddress
    );


  const subDistrict =
    cleanText(
      shop.subDistrict
    );


  const district =
    cleanText(
      shop.district
    );


  const province =
    cleanText(
      shop.province
    );


  const zipCode =
    cleanText(
      shop.zipCode
    );


  const isBangkok =
    province ===
    'กรุงเทพมหานคร';


  const parts = [];


  /*
   * บ้านเลขที่ / หมู่ / ซอย / ถนน
   */
  if (addressText) {
    parts.push(
      addressText
    );
  }


  /*
   * แขวง / ตำบล
   */
  if (
    subDistrict &&
    !addressText.includes(
      subDistrict
    )
  ) {
    parts.push(
      addPrefix(
        subDistrict,
        isBangkok
          ? 'แขวง'
          : 'ตำบล'
      )
    );
  }


  /*
   * เขต / อำเภอ
   */
  if (
    district &&
    !addressText.includes(
      district
    )
  ) {
    parts.push(
      addPrefix(
        district,
        isBangkok
          ? 'เขต'
          : 'อำเภอ'
      )
    );
  }


  /*
   * จังหวัด
   */
  if (
    province &&
    !addressText.includes(
      province
    )
  ) {
    parts.push(
      isBangkok
        ? province
        : addPrefix(
          province,
          'จังหวัด'
        )
    );
  }


  /*
   * รหัสไปรษณีย์
   */
  if (
    zipCode &&
    !addressText.includes(
      zipCode
    )
  ) {
    parts.push(
      zipCode
    );
  }


  return (
    parts
      .filter(Boolean)
      .join(' ') ||
    '-'
  );
};


/* =========================================================
   SUMMARY PAGE
   ========================================================= */

export default function SummaryPage() {
  const location =
    useLocation();

  const navigate =
    useNavigate();


  const shopProductIds =
    useMemo(
      () =>
        location.state
          ?.shopProductIds ||
        buildStorage
          .getSummaryProductIds(),
      [
        location.state,
      ]
    );


  const [
    data,
    setData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  /* =========================================================
     LOAD SUMMARY
     ========================================================= */

  useEffect(() => {
    if (
      !shopProductIds.length
    ) {
      setError(
        'ยังไม่มีรายการสินค้าให้สร้างใบสรุป'
      );

      setLoading(false);

      return;
    }


    buildStorage
      .setSummaryProductIds(
        shopProductIds
      );


    hardwareService
      .summary(
        shopProductIds
      )
      .then(
        (response) => {
          setData(
            response.data ||
            null
          );
        }
      )
      .catch(
        (err) => {
          setError(
            getApiErrorMessage(
              err,
              'สร้างใบสรุปไม่สำเร็จ'
            )
          );
        }
      )
      .finally(
        () => {
          setLoading(false);
        }
      );

  }, [
    shopProductIds,
  ]);


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="summary-sheet">

        <LoadingState
          label="กำลังสร้างใบสรุป..."
        />

      </div>
    );
  }


  /* =========================================================
     DATA
     ========================================================= */

  const rows =
    data?.items || [];


  const total =
    data?.summary
      ?.totalPrice ??
    rows.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.price ||
          item.unitPrice ||
          0
        ),
      0
    );


  const pages = [];
  for (let index = 0; index < rows.length; index += 9) {
    pages.push(rows.slice(index, index + 9));
  }
  if (!pages.length) pages.push([]);

  return (
    <div className="summary-page-wrap pcf-summary-pages">
      <style>{`
        .pcf-summary-pages { height: auto; max-height: none; overflow: visible; }
        .pcf-summary-pages .summary-sheet {
          height: auto; max-height: none; overflow: visible;
          box-sizing: border-box; margin: 24px auto;
        }
        .pcf-summary-pages table { width: 100%; table-layout: fixed; }
        .pcf-summary-pages th, .pcf-summary-pages td {
          white-space: normal; overflow-wrap: anywhere;
          vertical-align: top; height: auto; max-height: none;
        }
        .pcf-summary-pages .summary-page-footer {
          display: flex; justify-content: space-between; gap: 12px;
          margin-top: 22px; padding-top: 12px; border-top: 1px solid #dce2e8;
          color: #728297; font-size: 11px;
        }
        .pcf-summary-pages .summary-page-footer span { text-align: right; }
        @media (max-width: 600px) {
          .pcf-summary-pages .summary-sheet { width: calc(100% - 20px); padding: 16px 10px; }
          .pcf-summary-pages th, .pcf-summary-pages td { padding: 8px 4px; font-size: 11px; }
        }
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body, #root, .public-app {
            height: auto !important; min-height: 0 !important;
            max-height: none !important; overflow: visible !important;
          }
          .pcf-summary-pages {
            display: block !important; height: auto !important;
            min-height: 0 !important; max-height: none !important;
            overflow: visible !important; padding: 0 !important; background: white;
          }
          .pcf-summary-pages .summary-sheet {
            display: block; width: 100% !important; height: auto !important;
            min-height: 0 !important; max-height: none !important;
            overflow: visible !important; margin: 0 !important; padding: 0 !important;
            border: 0; box-shadow: none; break-inside: auto;
          }
          .pcf-summary-pages .summary-sheet + .summary-sheet {
            break-before: page; page-break-before: always;
          }
          .pcf-summary-pages table { overflow: visible !important; }
          .pcf-summary-pages thead { display: table-header-group; }
          .pcf-summary-pages tr { break-inside: avoid; page-break-inside: avoid; }
          .pcf-summary-pages th, .pcf-summary-pages td { padding: 3mm 2mm; font-size: 10pt; }
          .pcf-summary-pages .summary-total,
          .pcf-summary-pages .summary-page-footer { break-inside: avoid; page-break-inside: avoid; }
          .pcf-summary-pages .summary-toolbar { display: none !important; }
        }
      `}</style>
      <div className="summary-toolbar print-hide">
        <button type="button" className="outline-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> กลับ
        </button>
        {!error && (
          <button type="button" className="primary-btn" onClick={() => window.print()}>
            <Printer size={16} /> พิมพ์ / บันทึก PDF
          </button>
        )}
      </div>

      {error ? (
        <div className="summary-sheet"><Brand /><div className="empty-inline">{error}</div></div>
      ) : pages.map((pageRows, pageIndex) => (
        <section className="summary-sheet" key={pageIndex} aria-label={`สรุปรายการ หน้า ${pageIndex + 1}`}>
          <Brand />
          <h1>สรุปรายการสินค้า</h1>
          <p>เอกสารสรุปรายการสินค้าที่เลือกจาก PC FINDER</p>
          <table>
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '32%' }} />
            </colgroup>
            <thead>
              <tr><th scope="col">หมวด</th><th scope="col">ชื่อสินค้า</th><th scope="col">ราคา</th><th scope="col">ชื่อร้านค้า</th><th scope="col">ที่อยู่ร้านค้า</th></tr>
            </thead>
            <tbody>
              {pageRows.map((item, itemIndex) => (
                <tr key={item.shopProductId ?? `${pageIndex}-${itemIndex}`}>
                  <td>{item.category || '-'}</td>
                  <td>{item.displayName || item.hardwareName || '-'}</td>
                  <td>{Number(item.price || item.unitPrice || 0).toLocaleString()}.-</td>
                  <td>{item.shop?.shopName || '-'}</td>
                  <td>{buildFullAddress(item.shop)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageIndex === pages.length - 1 && (
            <div className="summary-total">
              <span>รวมทั้งหมด</span><strong>{Number(total || 0).toLocaleString()}.-</strong>
            </div>
          )}
          <div className="summary-page-footer">
            <div>หน้า {pageIndex + 1} / {pages.length}</div>
            <span>ทั้งหมด {data?.summary?.totalItems ?? rows.length} รายการ</span>
          </div>
        </section>
      ))}
    </div>
  );
}
