import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  MapPin,
  Phone,
  Search,
  Store,
  UserRound,
  XCircle,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  Modal,
} from 'react-bootstrap';

import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';

import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';


const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
    'th-TH',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );
};


const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    'th-TH'
  );
};


export default function AdminStoresPage() {
  const [rows, setRows] =
    useState([]);

  const [summary, setSummary] =
    useState({
      all: 0,
      pending: 0,
      approve: 0,
      rejected: 0,
    });

  const [meta, setMeta] =
    useState({
      page: 1,
      totalPages: 1,
      totalItems: 0,
    });

  const [search, setSearch] =
    useState('');

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('');

  const [status, setStatus] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /*
   * ==========================
   * STORE DETAIL MODAL
   * ==========================
   */

  const [
    selectedStore,
    setSelectedStore,
  ] = useState(null);

  const [detail, setDetail] =
    useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    detailError,
    setDetailError,
  ] = useState('');

  const [
    detailMessage,
    setDetailMessage,
  ] = useState('');

  const [
    nextStatus,
    setNextStatus,
  ] = useState('PENDING');

  const [
    savingStatus,
    setSavingStatus,
  ] = useState(false);


  /*
   * ==========================
   * LOAD STORE LIST
   * ==========================
   */

  const loadStores = async (
    page = 1,
    {
      silent = false,
    } = {}
  ) => {
    if (!silent) {
      setLoading(true);
    }

    setError('');

    try {
      const response =
        await adminService.stores({
          page,
          limit: 20,

          ...(appliedSearch
            ? {
                search:
                  appliedSearch,
              }
            : {}),

          ...(status
            ? { status }
            : {}),
        });


      const data =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];


      setRows(data);


      setSummary(
        response.summary || {
          all:
            response.meta
              ?.totalItems ||
            data.length,

          pending: 0,
          approve: 0,
          rejected: 0,
        }
      );


      setMeta(
        response.meta || {
          page,
          totalPages: 1,
          totalItems:
            data.length,
          limit: 20,
        }
      );
    } catch (err) {
      setRows([]);

      setError(
        getApiErrorMessage(
          err,
          'โหลดรายชื่อร้านค้าไม่สำเร็จ'
        )
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };


  useEffect(() => {
    loadStores(1);
  }, [
    appliedSearch,
    status,
  ]);


  /*
   * ==========================
   * LOAD STORE DETAIL
   * ==========================
   */

  const loadStoreDetail =
    async (
      shopId,
      fallbackStore = null
    ) => {
      setDetailLoading(true);
      setDetailError('');

      try {
        const response =
          await adminService.store(
            shopId
          );


        const data =
          response.data ||
          null;


        setDetail(data);


        const currentStatus =
          data?.status
            ?.shopStatus ||
          data?.shopStatus ||
          fallbackStore
            ?.shopStatus ||
          'PENDING';


        setNextStatus(
          currentStatus
        );
      } catch (err) {
        setDetail(null);

        setDetailError(
          getApiErrorMessage(
            err,
            'โหลดรายละเอียดร้านค้าไม่สำเร็จ'
          )
        );
      } finally {
        setDetailLoading(false);
      }
    };


  /*
   * ==========================
   * OPEN MODAL
   * ==========================
   */

  const openDetail = (
    storeItem
  ) => {
    setSelectedStore(
      storeItem
    );

    setDetail(null);
    setDetailError('');
    setDetailMessage('');

    setNextStatus(
      storeItem.shopStatus ||
      'PENDING'
    );


    loadStoreDetail(
      storeItem.shopId,
      storeItem
    );
  };


  /*
   * ==========================
   * CLOSE MODAL
   * ==========================
   */

  const closeDetail = () => {
    if (savingStatus) {
      return;
    }

    setSelectedStore(null);
    setDetail(null);
    setDetailError('');
    setDetailMessage('');
  };


  /*
   * ==========================
   * UPDATE STORE STATUS
   * ==========================
   */

  const saveStatus = async () => {
    if (!selectedStore) {
      return;
    }


    const currentStatus =
      detail?.status
        ?.shopStatus ||
      detail?.shopStatus ||
      selectedStore.shopStatus ||
      'PENDING';


    if (
      nextStatus ===
      currentStatus
    ) {
      setDetailMessage(
        'สถานะร้านค้าไม่มีการเปลี่ยนแปลง'
      );

      return;
    }


    const confirmed =
      window.confirm(
        `ยืนยันการเปลี่ยนสถานะร้านค้าเป็น ${nextStatus} หรือไม่?`
      );


    if (!confirmed) {
      return;
    }


    setSavingStatus(true);
    setDetailError('');
    setDetailMessage('');


    try {
      const response =
        await adminService
          .updateStoreStatus(
            selectedStore.shopId,
            nextStatus
          );


      /*
       * โหลดรายละเอียดใหม่
       */
      await loadStoreDetail(
        selectedStore.shopId,
        selectedStore
      );


      /*
       * Refresh ตารางด้านหลัง
       * โดยไม่ให้หน้า Flash Loading
       */
      await loadStores(
        meta.page || 1,
        {
          silent: true,
        }
      );


      setDetailMessage(
        response.message ||
        'อัปเดตสถานะร้านค้าเรียบร้อยแล้ว'
      );
    } catch (err) {
      setDetailError(
        getApiErrorMessage(
          err,
          'อัปเดตสถานะร้านค้าไม่สำเร็จ'
        )
      );
    } finally {
      setSavingStatus(false);
    }
  };


  /*
   * ==========================
   * DETAIL DATA
   * ==========================
   */

  const shop =
    detail?.shop ||
    detail ||
    {};


  const owner =
    detail?.owner ||
    shop?.owner ||
    {};


  const rawContact =
    detail?.contactChannels ||
    detail?.contact ||
    shop?.contactChannels ||
    shop?.contact ||
    {};


  const contact =
    (
      rawContact &&
      typeof rawContact ===
        'object'
    )
      ? rawContact
      : {};


  const contactText =
    typeof rawContact ===
    'string'
      ? rawContact
      : contact.channels ||
        '';


  const location =
    detail?.location ||
    shop?.location ||
    {};


  const detailStatus =
    detail?.status ||
    {};


  const stats =
    detail?.statistics ||
    {};


  const verify =
    detail?.storeverification ||
    detail?.storeVerification ||
    {};


  const ownerName =
    [
      owner.firstName,
      owner.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    selectedStore
      ?.ownerName ||
    '-';


  const ownerEmail =
    owner.email ||
    selectedStore
      ?.ownerEmail ||
    selectedStore?.email ||
    '-';


  const ownerPhone =
    owner.phone ||
    contact.phone ||
    selectedStore
      ?.ownerPhone ||
    '-';


  const shopName =
    shop.shopName ||
    selectedStore
      ?.shopName ||
    '-';


  const profileImageUrl =
    shop.profileImageUrl ||
    detail?.profileImageUrl ||
    selectedStore
      ?.profileImageUrl ||
    '';


  const currentShopStatus =
    detailStatus.shopStatus ||
    shop.shopStatus ||
    selectedStore
      ?.shopStatus ||
    'PENDING';


  const submittedAt =
    detailStatus.submittedAt ||
    shop.submittedAt ||
    shop.summitAt ||
    selectedStore
      ?.submittedAt ||
    '';


  const approvedAt =
    verify.approvedAt ||
    verify.approveAt ||
    detailStatus.approvedAt ||
    '';


  const approvedBy =
    verify.approveBy ||
    verify.approvedBy ||
    detailStatus.approveBy ||
    '-';


  const operatingHours =
    shop.operatingHours ||
    contact.operatingHours ||
    detail?.operatingHours ||
    '-';


  const fullAddress =
    [
      location.addressText,
      location.subDistrict,
      location.district,
      location.province,
      location.zipCode,
    ]
      .filter(Boolean)
      .join(' ') ||
    '-';


  const documents = [
    {
      label:
        'บัตรประชาชน',
      url:
        verify.idCardImage,
    },

    {
      label:
        'หนังสือรับรองบริษัท',
      url:
        verify.businessRegImage,
    },

    {
      label:
        'รูปหน้าร้าน',
      url:
        verify.storeImnage ||
        verify.storeImage,
    },
  ];


  return (
    <div className="admin-stores-page">
      <PageHeader
        title="จัดการร้านค้าในระบบ"
        subtitle="ตรวจสอบ อนุมัติ และจัดการสถานะร้านค้า"
      />


      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}


      {/* STAT CARDS */}

      <div className="stats-grid four">

        <StatCard
          icon={Building2}
          label="ร้านค้าทั้งหมด"
          value={
            summary.all || 0
          }
          tone="blue"
        />


        <StatCard
          icon={CheckCircle2}
          label="อนุมัติแล้ว"
          value={
            summary.approve || 0
          }
          tone="green"
        />


        <StatCard
          icon={XCircle}
          label="ไม่อนุมัติ"
          value={
            summary.rejected ||
            0
          }
          tone="red"
        />


        <StatCard
          icon={Store}
          label="คำขอรอดำเนินการ"
          value={
            summary.pending ||
            0
          }
          tone="orange"
        />

      </div>


      {/* SEARCH */}

      <div className="toolbar-card">

        <div className="search-control">

          <Search size={17} />

          <input
            placeholder="ค้นหาชื่อร้านหรือเจ้าของร้าน"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                'Enter'
              ) {
                setAppliedSearch(
                  search.trim()
                );
              }
            }}
          />

        </div>


        <button
          type="button"
          className="outline-btn compact"
          onClick={() =>
            setAppliedSearch(
              search.trim()
            )
          }
        >
          ค้นหา
        </button>


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="">
            สถานะทั้งหมด
          </option>

          <option value="PENDING">
            PENDING
          </option>

          <option value="OPEN">
            OPEN
          </option>

          <option value="CLOSED">
            CLOSED
          </option>

          <option value="REJECTED">
            REJECTED
          </option>

          <option value="SUSPENDED">
            SUSPENDED
          </option>
        </select>

      </div>


      {/* TABLE */}

      <div className="data-card">

        {loading ? (
          <LoadingState label="กำลังโหลดร้านค้า..." />
        ) : (
          <>

            <table className="admin-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>ชื่อร้านค้า</th>
                  <th>เจ้าของร้าน</th>
                  <th>อีเมล</th>
                  <th>เบอร์โทร</th>
                  <th>จังหวัด</th>
                  <th>สถานะ</th>
                  <th>วันที่สมัคร</th>
                  <th>จัดการ</th>
                </tr>
              </thead>


              <tbody>

                {rows.map(
                  (
                    storeItem,
                    index
                  ) => (
                    <tr
                      key={
                        storeItem.shopId
                      }
                    >

                      <td>
                        {(
                          (
                            meta.page ||
                            1
                          ) - 1
                        ) *
                          (
                            meta.limit ||
                            20
                          ) +
                          index +
                          1}
                      </td>


                      <td className="strong-cell">
                        {storeItem.shopName ||
                          '-'}
                      </td>


                      <td>
                        {storeItem.ownerName ||
                          '-'}
                      </td>


                      <td>
                        {storeItem.ownerEmail ||
                          storeItem.email ||
                          '-'}
                      </td>


                      <td>
                        {storeItem.ownerPhone ||
                          '-'}
                      </td>


                      <td>
                        {storeItem.province ||
                          '-'}
                      </td>


                      <td>
                        <StatusBadge
                          status={
                            storeItem.shopStatus
                          }
                        />
                      </td>


                      <td>
                        {formatDate(
                          storeItem.submittedAt
                        )}
                      </td>


                      <td>

                        <div className="row-actions">

                          <button
                            type="button"
                            className="icon-only admin-store-view-btn"
                            onClick={() =>
                              openDetail(
                                storeItem
                              )
                            }
                            title="ดูรายละเอียดร้านค้า"
                            aria-label={`ดูรายละเอียด ${storeItem.shopName || 'ร้านค้า'}`}
                          >
                            <Eye
                              size={19}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>


            {!rows.length && (
              <div className="empty-inline">
                ไม่พบร้านค้า
              </div>
            )}


            <div className="table-footer">

              <span>
                ทั้งหมด{' '}
                {meta.totalItems ||
                  rows.length}{' '}
                รายการ
              </span>


              <PaginationBar
                page={
                  meta.page || 1
                }
                pages={
                  meta.totalPages ||
                  1
                }
                onChange={
                  loadStores
                }
              />

            </div>

          </>
        )}

      </div>


      {/* ===================================================
          STORE DETAIL MODAL
          =================================================== */}

      <Modal
        show={!!selectedStore}
        onHide={closeDetail}
        centered
        scrollable
        dialogClassName="admin-store-detail-dialog"
      >

        <Modal.Header
          closeButton={!savingStatus}
        >
          <div className="admin-store-modal-heading">

            <Modal.Title>
              รายละเอียดร้านค้า
            </Modal.Title>

            <span>
              ข้อมูลรายละเอียดของร้านค้าที่ส่งคำขอเปิดร้าน
            </span>

          </div>
        </Modal.Header>


        <Modal.Body>

          {detailLoading ? (
            <div className="admin-store-modal-loading">
              <LoadingState label="กำลังโหลดรายละเอียดร้านค้า..." />
            </div>
          ) : (
            <>

              {detailError && (
                <div className="inline-error">
                  {detailError}
                </div>
              )}


              {detailMessage && (
                <div className="inline-success">
                  {detailMessage}
                </div>
              )}


              {/* TOP */}

              <div className="admin-store-modal-top">

                {/* STORE OVERVIEW */}

                <section className="admin-store-modal-card admin-store-profile-card">

                  <div className="admin-store-logo">

                    {profileImageUrl ? (
                      <img
                        src={
                          profileImageUrl
                        }
                        alt={
                          shopName
                        }
                      />
                    ) : (
                      <span>
                        {shopName
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}

                  </div>


                  <div className="admin-store-profile-info">

                    <div className="admin-store-name-row">

                      <h2>
                        {shopName}
                      </h2>

                      <StatusBadge
                        status={
                          currentShopStatus
                        }
                      />

                    </div>


                    <p>
                      <UserRound
                        size={17}
                      />

                      <span>
                        เจ้าของร้าน:
                      </span>

                      <strong>
                        {ownerName}
                      </strong>
                    </p>


                    <p>
                      <span className="admin-store-inline-icon">
                        ✉
                      </span>

                      <span>
                        อีเมล:
                      </span>

                      <strong>
                        {ownerEmail}
                      </strong>
                    </p>


                    <p>
                      <Phone
                        size={17}
                      />

                      <span>
                        เบอร์โทรศัพท์:
                      </span>

                      <strong>
                        {ownerPhone}
                      </strong>
                    </p>


                    <p>
                      <span className="admin-store-inline-icon">
                        ◷
                      </span>

                      <span>
                        วันที่สมัคร:
                      </span>

                      <strong>
                        {formatDateTime(
                          submittedAt
                        )}
                      </strong>
                    </p>

                  </div>

                </section>


                {/* STATUS PANEL */}

                <section className="admin-store-modal-card admin-store-status-panel">

                  <h3>
                    สถานะการสมัคร
                  </h3>


                  <div className="admin-store-status-current">

                    <span>
                      สถานะปัจจุบัน
                    </span>

                    <StatusBadge
                      status={
                        currentShopStatus
                      }
                    />

                  </div>


                  <div className="admin-store-status-meta">

                    <div>
                      <span>
                        วันที่อนุมัติ
                      </span>

                      <strong>
                        {formatDateTime(
                          approvedAt
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        อนุมัติโดย
                      </span>

                      <strong>
                        {approvedBy}
                      </strong>
                    </div>

                  </div>


                  <label className="admin-store-status-select">

                    <span>
                      เปลี่ยนสถานะร้านค้า
                    </span>

                    <select
                      value={
                        nextStatus
                      }
                      onChange={(event) =>
                        setNextStatus(
                          event.target.value
                        )
                      }
                      disabled={
                        savingStatus
                      }
                    >

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="OPEN">
                        OPEN
                      </option>

                      <option value="CLOSED">
                        CLOSED
                      </option>

                      <option value="REJECTED">
                        REJECTED
                      </option>

                      <option value="SUSPENDED">
                        SUSPENDED
                      </option>

                    </select>

                  </label>


                  <button
                    type="button"
                    className="primary-btn admin-store-status-save"
                    onClick={
                      saveStatus
                    }
                    disabled={
                      savingStatus
                    }
                  >
                    {savingStatus
                      ? 'กำลังบันทึก...'
                      : 'บันทึกสถานะ'}
                  </button>

                </section>

              </div>


              {/* LOWER */}

              <div className="admin-store-modal-bottom">

                {/* STORE INFORMATION */}

                <section className="admin-store-modal-card">

                  <h3>
                    ข้อมูลร้านค้า
                  </h3>


                  <dl className="admin-store-detail-list">

                    <dt>
                      ชื่อร้านค้า
                    </dt>

                    <dd>
                      {shopName}
                    </dd>


                    <dt>
                      ชื่อเจ้าของร้าน
                    </dt>

                    <dd>
                      {ownerName}
                    </dd>


                    <dt>
                      อีเมล
                    </dt>

                    <dd>
                      {ownerEmail}
                    </dd>


                    <dt>
                      เบอร์โทรศัพท์
                    </dt>

                    <dd>
                      {ownerPhone}
                    </dd>


                    <dt>
                      เวลาทำการ
                    </dt>

                    <dd>
                      {operatingHours}
                    </dd>


                    <dt>
                      Facebook
                    </dt>

                    <dd>
                      {contact.facebook ||
                        '-'}
                    </dd>


                    <dt>
                      Line
                    </dt>

                    <dd>
                      {contact.line ||
                        contact.lineId ||
                        '-'}
                    </dd>


                    <dt>
                      Website
                    </dt>

                    <dd>
                      {contact.website ||
                        '-'}
                    </dd>


                    {contactText && (
                      <>
                        <dt>
                          ช่องทางติดต่อ
                        </dt>

                        <dd>
                          {contactText}
                        </dd>
                      </>
                    )}


                    <dt>
                      คำอธิบายร้านค้า
                    </dt>

                    <dd>
                      {shop.shopDescription ||
                        shop.description ||
                        '-'}
                    </dd>


                    <dt>
                      สินค้าทั้งหมด
                    </dt>

                    <dd>
                      {stats.totalProducts ??
                        0}
                    </dd>


                    <dt>
                      ยอด Favorite
                    </dt>

                    <dd>
                      {stats.totalFavorites ??
                        0}
                    </dd>

                  </dl>


                  <div className="admin-store-documents">

                    <h3>
                      เอกสารประกอบ
                    </h3>


                    {documents.map(
                      (
                        document
                      ) => (
                        <div
                          key={
                            document.label
                          }
                        >

                          <span>
                            {document.label}
                          </span>


                          {document.url ? (
                            <a
                              href={
                                document.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              title="เปิดเอกสาร"
                            >
                              <ExternalLink
                                size={17}
                              />

                              ดูเอกสาร
                            </a>
                          ) : (
                            <span className="muted-note">
                              ไม่มีเอกสาร
                            </span>
                          )}

                        </div>
                      )
                    )}

                  </div>

                </section>


                {/* ADDRESS */}

                <section className="admin-store-modal-card">

                  <h3>
                    ที่อยู่ร้านค้า
                  </h3>


                  <div className="admin-store-address">

                    <MapPin
                      size={21}
                    />

                    <p>
                      {fullAddress}
                    </p>

                  </div>


                  <div className="admin-store-location-card">

                    <div className="admin-store-location-icon">
                      <MapPin
                        size={30}
                      />
                    </div>


                    <div>
                      <strong>
                        ตำแหน่งร้านค้า
                      </strong>

                      <span>
                        พิกัดร้านค้าที่บันทึกไว้ในระบบ
                      </span>
                    </div>


                    {location.latitude != null &&
                    location.longitude != null ? (
                      <>

                        <div className="admin-store-coordinate">
                          <span>
                            Latitude
                          </span>

                          <strong>
                            {location.latitude}
                          </strong>
                        </div>


                        <div className="admin-store-coordinate">
                          <span>
                            Longitude
                          </span>

                          <strong>
                            {location.longitude}
                          </strong>
                        </div>


                        <a
                          className="outline-btn admin-store-map-link"
                          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin
                            size={16}
                          />

                          เปิดตำแหน่งในแผนที่
                        </a>

                      </>
                    ) : (
                      <div className="empty-inline admin-store-no-location">
                        ร้านค้านี้ยังไม่มีข้อมูลพิกัด
                      </div>
                    )}

                  </div>

                </section>

              </div>

            </>
          )}

        </Modal.Body>


        <Modal.Footer>

          <button
            type="button"
            className="outline-btn"
            onClick={
              closeDetail
            }
            disabled={
              savingStatus
            }
          >
            ปิด
          </button>

        </Modal.Footer>

      </Modal>

     </div>
  );
}