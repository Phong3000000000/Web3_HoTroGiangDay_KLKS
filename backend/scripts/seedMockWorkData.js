const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const ChamCong = require('../models/ChamCong');
const CongViecGiao = require('../models/CongViecGiao');
const EventLogsUser = require('../models/EventLogsUser');
const DanhMucPhongBan = require('../models/DanhMucPhongBan');
const HoSoNhanVien = require('../models/HoSoNhanVien');

const EMPLOYEE_ROLE_ID = '01926d2c-a8d1-7c3e-8f2a-1b3c4d5e6f7c';
const MANAGER_ROLE_ID = '01926d2c-a8d1-7c3e-8f2a-1b3c4d5e6f7b';
const FALLBACK_MANAGER_DID = '01926d2c-a8d1-4c3e-8f2a-1b3c4d5e6f7b';
const FALLBACK_DEPARTMENT_ID = '3d868e1f-2f53-4819-8ef6-b4af62fbb7b2';

function createDeterministicUuid(input) {
  const hex = crypto.createHash('md5').update(input).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function ensureEmployeeReady() {
  const walletAddress = process.env.SEED_WALLET_ADDRESS?.trim().toLowerCase();
  if (!walletAddress) {
    throw new Error('Missing SEED_WALLET_ADDRESS in environment variables.');
  }

  const employee = await HoSoNhanVien.findOne({ walletAddress });
  if (!employee) {
    throw new Error(`No employee found for wallet ${walletAddress}. Log in once with this wallet before seeding.`);
  }

  const department = await DanhMucPhongBan.findOne({ phong_ban_id: FALLBACK_DEPARTMENT_ID })
    || await DanhMucPhongBan.findOne({});
  if (!department) {
    throw new Error('No department found. Run node scripts/seedDepartments.js first.');
  }

  let manager = await HoSoNhanVien.findOne({ role_id: MANAGER_ROLE_ID });
  if (!manager) {
    manager = await HoSoNhanVien.findOne({ employee_did: FALLBACK_MANAGER_DID });
  }

  if (!manager) {
    manager = await HoSoNhanVien.findOneAndUpdate(
      { employee_did: FALLBACK_MANAGER_DID },
      {
        $set: {
          employee_did: FALLBACK_MANAGER_DID,
          chuc_vu: 'Manager',
          phong_ban_id: department.phong_ban_id,
          role_id: MANAGER_ROLE_ID,
          trang_thai: 'Đang làm việc',
          walletAddress: '0x1234567890123456789012345678901234567890',
          wallet_verified: true,
          ngay_vao_lam: new Date('2025-01-01')
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const hasValidDepartment = employee.phong_ban_id && employee.phong_ban_id === department.phong_ban_id;

  const updatedEmployee = await HoSoNhanVien.findOneAndUpdate(
    { _id: employee._id },
    {
      $set: {
        role_id: employee.role_id || EMPLOYEE_ROLE_ID,
        phong_ban_id: hasValidDepartment ? employee.phong_ban_id : department.phong_ban_id,
        wallet_verified: true,
        ngay_vao_lam: employee.ngay_vao_lam || new Date()
      }
    },
    { new: true }
  );

  return { employee: updatedEmployee, manager, department };
}

async function seedAttendance(employeeDid, managerDid) {
  const records = [
    {
      offsetDays: 0,
      gio_vao: '08:15:00',
      gio_ra: '17:25:00',
      tong_gio_lam: 9.17,
      loai_ngay: 'Ngày thường',
      ghi_chu: 'Hoàn thành ca làm việc bình thường.',
      luong_tinh_theo_gio: 18.34,
      trang_thai_cham_cong: 'Đã hoàn thành',
      salary_transaction_hash: '0xseededattendance000000000000000000000000000000000000000000000001'
    },
    {
      offsetDays: 1,
      gio_vao: '08:05:00',
      gio_ra: '17:05:00',
      tong_gio_lam: 9,
      loai_ngay: 'Ngày thường',
      ghi_chu: 'Check-in bằng web app.',
      luong_tinh_theo_gio: 18,
      trang_thai_cham_cong: 'Đã hoàn thành',
      salary_transaction_hash: null
    },
    {
      offsetDays: 2,
      gio_vao: '08:20:00',
      gio_ra: '16:40:00',
      tong_gio_lam: 8.33,
      loai_ngay: 'Ngày thường',
      ghi_chu: 'Rời sớm theo kế hoạch.',
      luong_tinh_theo_gio: 16.66,
      trang_thai_cham_cong: 'Đã hoàn thành',
      salary_transaction_hash: null
    },
    {
      offsetDays: 3,
      gio_vao: '08:10:00',
      gio_ra: null,
      tong_gio_lam: 4.5,
      loai_ngay: 'Ngày thường',
      ghi_chu: 'Quên checkout, chờ xác nhận.',
      luong_tinh_theo_gio: 4.5,
      trang_thai_cham_cong: 'Tạm ngưng',
      salary_transaction_hash: null
    }
  ];

  for (const record of records) {
    const day = formatDateOnly(new Date(Date.now() - record.offsetDays * 24 * 60 * 60 * 1000));
    await ChamCong.findOneAndUpdate(
      { employee_did: employeeDid, ngay: day },
      {
        $set: {
          employee_did: employeeDid,
          ngay: day,
          gio_vao: record.gio_vao,
          gio_ra: record.gio_ra,
          tong_gio_lam: record.tong_gio_lam,
          loai_ngay: record.loai_ngay,
          ghi_chu: record.ghi_chu,
          xac_thuc_qua: 'Web App',
          trang_thai_phe_duyet: 'Không cần phê duyệt',
          nhap_thu_cong: true,
          nguoi_nhap_did: managerDid,
          ngay_nhap: startOfLocalDay(new Date()),
          luong_tinh_theo_gio: record.luong_tinh_theo_gio,
          trang_thai_cham_cong: record.trang_thai_cham_cong,
          salary_transaction_hash: record.salary_transaction_hash,
          gio_lam_them: 0,
          trang_thai_lam_them: 'Không áp dụng',
          trang_thai_nghi_phep: 'Không áp dụng',
          quen_checkout_bao_cao: record.gio_ra === null,
          quen_checkout_mo_ta: record.gio_ra === null ? 'Đã gửi giải trình để admin xem xét.' : null,
          quen_checkout_trang_thai: record.gio_ra === null ? 'Chờ phê duyệt' : 'Không áp dụng',
          quen_checkout_gio_xac_nhan: record.gio_ra === null ? record.tong_gio_lam : null
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`✅ Seeded ${records.length} attendance records.`);
}

async function seedEvents(employeeDid) {
  const events = [
    {
      event_type: 'login',
      message: 'Đăng nhập thành công bằng MetaMask',
      resource_type: 'authentication',
      resource_id: null,
      is_read: false,
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      event_type: 'checkin',
      message: 'Bạn đã check-in thành công cho ca làm việc hôm nay',
      resource_type: 'attendance',
      resource_id: 'attendance_today',
      is_read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      event_type: 'system_update',
      message: 'Phòng ban của bạn đã được đồng bộ vào hồ sơ nhân viên',
      resource_type: 'department',
      resource_id: FALLBACK_DEPARTMENT_ID,
      is_read: true,
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000)
    },
    {
      event_type: 'warning',
      message: 'Bạn có 1 công việc đang gần tới hạn cần cập nhật tiến độ',
      resource_type: 'task',
      resource_id: 'seed-task-inprogress',
      is_read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ];

  for (const event of events) {
    await EventLogsUser.findOneAndUpdate(
      {
        user_did: employeeDid,
        event_type: event.event_type,
        message: event.message
      },
      {
        $set: {
          user_did: employeeDid,
          ...event
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`✅ Seeded ${events.length} event log records.`);
}

async function seedTasks(employee, manager, department) {
  const baseDate = new Date();
  const tasks = [
    {
      key: 'pending',
      ten_cong_viec: 'Xác nhận yêu cầu khách hàng mới',
      mo_ta: 'Kiểm tra backlog và phản hồi yêu cầu mới trong hệ thống.',
      do_uu_tien: 'Trung bình',
      muc_do_kho: 'Dễ',
      tien_thuong: 5,
      tien_phat: 2,
      trang_thai: 'Chờ bắt đầu',
      da_dong_y: false,
      ngay_dong_y: null,
      ngay_bat_dau: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
      ngay_ket_thuc_du_kien: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      tien_do: 0,
      current_pending_milestone: null
    },
    {
      key: 'inprogress',
      ten_cong_viec: 'Cập nhật báo cáo tuần của phòng ban',
      mo_ta: 'Tổng hợp tiến độ và đính kèm tài liệu liên quan để quản lý review.',
      do_uu_tien: 'Cao',
      muc_do_kho: 'Vừa',
      tien_thuong: 15,
      tien_phat: 2,
      trang_thai: 'Đang thực hiện',
      da_dong_y: true,
      ngay_dong_y: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      ngay_bat_dau: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      ngay_ket_thuc_du_kien: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      tien_do: 50,
      current_pending_milestone: 50
    },
    {
      key: 'review',
      ten_cong_viec: 'Đối soát dữ liệu khách hàng cuối tháng',
      mo_ta: 'Hoàn tất checklist, chuẩn bị file minh chứng và chờ quản lý phê duyệt.',
      do_uu_tien: 'Trung bình',
      muc_do_kho: 'Vừa',
      tien_thuong: 15,
      tien_phat: 2,
      trang_thai: 'Chờ review',
      da_dong_y: true,
      ngay_dong_y: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
      ngay_bat_dau: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
      ngay_ket_thuc_du_kien: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000),
      tien_do: 75,
      current_pending_milestone: 75
    },
    {
      key: 'completed',
      ten_cong_viec: 'Hoàn tất tài liệu onboarding nhân viên mới',
      mo_ta: 'Công việc mẫu đã hoàn thành để màn KPI thưởng có dữ liệu.',
      do_uu_tien: 'Cao',
      muc_do_kho: 'Khó',
      tien_thuong: 20,
      tien_phat: 2,
      trang_thai: 'Hoàn thành',
      da_dong_y: true,
      ngay_dong_y: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000),
      ngay_bat_dau: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000),
      ngay_ket_thuc_du_kien: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      ngay_hoan_thanh_thuc_te: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      tien_do: 100,
      payment_status: 'completed',
      payment_timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      payment_transaction_hash: '0xseededtaskpayment000000000000000000000000000000000000000000000001',
      current_pending_milestone: null
    }
  ];

  for (const task of tasks) {
    const taskId = createDeterministicUuid(`${employee.employee_did}-${task.key}`);
    const milestones = [];
    if (task.tien_do >= 25) {
      milestones.push({ milestone: 25, status: 'approved', submitted_at: task.ngay_bat_dau, approved_at: task.ngay_bat_dau, approved_by: manager.employee_did, note: 'Đã bắt đầu công việc', admin_note: 'Đã xác nhận' });
    }
    if (task.tien_do >= 50) {
      milestones.push({ milestone: 50, status: task.trang_thai === 'Đang thực hiện' ? 'pending' : 'approved', submitted_at: new Date(task.ngay_bat_dau.getTime() + 24 * 60 * 60 * 1000), approved_at: task.trang_thai === 'Đang thực hiện' ? null : new Date(task.ngay_bat_dau.getTime() + 24 * 60 * 60 * 1000), approved_by: task.trang_thai === 'Đang thực hiện' ? null : manager.employee_did, note: 'Đã đạt 50%', admin_note: task.trang_thai === 'Đang thực hiện' ? null : 'Đã phê duyệt' });
    }
    if (task.tien_do >= 75) {
      milestones.push({ milestone: 75, status: task.trang_thai === 'Chờ review' ? 'pending' : 'approved', submitted_at: new Date(task.ngay_bat_dau.getTime() + 2 * 24 * 60 * 60 * 1000), approved_at: task.trang_thai === 'Chờ review' ? null : new Date(task.ngay_bat_dau.getTime() + 2 * 24 * 60 * 60 * 1000), approved_by: task.trang_thai === 'Chờ review' ? null : manager.employee_did, note: 'Đã gần hoàn tất', admin_note: task.trang_thai === 'Chờ review' ? null : 'Đã phê duyệt' });
    }
    if (task.tien_do >= 100) {
      milestones.push({ milestone: 100, status: 'approved', submitted_at: task.ngay_hoan_thanh_thuc_te || task.ngay_ket_thuc_du_kien, approved_at: task.ngay_hoan_thanh_thuc_te || task.ngay_ket_thuc_du_kien, approved_by: manager.employee_did, note: 'Đã hoàn thành', admin_note: 'Tự động seed hoàn thành' });
    }

    await CongViecGiao.findOneAndUpdate(
      { task_id: taskId },
      {
        $set: {
          task_id: taskId,
          ten_cong_viec: task.ten_cong_viec,
          mo_ta: task.mo_ta,
          nguoi_giao_did: manager.employee_did,
          nguoi_thuc_hien_did: employee.employee_did,
          phong_ban_id: department.phong_ban_id,
          is_department_task: false,
          do_uu_tien: task.do_uu_tien,
          muc_do_kho: task.muc_do_kho,
          tien_thuong: task.tien_thuong,
          tien_phat: task.tien_phat,
          potential_reward: task.tien_thuong,
          potential_penalty: task.tien_phat,
          trang_thai: task.trang_thai,
          da_dong_y: task.da_dong_y,
          ngay_dong_y: task.ngay_dong_y,
          ngay_bat_dau: task.ngay_bat_dau,
          ngay_ket_thuc_du_kien: task.ngay_ket_thuc_du_kien,
          ngay_hoan_thanh_thuc_te: task.ngay_hoan_thanh_thuc_te || null,
          tien_do: task.tien_do,
          tien_do_milestones: milestones,
          current_pending_milestone: task.current_pending_milestone,
          gio_uoc_tinh: 8,
          gio_thuc_te: task.tien_do === 100 ? 7.5 : 4,
          tags: ['seed', 'employee-flow'],
          payment_status: task.payment_status || null,
          payment_timestamp: task.payment_timestamp || null,
          payment_transaction_hash: task.payment_transaction_hash || null,
          payment_error: null,
          file_dinh_kem: [],
          nhan_xet: []
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`✅ Seeded ${tasks.length} task records.`);
}

async function seedMockData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Missing MONGODB_URI in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const { employee, manager, department } = await ensureEmployeeReady();
    console.log('✅ Target employee ready:', {
      employee_did: employee.employee_did,
      walletAddress: employee.walletAddress,
      phong_ban_id: employee.phong_ban_id,
      role_id: employee.role_id
    });

    await seedAttendance(employee.employee_did, manager.employee_did);
    await seedEvents(employee.employee_did);
    await seedTasks(employee, manager, department);

    console.log('\n🎯 Employee flow seed finished successfully.');
    console.log('Collections updated: ho_so_nhan_vien, cham_cong, event_logs_user, cong_viec_giao');
  } catch (error) {
    console.error('❌ Error seeding employee flow data:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedMockData();
