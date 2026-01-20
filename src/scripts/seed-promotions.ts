import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Promotion } from '../admin/promotion.schema';

async function seedPromotions() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const promotionModel = app.get<Model<Promotion>>(getModelToken(Promotion.name));

  console.log('\n========================================');
  console.log('🎁 IMPORT DỮ LIỆU KHUYẾN MÃI THỰC TẾ');
  console.log('========================================\n');

  // Xóa dữ liệu cũ (nếu có)
  const existingCount = await promotionModel.countDocuments();
  if (existingCount > 0) {
    console.log(`🗑️  Xóa ${existingCount} khuyến mãi cũ...`);
    await promotionModel.deleteMany({});
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const next3Months = new Date(now);
  next3Months.setMonth(next3Months.getMonth() + 3);

  const next6Months = new Date(now);
  next6Months.setMonth(next6Months.getMonth() + 6);

  // Dữ liệu khuyến mãi thực tế cho dịch vụ giao hàng
  const promotions = [
    // === KHUYẾN MÃI CHÀO MỪNG NGƯỜI DÙNG MỚI ===
    {
      code: 'BENGO2026',
      title: 'Chào mừng năm mới 2026',
      description: 'Giảm 50% cho đơn hàng đầu tiên trong năm 2026. Áp dụng cho tất cả loại xe.',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minOrderValue: 0,
      maxDiscountAmount: 50000,
      startDate: now,
      endDate: next3Months,
      usageLimit: 1000,
      usedCount: 234,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'NEWUSER30',
      title: 'Người dùng mới - Giảm 30%',
      description: 'Dành cho khách hàng mới đăng ký. Giảm 30% cho 3 đơn hàng đầu tiên.',
      discountType: 'PERCENTAGE',
      discountValue: 30,
      minOrderValue: 20000,
      maxDiscountAmount: 40000,
      startDate: now,
      endDate: next6Months,
      usageLimit: 5000,
      usedCount: 1823,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },

    // === KHUYẾN MÃI THEO LOẠI XE ===
    {
      code: 'BIKE15K',
      title: 'Xe máy - Giảm 15K',
      description: 'Giảm ngay 15.000đ cho đơn hàng giao bằng xe máy. Tiết kiệm cho quãng đường ngắn.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 15000,
      minOrderValue: 30000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 2000,
      usedCount: 567,
      isActive: true,
      applicableVehicles: ['BIKE'],
    },
    {
      code: 'VAN20',
      title: 'Xe bán tải - Giảm 20%',
      description: 'Giảm 20% cho đơn hàng sử dụng xe bán tải. Phù hợp cho hàng hóa cồng kềnh.',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 100000,
      maxDiscountAmount: 80000,
      startDate: now,
      endDate: next3Months,
      usageLimit: 500,
      usedCount: 123,
      isActive: true,
      applicableVehicles: ['VAN'],
    },
    {
      code: 'TRUCK50K',
      title: 'Xe tải - Giảm 50K',
      description: 'Giảm 50.000đ cho đơn hàng giao bằng xe tải. Dành cho hàng hóa khối lượng lớn.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 200000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 300,
      usedCount: 89,
      isActive: true,
      applicableVehicles: ['TRUCK'],
    },

    // === KHUYẾN MÃI THEO THỜI GIAN ===
    {
      code: 'MORNING25',
      title: 'Buổi sáng vui vẻ - Giảm 25%',
      description: 'Giảm 25% cho đơn hàng từ 6h-9h sáng. Bắt đầu ngày mới với BenGo!',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      minOrderValue: 40000,
      maxDiscountAmount: 35000,
      startDate: now,
      endDate: next3Months,
      usageLimit: 1500,
      usedCount: 456,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'WEEKEND40',
      title: 'Cuối tuần vui vẻ - Giảm 40%',
      description: 'Giảm 40% cho tất cả đơn hàng vào thứ 7 và chủ nhật. Tận hưởng cuối tuần!',
      discountType: 'PERCENTAGE',
      discountValue: 40,
      minOrderValue: 50000,
      maxDiscountAmount: 60000,
      startDate: now,
      endDate: next3Months,
      usageLimit: 2000,
      usedCount: 789,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },

    // === KHUYẾN MÃI THEO GIÁ TRỊ ĐƠN HÀNG ===
    {
      code: 'ORDER100K',
      title: 'Đơn từ 100K - Giảm 20K',
      description: 'Giảm 20.000đ cho đơn hàng từ 100.000đ trở lên.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000,
      minOrderValue: 100000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: next6Months,
      usageLimit: 3000,
      usedCount: 1234,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'ORDER200K',
      title: 'Đơn từ 200K - Giảm 50K',
      description: 'Giảm 50.000đ cho đơn hàng từ 200.000đ trở lên. Tiết kiệm nhiều hơn!',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 200000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: next6Months,
      usageLimit: 1000,
      usedCount: 345,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'ORDER500K',
      title: 'Đơn từ 500K - Giảm 100K',
      description: 'Giảm 100.000đ cho đơn hàng từ 500.000đ trở lên. Ưu đãi đặc biệt!',
      discountType: 'FIXED_AMOUNT',
      discountValue: 100000,
      minOrderValue: 500000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: next6Months,
      usageLimit: 500,
      usedCount: 78,
      isActive: true,
      applicableVehicles: ['VAN', 'TRUCK'],
    },

    // === KHUYẾN MÃI FLASH SALE ===
    {
      code: 'FLASH60',
      title: 'Flash Sale - Giảm 60%',
      description: 'Flash Sale trong 7 ngày! Giảm 60% tối đa 80K. Số lượng có hạn!',
      discountType: 'PERCENTAGE',
      discountValue: 60,
      minOrderValue: 80000,
      maxDiscountAmount: 80000,
      startDate: now,
      endDate: nextWeek,
      usageLimit: 100,
      usedCount: 67,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'FLASH24H',
      title: 'Flash 24H - Giảm 70K',
      description: 'Chỉ trong 24 giờ! Giảm ngay 70.000đ cho mọi đơn hàng.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 70000,
      minOrderValue: 150000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: tomorrow,
      usageLimit: 50,
      usedCount: 38,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },

    // === KHUYẾN MÃI KHÁCH HÀNG THÂN THIẾT ===
    {
      code: 'VIP35',
      title: 'Khách hàng VIP - Giảm 35%',
      description: 'Dành riêng cho khách hàng thân thiết. Giảm 35% không giới hạn số lần sử dụng.',
      discountType: 'PERCENTAGE',
      discountValue: 35,
      minOrderValue: 50000,
      maxDiscountAmount: 100000,
      startDate: now,
      endDate: next6Months,
      usageLimit: null,
      usedCount: 2345,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'LOYALTY50K',
      title: 'Tri ân khách hàng - Giảm 50K',
      description: 'Cảm ơn sự đồng hành của bạn. Giảm 50.000đ cho đơn hàng tiếp theo.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 100000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: next3Months,
      usageLimit: 5000,
      usedCount: 2156,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },

    // === KHUYẾN MÃI SỰ KIỆN ĐẶC BIỆT ===
    {
      code: 'TET2026',
      title: 'Tết Nguyên Đán 2026',
      description: 'Chúc mừng năm mới! Giảm 88.000đ cho mọi đơn hàng dịp Tết.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 88000,
      minOrderValue: 150000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 888,
      usedCount: 456,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
    {
      code: 'VALENTINE45',
      title: 'Valentine - Giảm 45%',
      description: 'Gửi yêu thương với BenGo. Giảm 45% cho đơn hàng dịp Valentine.',
      discountType: 'PERCENTAGE',
      discountValue: 45,
      minOrderValue: 60000,
      maxDiscountAmount: 70000,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 1000,
      usedCount: 234,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN'],
    },

    // === MÃ HẾT HẠN (ĐỂ TEST) ===
    {
      code: 'EXPIRED20',
      title: 'Mã đã hết hạn - Test',
      description: 'Mã này đã hết hạn, dùng để test logic kiểm tra.',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 50000,
      maxDiscountAmount: 30000,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      usageLimit: 100,
      usedCount: 100,
      isActive: false,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },

    // === MÃ ĐÃ HẾT LƯỢT SỬ DỤNG (ĐỂ TEST) ===
    {
      code: 'SOLDOUT',
      title: 'Mã đã hết lượt - Test',
      description: 'Mã này đã hết lượt sử dụng, dùng để test logic kiểm tra.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 30000,
      minOrderValue: 50000,
      maxDiscountAmount: null,
      startDate: now,
      endDate: nextMonth,
      usageLimit: 50,
      usedCount: 50,
      isActive: true,
      applicableVehicles: ['BIKE', 'VAN', 'TRUCK'],
    },
  ];

  console.log(`📦 Đang import ${promotions.length} khuyến mãi...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const promoData of promotions) {
    try {
      const promotion = new promotionModel(promoData);
      await promotion.save();
      
      const statusIcon = promoData.isActive ? '✅' : '⏸️';
      const typeLabel = promoData.discountType === 'PERCENTAGE' 
        ? `${promoData.discountValue}%` 
        : `${promoData.discountValue.toLocaleString()}đ`;
      
      console.log(`${statusIcon} ${promoData.code.padEnd(15)} - ${promoData.title} (${typeLabel})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Lỗi khi tạo mã ${promoData.code}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`✅ Thành công: ${successCount} khuyến mãi`);
  if (errorCount > 0) {
    console.log(`❌ Lỗi: ${errorCount} khuyến mãi`);
  }
  console.log('========================================\n');

  // Thống kê
  console.log('📊 THỐNG KÊ KHUYẾN MÃI:\n');
  
  const activeCount = await promotionModel.countDocuments({ isActive: true });
  const inactiveCount = await promotionModel.countDocuments({ isActive: false });
  const percentageCount = await promotionModel.countDocuments({ discountType: 'PERCENTAGE' });
  const fixedCount = await promotionModel.countDocuments({ discountType: 'FIXED_AMOUNT' });
  
  console.log(`✅ Đang hoạt động: ${activeCount} mã`);
  console.log(`⏸️  Tạm dừng: ${inactiveCount} mã`);
  console.log(`📊 Giảm theo %: ${percentageCount} mã`);
  console.log(`💰 Giảm cố định: ${fixedCount} mã`);
  
  console.log('\n📋 Phân loại theo loại xe:\n');
  
  const bikeCount = await promotionModel.countDocuments({ applicableVehicles: 'BIKE' });
  const vanCount = await promotionModel.countDocuments({ applicableVehicles: 'VAN' });
  const truckCount = await promotionModel.countDocuments({ applicableVehicles: 'TRUCK' });
  
  console.log(`🏍️  Xe máy (BIKE): ${bikeCount} mã`);
  console.log(`🚙 Xe bán tải (VAN): ${vanCount} mã`);
  console.log(`🚚 Xe tải (TRUCK): ${truckCount} mã`);

  console.log('');
  await app.close();
}

// Chạy script
seedPromotions()
  .then(() => {
    console.log('✅ Hoàn thành import dữ liệu khuyến mãi!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
