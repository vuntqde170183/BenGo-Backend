import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Driver } from '../driver/driver.schema';

async function updateDriverStatuses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const driverModel = app.get<Model<Driver>>(getModelToken(Driver.name));

  console.log('\n========================================');
  console.log('🔄 CẬP NHẬT TRẠNG THÁI TÀI XẾ MẪU');
  console.log('========================================\n');

  // Lấy tất cả drivers APPROVED để chuyển sang các trạng thái khác
  const approvedDrivers = await driverModel.find({ status: 'APPROVED' }).limit(15).exec();
  
  if (approvedDrivers.length === 0) {
    console.log('❌ Không tìm thấy driver APPROVED nào để chuyển đổi\n');
    await app.close();
    return;
  }

  console.log(`📊 Tìm thấy ${approvedDrivers.length} drivers APPROVED\n`);

  // Danh sách lý do từ chối
  const rejectionReasons = [
    { reason: 'Hồ sơ không đầy đủ', note: 'Cần bổ sung giấy phép lái xe hạng B2' },
    { reason: 'Giấy tờ xe không hợp lệ', note: 'Đăng kiểm xe đã hết hạn' },
    { reason: 'Không đủ tuổi lái xe', note: 'Chưa đủ 18 tuổi theo quy định' },
    { reason: 'Ảnh chụp không rõ ràng', note: 'Cần chụp lại CMND/CCCD và bằng lái' },
    { reason: 'Thông tin không khớp', note: 'Tên trên bằng lái khác với CMND' },
  ];

  // Danh sách lý do khóa
  const lockReasons = [
    { reason: 'Vi phạm quy định an toàn giao thông', note: 'Tạm khóa 30 ngày' },
    { reason: 'Khách hàng khiếu nại nhiều lần', note: 'Đang xem xét, tạm khóa 15 ngày' },
    { reason: 'Không hoàn thành đơn hàng', note: 'Hủy đơn liên tục, khóa 7 ngày' },
    { reason: 'Thái độ phục vụ kém', note: 'Nhiều đánh giá 1 sao, tạm khóa 10 ngày' },
  ];

  const updates = [];
  let index = 0;

  // Tạo 5 PENDING drivers
  for (let i = 0; i < 5 && index < approvedDrivers.length; i++, index++) {
    updates.push({
      driver: approvedDrivers[index],
      status: 'PENDING',
      reason: null,
      note: null,
    });
  }

  // Tạo 5 REJECTED drivers
  for (let i = 0; i < 5 && index < approvedDrivers.length; i++, index++) {
    const reasonData = rejectionReasons[i % rejectionReasons.length];
    updates.push({
      driver: approvedDrivers[index],
      status: 'REJECTED',
      reason: reasonData.reason,
      note: reasonData.note,
    });
  }

  // Tạo 4 LOCKED drivers
  for (let i = 0; i < 4 && index < approvedDrivers.length; i++, index++) {
    const reasonData = lockReasons[i % lockReasons.length];
    updates.push({
      driver: approvedDrivers[index],
      status: 'LOCKED',
      reason: reasonData.reason,
      note: reasonData.note,
    });
  }

  // Thực hiện cập nhật
  console.log('🔄 Đang cập nhật...\n');
  
  for (const update of updates) {
    const { driver, status, reason, note } = update;
    
    driver.status = status;
    driver.rejectionReason = reason;
    driver.adminNote = note;
    
    await driver.save();
    
    console.log(`✅ ${status.padEnd(10)} - ${driver.plateNumber}`);
    if (reason) console.log(`   Lý do: ${reason}`);
  }

  console.log('\n========================================');
  console.log(`✅ Đã cập nhật ${updates.length} drivers`);
  console.log('========================================\n');

  // Hiển thị thống kê sau khi cập nhật
  console.log('📊 THỐNG KÊ SAU CẬP NHẬT:\n');
  
  const statuses = ['APPROVED', 'PENDING', 'LOCKED', 'REJECTED'];
  for (const status of statuses) {
    const count = await driverModel.countDocuments({ status });
    const icon = count > 0 ? '✅' : '❌';
    console.log(`${icon} ${status.padEnd(10)} : ${count} tài xế`);
  }

  console.log('');
  await app.close();
}

// Chạy script
updateDriverStatuses()
  .then(() => {
    console.log('✅ Hoàn thành!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
