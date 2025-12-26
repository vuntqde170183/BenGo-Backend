import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bengo';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('drivers').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('pricingconfigs').deleteMany({});
    await db.collection('supporttickets').deleteMany({});

    // 2. Create Admin
    console.log('Creating Admin...');
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await db.collection('users').insertOne({
      phone: '0988888888',
      email: 'adminbengo@gmail.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      walletBalance: 1000000,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Create Dispatchers
    console.log('Creating Dispatchers...');
    const dispatcherPassword = await bcrypt.hash('Dispatcher123!', 10);
    const dispatchers = [];
    for (let i = 1; i <= 5; i++) {
        dispatchers.push({
            phone: `097777777${i}`,
            email: `dispatcherbengo${i}@gmail.com`,
            password: dispatcherPassword,
            name: `Dispatcher ${i}`,
            role: 'DISPATCHER',
            walletBalance: 0,
            rating: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    await db.collection('users').insertMany(dispatchers);

    // 4. Create Customers (25 rows)
    console.log('Creating Customers (25 rows)...');
    const customerPassword = await bcrypt.hash('Customer123!', 10);
    const customerNames = [
        'Nguyen Ngoc Ha Vy', 'Tran Thi Thu Thao', 'Pham My Linh Nhi', 
        'Le Hoang Yen Nhi', 'Vo Ngoc Tu Anh', 'Ngo Thi Minh Chau', 
        'Doan Khanh An Nhien', 'Dang Thuy Thanh Truc', 'Bui Hoang Cat Tuong', 
        'Vu Ngoc Lan Huong', 'Nguyen Thi Tuyet Mai', 'Tran Hoang Bao Ngoc',
        'Pham Thi Hong Hanh', 'Le Thi Thanh Thuy', 'Hoang Ngoc Diep Lang',
        'Dang Thu Huyen My', 'Trinh Thi My Tam', 'Phan Kim Oanh Kieu',
        'Ly Thi Phuong Thao', 'Quach Thu Trang Anh', 'Duong Thi Ngoc Lan',
        'Bui Thi Minh Nguyet', 'Vu Thi Kim Chi', 'Nguyen Hoang Phuong Uyen',
        'Tran Mai Thanh Hang'
    ];
    
    const customerIds = [];
    const customerDocs = [];
    for (let i = 0; i < customerNames.length; i++) {
        const id = new mongoose.Types.ObjectId();
        customerIds.push(id);
        const nameNoMark = customerNames[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        const email = nameNoMark.toLowerCase().replace(/\s+/g, '') + '@gmail.com';
        
        customerDocs.push({
            _id: id,
            phone: `090${(i + 1).toString().padStart(7, '0')}`,
            email: email,
            password: customerPassword,
            name: customerNames[i],
            role: 'CUSTOMER',
            walletBalance: 500000 + (Math.random() * 1000000),
            rating: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    await db.collection('users').insertMany(customerDocs);

    // 5. Create Drivers (25 rows)
    console.log('Creating Drivers (25 rows)...');
    const driverPassword = await bcrypt.hash('Driver123!', 10);
    const driverNames = [
        'Nguyen Hoang Truong Van', 'Pham Minh Duc Anh', 'Tran Quang Huy Hoang',
        'Le Kim Thanh Nam', 'Vo Duy Manh Cuong', 'Ngo Thanh Tung Lam',
        'Doan Quoc Bao Viet', 'Dang Khoi Nguyen Khang', 'Bui Xuan Vinh Phat',
        'Vu Hoai Phuong Dong', 'Nguyen Van Thanh Tung', 'Tran Hoai Nam Son',
        'Pham Quoc Huy Cuong', 'Le Anh Tuan Minh', 'Hoang Minh Tri Dung',
        'Dang Van Quang Huy', 'Trinh Hoang Long Quan', 'Phan Thanh Hai Dang',
        'Ly Minh Hoang Phuc', 'Quach Gia Bao An', 'Duong Quoc Thang Loi',
        'Bui Duc Anh Tuan', 'Vu Thanh Binh Minh', 'Nguyen Huu Phuc Khang',
        'Tran Van Manh Hung'
    ];
    
    const vehicles = ['BIKE', 'VAN', 'TRUCK'];
    const driverIds = [];
    const driverUserDocs = [];
    const driverProfileDocs = [];

    for (let i = 0; i < driverNames.length; i++) {
        const userId = new mongoose.Types.ObjectId();
        const driverId = new mongoose.Types.ObjectId();
        driverIds.push({ userId, driverId });

        const nameNoMark = driverNames[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        const email = nameNoMark.toLowerCase().replace(/\s+/g, '') + '@gmail.com';

        driverUserDocs.push({
            _id: userId,
            phone: `091${(i + 1).toString().padStart(7, '0')}`,
            email: email,
            password: driverPassword,
            name: driverNames[i],
            role: 'DRIVER',
            walletBalance: Math.random() * 500000,
            rating: 4.0 + (Math.random() * 1.0),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        driverProfileDocs.push({
            _id: driverId,
            userId: userId,
            vehicleType: vehicles[i % 3],
            plateNumber: `${29 + (i % 70)}A-${Math.floor(10000 + Math.random() * 90000)}`,
            licenseImages: ['https://placehold.co/600x400?text=License+Front', 'https://placehold.co/600x400?text=License+Back'],
            isOnline: Math.random() > 0.3,
            location: {
                type: 'Point',
                coordinates: [105.7 + (Math.random() * 0.3), 20.9 + (Math.random() * 0.3)], // Expanded Around Hanoi
            },
            status: 'APPROVED',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    await db.collection('users').insertMany(driverUserDocs);
    await db.collection('drivers').insertMany(driverProfileDocs);

    // 6. Create Pricing Configs
    console.log('Creating Pricing Configs...');
    const pricingData = [
        { vehicleType: 'BIKE', basePrice: 15000, perKm: 5000, peakHourMultiplier: 1.2 },
        { vehicleType: 'VAN', basePrice: 50000, perKm: 12000, peakHourMultiplier: 1.5 },
        { vehicleType: 'TRUCK', basePrice: 100000, perKm: 18000, peakHourMultiplier: 1.8 },
    ];
    await db.collection('pricingconfigs').insertMany(pricingData.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
    })));

    // 7. Create Orders (30 rows)
    console.log('Creating Sample Orders (30 rows)...');
    const orderStatuses = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];
    const orderDocs = [];
    for (let i = 0; i < 30; i++) {
        const customerId = customerIds[i % customerIds.length];
        const driverId = driverIds[i % driverIds.length].userId;
        const status = orderStatuses[i % orderStatuses.length];
        
        orderDocs.push({
            customerId: customerId,
            driverId: status === 'PENDING' ? null : driverId,
            pickup: {
                address: `Pickup Address ${i + 1}, Hanoi`,
                lat: 21.0244 + (Math.random() * 0.05),
                lng: 105.8587 + (Math.random() * 0.05)
            },
            dropoff: {
                address: `Dropoff Address ${i + 1}, Hanoi`,
                lat: 21.0583 + (Math.random() * 0.05),
                lng: 105.8233 + (Math.random() * 0.05)
            },
            vehicleType: vehicles[i % 3],
            status: status,
            totalPrice: 50000 + Math.floor(Math.random() * 200000),
            distanceKm: 2 + (Math.random() * 10),
            paymentMethod: i % 4 === 0 ? 'WALLET' : 'CASH',
            paymentStatus: status === 'DELIVERED' ? 'PAID' : 'UNPAID',
            goodsImages: [`https://placehold.co/600x400?text=Package+${i + 1}`],
            createdAt: new Date(Date.now() - (i * 3600000)), // Spread over time
            updatedAt: new Date(),
        });
    }
    await db.collection('orders').insertMany(orderDocs);

    // 8. Create Support Tickets (25 rows)
    console.log('Creating Support Tickets (25 rows)...');
    const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const ticketDocs = [];
    for (let i = 0; i < 25; i++) {
        ticketDocs.push({
            userId: customerIds[i % customerIds.length],
            subject: `Issue #${i + 1}: ${['Late delivery', 'Application bug', 'Driver behavior', 'Payment failure', 'Lost item'][i % 5]}`,
            content: `Description for ticket ${i + 1}. This is a sample support request content.`,
            status: ticketStatuses[i % ticketStatuses.length],
            priority: priorities[i % priorities.length],
            createdAt: new Date(Date.now() - (i * 7200000)),
            updatedAt: new Date(),
        });
    }
    await db.collection('supporttickets').insertMany(ticketDocs);

    console.log('Seeding completed successfully! 🚀');
    console.log('-----------------------------------');
    console.log('Summary:');
    console.log('- Users: > 50 (Admin, 5 Dispatchers, 25 Customers, 25 Drivers)');
    console.log('- Drivers Profile: 25 rows');
    console.log('- Orders: 30 rows');
    console.log('- Support Tickets: 25 rows');
    console.log('- Pricing Configs: 3 rows (Configuration)');
    console.log('-----------------------------------');
    console.log('Main accounts:');
    console.log('ADMIN: adminbengo@gmail.com / Admin123!');
    console.log('DISPATCHER: dispatcherbengo1@gmail.com / Dispatcher123!');
    console.log('Check seed file for full list of DRIVER/CUSTOMER email patterns.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
