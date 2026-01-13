import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Driver } from '../driver/driver.schema';
import { User } from '../user/user.schema';

async function checkAndSeedDriverStatuses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const driverModel = app.get<Model<Driver>>(getModelToken(Driver.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('\n========================================');
  console.log('🔍 KIỂM TRA TRẠNG THÁI TÀI XẾ');
  console.log('========================================\n');

  // Đếm số lượng driver theo từng trạng thái
  const statuses = ['APPROVED', 'PENDING', 'LOCKED', 'REJECTED'];
  const statusCounts = {};

  for (const status of statuses) {
    const count = await driverModel.countDocuments({ status });
    statusCounts[status] = count;
    
    const icon = count > 0 ? '✅' : '❌';
    console.log(`${icon} ${status.padEnd(10)} : ${count} tài xế`);
  }

  const totalDrivers = await driverModel.countDocuments();
  console.log(`\n📊 Tổng số tài xế: ${totalDrivers}`);

  // Hiển thị chi tiết drivers có REJECTED hoặc LOCKED
  console.log('\n========================================');
  console.log('📋 CHI TIẾT TÀI XẾ BỊ TỪ CHỐI/KHÓA');
  console.log('========================================\n');

  const rejectedOrLocked = await driverModel
    .find({ status: { $in: ['REJECTED', 'LOCKED'] } })
    .populate('userId', 'name phone email')
    .exec();

  if (rejectedOrLocked.length > 0) {
    rejectedOrLocked.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.status}`);
      console.log(`   Tài xế: ${(driver.userId as any)?.name || 'N/A'}`);
      console.log(`   SĐT: ${(driver.userId as any)?.phone || 'N/A'}`);
      console.log(`   Biển số: ${driver.plateNumber}`);
      console.log(`   Lý do: ${driver.rejectionReason || 'Chưa có'}`);
      console.log(`   Ghi chú: ${driver.adminNote || 'Chưa có'}`);
      console.log('');
    });
  } else {
    console.log('⚠️  Không có tài xế nào bị từ chối hoặc khóa\n');
  }

  // Kiểm tra xem có thiếu trạng thái nào không
  const missingStatuses = statuses.filter(status => statusCounts[status] === 0);
  
  if (missingStatuses.length > 0) {
    console.log('========================================');
    console.log('⚠️  THIẾU DỮ LIỆU MẪU');
    console.log('========================================\n');
    console.log(`Các trạng thái chưa có dữ liệu: ${missingStatuses.join(', ')}\n`);
    
    console.log('💡 Bạn có muốn tạo dữ liệu mẫu không? (y/n)');
    console.log('   Để tạo thủ công, sử dụng API:');
    console.log('   PUT /api/v1/admin/drivers/status');
    console.log('   Body: { "driverId": "...", "status": "REJECTED", "reason": "..." }\n');

    // Tìm một số driver APPROVED để có thể chuyển sang các trạng thái khác
    const approvedDrivers = await driverModel
      .find({ status: 'APPROVED' })
      .limit(3)
      .populate('userId', 'name phone')
      .exec();

    if (approvedDrivers.length > 0) {
      console.log('📝 Gợi ý: Có thể chuyển các tài xế sau sang trạng thái khác:\n');
      approvedDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ID: ${driver._id}`);
        console.log(`   Tên: ${(driver.userId as any)?.name || 'N/A'}`);
        console.log(`   Biển số: ${driver.plateNumber}`);
        console.log('');
      });
    }
  } else {
    console.log('========================================');
    console.log('✅ ĐẦY ĐỦ DỮ LIỆU');
    console.log('========================================\n');
    console.log('Tất cả các trạng thái đều có dữ liệu mẫu!\n');
  }

  // Hiển thị một số driver mẫu từ mỗi trạng thái
  console.log('========================================');
  console.log('📊 MẪU DỮ LIỆU THEO TRẠNG THÁI');
  console.log('========================================\n');

  for (const status of statuses) {
    const sample = await driverModel
      .findOne({ status })
      .populate('userId', 'name phone')
      .exec();

    if (sample) {
      console.log(`${status}:`);
      console.log(`  ID: ${sample._id}`);
      console.log(`  Tài xế: ${(sample.userId as any)?.name || 'N/A'}`);
      console.log(`  Biển số: ${sample.plateNumber}`);
      if (sample.rejectionReason) {
        console.log(`  Lý do: ${sample.rejectionReason}`);
      }
      if (sample.adminNote) {
        console.log(`  Ghi chú: ${sample.adminNote}`);
      }
      console.log('');
    }
  }

  await app.close();
  console.log('========================================');
  console.log('✅ HOÀN THÀNH KIỂM TRA');
  console.log('========================================\n');
}

// Chạy script
checkAndSeedDriverStatuses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
