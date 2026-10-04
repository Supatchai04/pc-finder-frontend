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


  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="summary-page-wrap">

      {/* =========================================
          TOOLBAR
          ========================================= */}

      <div className="summary-toolbar print-hide">

        <button
          type="button"
          className="outline-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft
            size={16}
          />

          กลับ

        </button>


        {!error && (
          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              window.print()
            }
          >

            <Printer
              size={16}
            />

            พิมพ์ / บันทึก PDF

          </button>
        )}

      </div>


      {/* =========================================
          SUMMARY SHEET
          ========================================= */}

      <div className="summary-sheet">

        <Brand />


        <h1>
          สรุปรายการสินค้า
        </h1>


        <p>
          เอกสารสรุปรายการสินค้าที่เลือกจาก PC FINDER
        </p>


        {error ? (

          <div className="empty-inline">
            {error}
          </div>

        ) : (

          <>

            <table>

              <thead>

                <tr>

                  <th>
                    หมวด
                  </th>

                  <th>
                    ชื่อสินค้า
                  </th>

                  <th>
                    ราคา
                  </th>

                  <th>
                    ชื่อร้านค้า
                  </th>

                  <th>
                    ที่อยู่ร้านค้า
                  </th>

                </tr>

              </thead>


              <tbody>

                {rows.map(
                  (item) => (
                    <tr
                      key={
                        item.shopProductId
                      }
                    >

                      {/* CATEGORY */}

                      <td>
                        {item.category ||
                          '-'}
                      </td>


                      {/* PRODUCT NAME */}

                      <td>
                        {item.displayName ||
                          item.hardwareName ||
                          '-'}
                      </td>


                      {/* PRICE */}

                      <td>
                        {Number(
                          item.price ||
                          item.unitPrice ||
                          0
                        ).toLocaleString()}
                        .-
                      </td>


                      {/* STORE */}

                      <td>
                        {item.shop
                          ?.shopName ||
                          '-'}
                      </td>


                      {/* FULL ADDRESS */}

                      <td>
                        {buildFullAddress(
                          item.shop
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>


            {/* =====================================
                TOTAL
                ===================================== */}

            <div className="summary-total">

              <span>
                รวมทั้งหมด
              </span>


              <strong>
                {Number(
                  total || 0
                ).toLocaleString()}
                .-
              </strong>

            </div>


            <div className="summary-meta">

              ทั้งหมด{' '}
              {data?.summary
                ?.totalItems ??
                rows.length}{' '}
              รายการ

            </div>

          </>

        )}

      </div>

    </div>
  );
}