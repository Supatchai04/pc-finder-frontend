import {
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  Button,
  Form,
  Modal,
} from 'react-bootstrap';

import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';

import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';


const getRoleLabel = (role) => {
  const value =
    String(role || '').toUpperCase();

  if (value === 'CUSTOMER') {
    return 'ลูกค้า';
  }

  if (value === 'SHOP') {
    return 'เจ้าของร้าน';
  }

  if (value === 'ADMIN') {
    return 'ผู้ดูแลระบบ';
  }

  return value || '-';
};


export default function AdminUsersPage() {
  const [rows, setRows] =
    useState([]);

  const [meta, setMeta] =
    useState({
      page: 1,
      totalPages: 1,
      totalItems: 0,
    });

  const [summary, setSummary] =
    useState({
      all: 0,
      customer: 0,
      shop: 0,
      admin: 0,
    });

  const [search, setSearch] =
    useState('');

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('');

  const [role, setRole] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [selected, setSelected] =
    useState(null);

  const [
    nextStatus,
    setNextStatus,
  ] = useState('ACTIVE');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [saving, setSaving] =
    useState(false);


  const load = async (
    page = 1
  ) => {
    setLoading(true);
    setError('');

    try {
      const response =
        await adminService.users({
          page,
          limit: 20,

          ...(appliedSearch
            ? {
                search:
                  appliedSearch,
              }
            : {}),

          ...(role
            ? { role }
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


      setMeta(
        response.meta || {
          page,
          totalPages: 1,
          totalItems:
            data.length,
          limit: 20,
        }
      );


      /*
       * ถ้า Backend มี summary
       * ให้ใช้ค่าจาก Backend ก่อน
       *
       * ถ้ายังเป็น Mock
       * จะนับจากข้อมูลที่ได้รับมาแทน
       */
      const backendSummary =
        response.summary || {};


      const customerCount =
        data.filter(
          (user) =>
            String(
              user.userRole || ''
            ).toUpperCase() ===
            'CUSTOMER'
        ).length;


      const shopCount =
        data.filter(
          (user) =>
            String(
              user.userRole || ''
            ).toUpperCase() ===
            'SHOP'
        ).length;


      const adminCount =
        data.filter(
          (user) =>
            String(
              user.userRole || ''
            ).toUpperCase() ===
            'ADMIN'
        ).length;


      setSummary({
        all:
          backendSummary.all ??
          backendSummary.total ??
          response.meta
            ?.totalItems ??
          data.length,

        customer:
          backendSummary.customer ??
          backendSummary.customers ??
          customerCount,

        shop:
          backendSummary.shop ??
          backendSummary.shops ??
          shopCount,

        admin:
          backendSummary.admin ??
          backendSummary.admins ??
          adminCount,
      });
    } catch (err) {
      setRows([]);

      setError(
        getApiErrorMessage(
          err,
          'โหลดรายชื่อผู้ใช้ไม่สำเร็จ'
        )
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load(1);
  }, [
    appliedSearch,
    role,
    status,
  ]);


  const submitSearch = () => {
    setAppliedSearch(
      search.trim()
    );
  };


  const open = (user) => {
    setSelected(user);

    setNextStatus(
      user.userStatus ||
      'ACTIVE'
    );
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setSelected(null);
  };


  const save = async () => {
    if (!selected) {
      return;
    }


    if (
      nextStatus ===
      selected.userStatus
    ) {
      setSelected(null);
      return;
    }


    const confirmed =
      window.confirm(
        `ยืนยันการเปลี่ยนสถานะบัญชีเป็น ${nextStatus} หรือไม่?`
      );


    if (!confirmed) {
      return;
    }


    setSaving(true);
    setError('');


    try {
      await adminService
        .updateUserStatus(
          selected.userId,
          nextStatus
        );


      setSelected(null);


      await load(
        meta.page || 1
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'อัปเดตสถานะผู้ใช้ไม่สำเร็จ'
        )
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="admin-users-page">

      <PageHeader
        title="จัดการผู้ใช้"
        subtitle="จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ สามารถค้นหา ดูข้อมูล และจัดการสิทธิ์การใช้งานได้"
      />


      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}


      {/* =======================
          STAT CARDS
          ======================= */}

      <div className="stats-grid four admin-user-stats">

        <StatCard
          icon={Users}
          label="ผู้ใช้ทั้งหมด"
          value={
            summary.all || 0
          }
          tone="blue"
        />


        <StatCard
          icon={UserRound}
          label="ลูกค้า (Customer)"
          value={
            summary.customer || 0
          }
          tone="green"
        />


        <StatCard
          icon={Store}
          label="เจ้าของร้าน (Shop)"
          value={
            summary.shop || 0
          }
          tone="purple"
        />


        <StatCard
          icon={ShieldCheck}
          label="ผู้ดูแลระบบ (Admin)"
          value={
            summary.admin || 0
          }
          tone="orange"
        />

      </div>


      {/* =======================
          FILTER
          ======================= */}

      <div className="toolbar-card admin-users-toolbar">

        <div className="search-control">

          <Search size={18} />

          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล"
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
                submitSearch();
              }
            }}
          />

        </div>


        <button
          type="button"
          className="outline-btn compact admin-search-button"
          onClick={submitSearch}
        >
          ค้นหา
        </button>


        <select
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value
            )
          }
        >
          <option value="">
            บทบาททั้งหมด
          </option>

          <option value="CUSTOMER">
            ลูกค้า
          </option>

          <option value="SHOP">
            เจ้าของร้าน
          </option>

          <option value="ADMIN">
            ผู้ดูแลระบบ
          </option>
        </select>


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

          <option value="ACTIVE">
            ACTIVE
          </option>

          <option value="SUSPENDED">
            SUSPENDED
          </option>
        </select>

      </div>


      {/* =======================
          TABLE
          ======================= */}

      <div className="data-card admin-users-card">

        {loading ? (
          <LoadingState label="กำลังโหลดผู้ใช้งาน..." />
        ) : (
          <>

            <div className="admin-users-table-wrap">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>ผู้ใช้</th>
                    <th>อีเมล</th>
                    <th>บทบาท</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>


                <tbody>

                  {rows.map(
                    (
                      user,
                      index
                    ) => {

                      const rowNumber =
                        (
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
                        1;


                      const displayName =
                        user.displayName ||
                        '-';


                      const avatarText =
                        (
                          user.displayName ||
                          user.email ||
                          '?'
                        )
                          .slice(0, 1)
                          .toUpperCase();


                      const roleValue =
                        String(
                          user.userRole ||
                          ''
                        )
                          .toUpperCase();


                      return (
                        <tr
                          key={
                            user.userId
                          }
                        >

                          <td>
                            {rowNumber}
                          </td>


                          <td>

                            <div className="user-cell">

                              <div className="tiny-avatar">
                                {avatarText}
                              </div>


                              <span>
                                {displayName}
                              </span>

                            </div>

                          </td>


                          <td>
                            {user.email ||
                              '-'}
                          </td>


                          <td>

                            <span
                              className={
                                `role-pill role-${roleValue.toLowerCase()}`
                              }
                            >
                              {getRoleLabel(
                                roleValue
                              )}
                            </span>

                          </td>


                          <td>

                            <StatusBadge
                              status={
                                user.userStatus
                              }
                            />

                          </td>


                          <td>

                            <div className="row-actions">

                              <button
                                type="button"
                                className="admin-manage-user-btn"
                                onClick={() =>
                                  open(user)
                                }
                              >
                                จัดการผู้ใช้
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>


            {!rows.length && (
              <div className="empty-inline">
                ไม่พบผู้ใช้
              </div>
            )}


            <div className="table-footer">

              <span>
                ทั้งหมด{' '}
                {meta.totalItems ??
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
                onChange={load}
              />

            </div>

          </>
        )}

      </div>


      {/* =======================
          MANAGE USER MODAL
          ======================= */}

      <Modal
        show={!!selected}
        onHide={closeModal}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            จัดการผู้ใช้งาน
          </Modal.Title>

        </Modal.Header>


        {selected && (
          <Modal.Body>

            <div className="user-modal-profile">

              <div className="large-generic-avatar">

                {(
                  selected.displayName ||
                  selected.email ||
                  '?'
                )
                  .slice(0, 1)
                  .toUpperCase()}

              </div>


              <div>

                <strong>
                  {selected.displayName ||
                    '-'}
                </strong>

                <span>
                  {selected.email ||
                    '-'}
                </span>

              </div>

            </div>


            <Form.Group>

              <Form.Label>
                สถานะบัญชี
              </Form.Label>


              <Form.Select
                value={
                  nextStatus
                }
                onChange={(event) =>
                  setNextStatus(
                    event.target.value
                  )
                }
              >

                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="SUSPENDED">
                  SUSPENDED
                </option>

              </Form.Select>

            </Form.Group>

          </Modal.Body>
        )}


        <Modal.Footer>

          <Button
            variant="light"
            onClick={
              closeModal
            }
            disabled={
              saving
            }
          >
            ยกเลิก
          </Button>


          <Button
            onClick={save}
            disabled={saving}
          >
            {saving
              ? 'กำลังบันทึก...'
              : 'บันทึกสถานะ'}
          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
}