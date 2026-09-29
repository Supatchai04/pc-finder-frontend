import {
  Bookmark,
  Boxes,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import LoadingState from '../../components/ui/LoadingState';

import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';


export default function ShopDashboardPage() {
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


  useEffect(() => {
    shopService
      .dashboard()
      .then((response) => {
        setData(
          response.data ||
          null
        );
      })
      .catch((err) => {
        setError(
          getApiErrorMessage(
            err,
            'โหลด Dashboard ไม่สำเร็จ'
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  if (loading) {
    return (
      <LoadingState
        label="กำลังโหลด Dashboard ร้านค้า..."
      />
    );
  }


  const info =
    data?.storeInfo ||
    {};

  const overview =
    data?.overview ||
    {};

  const most =
    data?.mostInterestedHardware ||
    {};

  const missing =
    Array.isArray(
      data?.missingSavedItems
    )
      ? data.missingSavedItems
      : [];


  return (
    <div className="shop-dashboard-page">

      <PageHeader
        title={`ยินดีต้อนรับ, ${
          info.shopName ||
          'ร้านค้าของคุณ'
        } 👋`}
        subtitle={
          info.fullAddress ||
          'ภาพรวมข้อมูลร้านค้าของคุณ'
        }
      />


      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}


      {/* ================================================
          STATISTICS
          ================================================ */}

      <div className="stats-grid shop-stats-grid">

        <StatCard
          icon={Boxes}
          label="สินค้าทั้งหมดในร้าน"
          value={
            overview.allGoodsInStore ??
            0
          }
          tone="blue"
        />


        <StatCard
          icon={Bookmark}
          label="ยอดบันทึก / ไลก์ที่ได้รับ"
          value={
            overview.likeReceivedCount ??
            0
          }
          tone="green"
        />

      </div>


      {/* ================================================
          DASHBOARD CONTENT
          ================================================ */}

      <div className="dashboard-grid shop-dashboard-grid">

        {/* ===============================
            MOST INTERESTED
            =============================== */}

        <SectionCard title="สินค้าที่ลูกค้าสนใจมากที่สุด">

          <div className="compact-table shop-interest-table">

            <table>

              <thead>
                <tr>
                  <th>
                    หมวด
                  </th>

                  <th>
                    สินค้า
                  </th>

                  <th>
                    จำนวนการค้นหา
                  </th>
                </tr>
              </thead>


              <tbody>

                {Object.entries(
                  most
                ).map(
                  ([
                    category,
                    item,
                  ]) => (
                    <tr
                      key={
                        category
                      }
                    >

                      <td>
                        <span className="shop-category-badge">
                          {category}
                        </span>
                      </td>


                      <td className="shop-product-name">
                        {item?.hardwareName ||
                          '-'}
                      </td>


                      <td>
                        <strong className="shop-search-count">
                          {item?.searchCount ??
                            0}
                        </strong>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>


            {!Object.keys(
              most
            ).length && (
              <div className="empty-inline">
                ยังไม่มีข้อมูลความสนใจ
              </div>
            )}

          </div>

        </SectionCard>


        {/* ===============================
            GAP ANALYSIS
            =============================== */}

        <SectionCard title="Gap Analysis — ลูกค้าต้องการแต่ร้านยังไม่มี">

          <div className="gap-list shop-gap-list">

            {missing.map(
              (item) => (
                <div
                  key={
                    item.masterId
                  }
                >

                  <span>

                    <strong>
                      {item.hardwareName ||
                        item.displayName ||
                        '-'}
                    </strong>


                    <small>
                      {item.savedCount ||
                        0}{' '}
                      คนบันทึกไว้
                    </small>

                  </span>


                  {/* 
                    ส่ง masterId ไปหน้า ShopProductsPage

                    ตัวอย่าง:
                    masterId = 12

                    หน้า ShopProductsPage จะนำเลข 12
                    ไปเรียก:

                    GET /api/hardware/12/detail
                  */}

                  <Link
                    to="/shop/products"
                    state={{
                      openAddProduct: true,
                      masterId:
                        item.masterId,
                    }}
                  >
                    เพิ่มสินค้า
                  </Link>

                </div>
              )
            )}


            {!missing.length && (
              <div className="empty-inline">
                ยังไม่มี Gap ที่ต้องจัดการ
              </div>
            )}

          </div>

        </SectionCard>

      </div>

    </div>
  );
}