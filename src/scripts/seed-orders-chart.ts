import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../orders/orders.schema';
import { User } from '../user/user.schema';
import { Driver } from '../driver/driver.schema';

async function seedOrdersForChart() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const orderModel = app.get<Model<Order>>(getModelToken(Order.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const driverModel = app.get<Model<Driver>>(getModelToken(Driver.name));

  console.log('\n========================================');
  console.log('📊 SEED DỮ LIỆU ĐƠN HÀNG CHO BIỂU ĐỒ');
  console.log('========================================\n');

  // 1. Lấy thông tin khách hàng và tài xế để tạo đơn
  const customer = await userModel.findOne({ role: 'CUSTOMER' });
  const drivers = await driverModel.find({ status: 'APPROVED' }).limit(5);

  if (!customer || drivers.length === 0) {
    console.log('❌ Lỗi: Cần có ít nhất 1 Customer và 1 Driver APPROVED trong DB để seed đơn hàng.');
    console.log('💡 Hãy chạy "npm run seed" trước để có dữ liệu cơ bản.');
    await app.close();
    return;
  }

  // 2. Định nghĩa các loại xe và giá trung bình
  const vehicleTypes = ['BIKE', 'VAN', 'TRUCK'];
  const basePrices = { BIKE: 25000, VAN: 150000, TRUCK: 350000 };

  // 3. Tạo dữ liệu cho 7 ngày gần đây (tính từ 20/01/2026 lùi lại)
  const targetDate = new Date('2026-01-20T10:00:00.000Z');
  console.log(`📅 Bắt đầu seed đơn hàng từ ngày ${targetDate.toISOString().split('T')[0]} trở về trước...\n`);

  let totalSeeded = 0;

  for (let i = 0; i < 14; i++) { // Seed 14 ngày để dashboard và chart đều đẹp
    const currentDate = new Date(targetDate);
    currentDate.setDate(currentDate.getDate() - i);
    
    // Mỗi ngày tạo từ 3-8 đơn hàng ngẫu nhiên
    const ordersPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let j = 0; j < ordersPerDay; j++) {
      const vType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const randomPrice = basePrices[vType] + Math.floor(Math.random() * 50000);
      const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
      
      // Ngẫu nhiên giờ trong ngày
      const orderTime = new Date(currentDate);
      orderTime.setHours(Math.floor(Math.random() * 14) + 7, Math.floor(Math.random() * 60));

      const newOrder = new orderModel({
        customerId: customer._id,
        driverId: randomDriver.userId,
        pickup: {
          address: 'Điểm đi ngẫu nhiên ' + j,
          lat: 10.762622 + (Math.random() - 0.5) * 0.1,
          lng: 106.660172 + (Math.random() - 0.5) * 0.1,
        },
        dropoff: {
          address: 'Điểm đến ngẫu nhiên ' + j,
          lat: 10.762622 + (Math.random() - 0.5) * 0.1,
          lng: 106.660172 + (Math.random() - 0.5) * 0.1,
        },
        vehicleType: vType,
        status: 'DELIVERED',
        totalPrice: randomPrice,
        distanceKm: Math.floor(Math.random() * 15) + 2,
        paymentMethod: Math.random() > 0.3 ? 'CASH' : 'WALLET',
        paymentStatus: 'PAID',
        createdAt: orderTime,
        updatedAt: orderTime,
      });

      await newOrder.save();
      totalSeeded++;
    }
    console.log(`✅ Đã tạo đơn cho ngày ${currentDate.toISOString().split('T')[0]}`);
  }

  console.log('\n========================================');
  console.log(`✨ Hoàn tất! Đã tạo tổng cộng ${totalSeeded} đơn hàng.`);
  console.log('========================================\n');

  await app.close();
}

seedOrdersForChart()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
