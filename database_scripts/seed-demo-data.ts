
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI not found in .env');
  process.exit(1);
}

// --- Define Schemas ---
const UserSchema = new mongoose.Schema({
  phone: String,
  email: String,
  password: { type: String, select: false },
  name: String,
  role: String,
  walletBalance: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
}, { timestamps: true });

const DriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleType: String,
  plateNumber: String,
  isOnline: { type: Boolean, default: false },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  status: { type: String, default: 'APPROVED' },
  rating: { type: Number, default: 5 },
}, { timestamps: true });

const PricingConfigSchema = new mongoose.Schema({
  vehicleType: String,
  basePrice: Number,
  perKm: Number,
  peakHourMultiplier: Number,
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  driverId: mongoose.Schema.Types.ObjectId,
  pickup: { address: String, lat: Number, lng: Number },
  dropoff: { address: String, lat: Number, lng: Number },
  vehicleType: String,
  status: String,
  totalPrice: Number,
  distanceKm: Number,
  paymentMethod: String,
  paymentStatus: String,
  priority: String,
  goodsImages: [String],
  tags: [String],
}, { timestamps: true });

const PromotionSchema = new mongoose.Schema({
  code: String,
  title: String,
  description: String,
  discountType: String,
  discountValue: Number,
  minOrderValue: Number,
  maxDiscountAmount: Number,
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  applicableVehicles: [String],
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  body: String,
  type: String,
  data: Object,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  participants: [mongoose.Schema.Types.ObjectId],
  lastMessageAt: Date,
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversationId: mongoose.Schema.Types.ObjectId,
  senderId: mongoose.Schema.Types.ObjectId,
  content: String,
  type: { type: String, default: 'TEXT' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const AssignmentHistorySchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  driverId: mongoose.Schema.Types.ObjectId,
  dispatcherId: mongoose.Schema.Types.ObjectId,
  status: String,
  note: String,
}, { timestamps: true });

const SupportTicketSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  orderId: mongoose.Schema.Types.ObjectId,
  subject: String,
  content: String,
  status: String,
  priority: String,
  assignedTo: mongoose.Schema.Types.ObjectId,
  attachments: [String],
  adminNote: String,
  resolution: String,
}, { timestamps: true });

// --- Models ---
const User = mongoose.model('User', UserSchema);
const Driver = mongoose.model('Driver', DriverSchema);
const PricingConfig = mongoose.model('PricingConfig', PricingConfigSchema);
const Order = mongoose.model('Order', OrderSchema);
const Promotion = mongoose.model('Promotion', PromotionSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);
const AssignmentHistory = mongoose.model('AssignmentHistory', AssignmentHistorySchema);
const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // --- CLEANUP ---
    await User.deleteMany({});
    await Driver.deleteMany({});
    await PricingConfig.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await AssignmentHistory.deleteMany({});
    await SupportTicket.deleteMany({});

    const passwordHash = await bcrypt.hash('BenGo123!', 10);

    // 1. SEED USERS
    console.log('Seeding Users...');
    const admin = await User.create({ phone: '0988888888', name: 'Nguyễn Hoàng Nam', email: 'nguyenhoangnam1@gmail.com', password: passwordHash, role: 'ADMIN' });
    const dispatcher = await User.create({ phone: '0977777771', name: 'Trần Minh Tuấn', email: 'tranminhtuan1@gmail.com', password: passwordHash, role: 'DISPATCHER' });

    const c1 = await User.create({ phone: '0912345678', name: 'Phạm Thị Hồng Nhung', email: 'phamthihongnhung1@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 150000 });
    const c2 = await User.create({ phone: '0912345679', name: 'Lê Văn Hoàng', email: 'levanhoang2@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 500000 });
    const c3 = await User.create({ phone: '0912345680', name: 'Nguyễn Bảo Châu', email: 'nguyenbaochau3@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 0 });
    const c4 = await User.create({ phone: '0912345681', name: 'Đặng Minh Khôi', email: 'dangminhkhoi4@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 120000 });
    const c5 = await User.create({ phone: '0912345682', name: 'Hoàng Thị Kim Anh', email: 'hoangthikimanh5@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 350000 });
    const c6 = await User.create({ phone: '0912345683', name: 'Vũ Đức Thịnh', email: 'vuducthinh6@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 80000 });
    const c7 = await User.create({ phone: '0912345684', name: 'Phan Tuyết Mai', email: 'phantuyetmai7@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 200000 });
    const c8 = await User.create({ phone: '0912345685', name: 'Đỗ Hữu Phước', email: 'dohuuphuoc8@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 90000 });
    const c9 = await User.create({ phone: '0912345686', name: 'Bùi Gia Bảo', email: 'buigiabao9@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 600000 });
    const c10 = await User.create({ phone: '0912345687', name: 'Lý Thanh Hà', email: 'lythanhha10@gmail.com', password: passwordHash, role: 'CUSTOMER', walletBalance: 100000 });

    const dU1 = await User.create({ phone: '0905111222', name: 'Nguyễn Văn Mạnh', email: 'nguvenvanmanh1@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU2 = await User.create({ phone: '0905222333', name: 'Trần Hữu Thắng', email: 'tranhuuthang2@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU3 = await User.create({ phone: '0905333444', name: 'Lê Quang Đạo', email: 'lequangdao3@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU4 = await User.create({ phone: '0905444555', name: 'Phạm Thế Vinh', email: 'phamthevinh4@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU5 = await User.create({ phone: '0905555666', name: 'Đặng Văn Hùng', email: 'dangvanhung5@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU6 = await User.create({ phone: '0905666777', name: 'Hoàng Minh Nhật', email: 'hoangminhnhat6@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU7 = await User.create({ phone: '0905777888', name: 'Vũ Anh Tuấn', email: 'vuanhtuan7@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU8 = await User.create({ phone: '0905888999', name: 'Bùi Xuân Trường', email: 'buixuantruong8@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU9 = await User.create({ phone: '0905999000', name: 'Phan Công Thành', email: 'phancongthanh9@gmail.com', password: passwordHash, role: 'DRIVER' });
    const dU10 = await User.create({ phone: '0905000111', name: 'Đỗ Ngọc Sơn', email: 'dongocson10@gmail.com', password: passwordHash, role: 'DRIVER' });

    // 2. SEED DRIVER DETAILS
    console.log('Seeding Driver Details...');
    await Driver.create({ userId: dU1._id, vehicleType: 'BIKE', plateNumber: '43C1-123.45', isOnline: true, location: { coordinates: [108.212, 16.061] }, status: 'APPROVED' });
    await Driver.create({ userId: dU2._id, vehicleType: 'VAN', plateNumber: '43B-012.34', isOnline: true, location: { coordinates: [108.225, 16.058] }, status: 'APPROVED' });
    await Driver.create({ userId: dU3._id, vehicleType: 'TRUCK', plateNumber: '43H-987.65', isOnline: true, location: { coordinates: [108.241, 16.072] }, status: 'APPROVED' });
    await Driver.create({ userId: dU4._id, vehicleType: 'BIKE', plateNumber: '43K1-567.89', isOnline: true, location: { coordinates: [108.201, 16.045] }, status: 'APPROVED' });
    await Driver.create({ userId: dU5._id, vehicleType: 'VAN', plateNumber: '43A-333.33', isOnline: true, location: { coordinates: [108.256, 16.089] }, status: 'APPROVED' });
    await Driver.create({ userId: dU6._id, vehicleType: 'TRUCK', plateNumber: '43D-444.44', isOnline: true, location: { coordinates: [108.218, 16.023] }, status: 'APPROVED' });
    await Driver.create({ userId: dU7._id, vehicleType: 'BIKE', plateNumber: '43G1-111.11', isOnline: true, location: { coordinates: [108.272, 16.112] }, status: 'APPROVED' });
    await Driver.create({ userId: dU8._id, vehicleType: 'VAN', plateNumber: '43E-222.22', isOnline: true, location: { coordinates: [108.189, 16.067] }, status: 'APPROVED' });
    await Driver.create({ userId: dU9._id, vehicleType: 'TRUCK', plateNumber: '43F-555.55', isOnline: true, location: { coordinates: [108.234, 16.012] }, status: 'APPROVED' });
    await Driver.create({ userId: dU10._id, vehicleType: 'BIKE', plateNumber: '43L1-999.99', isOnline: true, location: { coordinates: [108.215, 16.065] }, status: 'APPROVED' });

    // 3. PRICING CONFIG
    console.log('Seeding Pricing...');
    await PricingConfig.create({ vehicleType: 'BIKE', basePrice: 15000, perKm: 5000, peakHourMultiplier: 1.2 });
    await PricingConfig.create({ vehicleType: 'VAN', basePrice: 50000, perKm: 12000, peakHourMultiplier: 1.5 });
    await PricingConfig.create({ vehicleType: 'TRUCK', basePrice: 100000, perKm: 20000, peakHourMultiplier: 1.5 });

    // 4. PROMOTIONS
    console.log('Seeding Promotions...');
    await Promotion.create({ code: 'BENGONEW', title: 'Ưu đãi bạn mới', description: 'Giảm 20% cho đơn hàng đầu tiên', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'DANANG2026', title: 'Chào Đà Nẵng', description: 'Giảm 10k cho các chuyến đi tại Đà Nẵng', discountType: 'FIXED_AMOUNT', discountValue: 10000, minOrderValue: 50000, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'FREESHIP', title: 'Miễn phí giao hàng', description: 'Hỗ trợ 20k phí ship cho đơn trên 100k', discountType: 'FIXED_AMOUNT', discountValue: 20000, minOrderValue: 100000, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'GIAMSAU', title: 'Giảm giá sâu cuối tuần', description: 'Giảm 15% vào thứ 7 và chủ nhật', discountType: 'PERCENTAGE', discountValue: 15, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'XEOMANTOAN', title: 'Chuyến xe an toàn', description: 'Giảm 5% khi đặt xe máy', discountType: 'PERCENTAGE', discountValue: 5, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'TIETKIEM', title: 'Giao hàng tiết kiệm', description: 'Giảm 10% phí dịch vụ', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'TRIAN2026', title: 'Tri ân khách hàng', description: 'Giảm 30k cho khách hàng thân thiết', discountType: 'FIXED_AMOUNT', discountValue: 30000, minOrderValue: 200000, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'GOIBENGO', title: 'Gói BenGo Pro', description: 'Giảm 10% trọn đời', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'SIEUXE', title: 'Siêu xe tải BenGo', description: 'Giảm 50k cho đơn xe tải', discountType: 'FIXED_AMOUNT', discountValue: 50000, minOrderValue: 500000, startDate: new Date(), endDate: new Date('2026-12-31') });
    await Promotion.create({ code: 'HOLIDAY', title: 'Mừng đại lễ', description: 'Giảm 25% toàn bộ dịch vụ', discountType: 'PERCENTAGE', discountValue: 25, minOrderValue: 0, startDate: new Date(), endDate: new Date('2026-12-31') });

    // 5. ORDERS (DETAILED ADDRESSES)
    console.log('Seeding Orders with detailed addresses...');
    const o1 = await Order.create({ customerId: c1._id, driverId: dU1._id, pickup: { address: 'Số 123, Đường Nguyễn Văn Linh, Phường Vĩnh Trung, Quận Thanh Khê, Thành phố Đà Nẵng', lat: 16.061, lng: 108.212 }, dropoff: { address: 'Cổng số 1, Sân bay Quốc tế Đà Nẵng, Phường Hòa Thuận Tây, Quận Hải Châu, Thành phố Đà Nẵng', lat: 16.047, lng: 108.199 }, vehicleType: 'BIKE', status: 'DELIVERED', totalPrice: 25000, distanceKm: 2.5, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o2 = await Order.create({ customerId: c2._id, driverId: dU2._id, pickup: { address: 'Ký túc xá DMC, Đường Nam Kỳ Khởi Nghĩa, Phường Hòa Quý, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng', lat: 15.992, lng: 108.261 }, dropoff: { address: 'Chợ Cồn, 290 Hùng Vương, Phường Vĩnh Trung, Quận Thanh Khê, Thành phố Đà Nẵng', lat: 16.065, lng: 108.212 }, vehicleType: 'VAN', status: 'DELIVERED', totalPrice: 155000, distanceKm: 11.2, paymentMethod: 'WALLET', paymentStatus: 'PAID' });
    const o3 = await Order.create({ customerId: c3._id, driverId: dU3._id, pickup: { address: 'Tầng 2, Tòa nhà Indochina Riverside, 74 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng', lat: 16.071, lng: 108.225 }, dropoff: { address: 'Lô 12, Khu đô thị FPT City, Phường Hòa Hải, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng', lat: 15.942, lng: 108.261 }, vehicleType: 'TRUCK', status: 'DELIVERED', totalPrice: 320000, distanceKm: 14.5, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o4 = await Order.create({ customerId: c4._id, driverId: dU4._id, pickup: { address: 'Trường Đại học Bách Khoa, 54 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng', lat: 16.075, lng: 108.153 }, dropoff: { address: 'Siêu thị Go!, 255-257 Hùng Vương, Phường Vĩnh Trung, Quận Thanh Khê, Đà Nẵng', lat: 16.062, lng: 108.212 }, vehicleType: 'BIKE', status: 'DELIVERED', totalPrice: 35000, distanceKm: 4.8, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o5 = await Order.create({ customerId: c5._id, driverId: dU5._id, pickup: { address: 'Số 78, Đường Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, Thành phố Đà Nẵng', lat: 16.058, lng: 108.245 }, dropoff: { address: 'Sun World Đà Nẵng Wonders, Số 1 Phan Đăng Lưu, Phường Hòa Cường Bắc, Quận Hải Châu, Đà Nẵng', lat: 16.038, lng: 108.225 }, vehicleType: 'VAN', status: 'DELIVERED', totalPrice: 130000, distanceKm: 6.5, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o6 = await Order.create({ customerId: c6._id, driverId: dU6._id, pickup: { address: 'Bến xe Trung tâm Đà Nẵng, 185 Tôn Đức Thắng, Phường Hòa Minh, Quận Liên Chiểu, Đà Nẵng', lat: 16.051, lng: 108.169 }, dropoff: { address: 'Vincom Plaza Đà Nẵng, 910A Ngô Quyền, Phường An Hải Bắc, Quận Sơn Trà, Đà Nẵng', lat: 16.075, lng: 108.231 }, vehicleType: 'TRUCK', status: 'DELIVERED', totalPrice: 280000, distanceKm: 9.0, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o7 = await Order.create({ customerId: c7._id, driverId: dU7._id, pickup: { address: 'Bệnh viện Đa khoa Đà Nẵng, 124 Hải Phòng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', lat: 16.065, lng: 108.213 }, dropoff: { address: 'Ga Đà Nẵng, 791 Hải Phòng, Phường Tam Thuận, Quận Thanh Khê, Thành phố Đà Nẵng', lat: 16.069, lng: 108.209 }, vehicleType: 'BIKE', status: 'DELIVERED', totalPrice: 20000, distanceKm: 1.2, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o8 = await Order.create({ customerId: c8._id, driverId: dU8._id, pickup: { address: 'Cảng Tiên Sa, Đường Yết Kiêu, Phường Thọ Quang, Quận Sơn Trà, Thành phố Đà Nẵng', lat: 16.121, lng: 108.219 }, dropoff: { address: 'Khu công nghiệp Hòa Cầm, Phường Hòa Thọ Tây, Quận Cẩm Lệ, Thành phố Đà Nẵng', lat: 15.992, lng: 108.189 }, vehicleType: 'VAN', status: 'DELIVERED', totalPrice: 180000, distanceKm: 18.0, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o9 = await Order.create({ customerId: c9._id, driverId: dU9._id, pickup: { address: 'Đại học Duy Tân, 254 Nguyễn Văn Linh, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng', lat: 16.055, lng: 108.211 }, dropoff: { address: 'Lotte Mart Đà Nẵng, 06 Nại Nam, Phường Hòa Cường Bắc, Quận Hải Châu, Đà Nẵng', lat: 16.035, lng: 108.225 }, vehicleType: 'TRUCK', status: 'DELIVERED', totalPrice: 240000, distanceKm: 5.5, paymentMethod: 'CASH', paymentStatus: 'PAID' });
    const o10 = await Order.create({ customerId: c10._id, driverId: dU10._id, pickup: { address: 'Khu vực Bãi biển Mỹ Khê, Đường Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng', lat: 16.058, lng: 108.245 }, dropoff: { address: 'Cầu Rồng Đà Nẵng, Đường Nguyễn Văn Linh, Phường Phước Ninh, Quận Hải Châu, Đà Nẵng', lat: 16.061, lng: 108.227 }, vehicleType: 'BIKE', status: 'DELIVERED', totalPrice: 30000, distanceKm: 3.0, paymentMethod: 'CASH', paymentStatus: 'PAID' });

    // 6. ASSIGNMENT HISTORY
    console.log('Seeding Assignment History...');
    await AssignmentHistory.create({ orderId: o1._id, driverId: dU1._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Phân phối tự động dựa trên vị trí gần nhất' });
    await AssignmentHistory.create({ orderId: o2._id, driverId: dU2._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Tài xế đã xác nhận đơn hàng sau 30 giây' });
    await AssignmentHistory.create({ orderId: o3._id, driverId: dU3._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Đơn hàng xe tải yêu cầu kích thước thùng lớn' });
    await AssignmentHistory.create({ orderId: o4._id, driverId: dU4._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Khách hàng yêu cầu tài xế có đánh giá 5 sao' });
    await AssignmentHistory.create({ orderId: o5._id, driverId: dU5._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Giao tài xế chuyên chở hàng dễ vỡ' });
    await AssignmentHistory.create({ orderId: o6._id, driverId: dU6._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Đơn hàng ưu tiên từ bến xe' });
    await AssignmentHistory.create({ orderId: o7._id, driverId: dU7._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Chuyến xe ngắn nội thành' });
    await AssignmentHistory.create({ orderId: o8._id, driverId: dU8._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Hợp đồng vận chuyển khu công nghiệp' });
    await AssignmentHistory.create({ orderId: o9._id, driverId: dU9._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Hỗ trợ bốc xếp hàng hóa cồng kềnh' });
    await AssignmentHistory.create({ orderId: o10._id, driverId: dU10._id, dispatcherId: dispatcher._id, status: 'SUCCESS', note: 'Khách du lịch đặt xe đi tắm biển' });

    // 7. CONVERSATIONS & MESSAGES
    console.log('Seeding Real Chats...');
    const cv1 = await Conversation.create({ orderId: o1._id, participants: [c1._id, dU1._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv1._id, senderId: c1._id, content: 'Chào bạn, bạn sắp tới chưa?' });
    await Message.create({ conversationId: cv1._id, senderId: dU1._id, content: 'Dạ em đang đứng trước số 123 Nguyễn Văn Linh rồi ạ.' });

    const cv2 = await Conversation.create({ orderId: o2._id, participants: [c2._id, dU2._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv2._id, senderId: c2._id, content: 'Bạn ơi, hàng hơi nặng, bạn có hỗ trợ bốc lên lầu không?' });
    await Message.create({ conversationId: cv2._id, senderId: dU2._id, content: 'Dạ có ạ, phí bốc xếp mình thỏa thuận thêm nhé.' });

    const cv3 = await Conversation.create({ orderId: o3._id, participants: [c3._id, dU3._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv3._id, senderId: c3._id, content: 'Đồ gỗ dễ trầy xước, bạn cẩn thận giúp mình.' });
    await Message.create({ conversationId: cv3._id, senderId: dU3._id, content: 'Dạ anh yên tâm, xe em có trang bị đệm lót đầy đủ ạ.' });

    const cv4 = await Conversation.create({ orderId: o4._id, participants: [c4._id, dU4._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv4._id, senderId: c4._id, content: 'Mình đang ở cổng chính Bách Khoa nhé.' });
    await Message.create({ conversationId: cv4._id, senderId: dU4._id, content: 'Dạ em đang rẽ vào, chị đợi em 1 phút.' });

    const cv5 = await Conversation.create({ orderId: o5._id, participants: [c5._id, dU5._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv5._id, senderId: c5._id, content: 'Đường Võ Nguyên Giáp hơi tắc, bạn đi đường khác được không?' });
    await Message.create({ conversationId: cv5._id, senderId: dU5._id, content: 'Dạ em đang đi đường tắt qua Ngũ Hành Sơn cho nhanh ạ.' });

    const cv6 = await Conversation.create({ orderId: o6._id, participants: [c6._id, dU6._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv6._id, senderId: c6._id, content: 'Hàng đã sẵn sàng bốc lên xe chưa bạn?' });
    await Message.create({ conversationId: cv6._id, senderId: dU6._id, content: 'Dạ em đang lùi xe vào bến, xong ngay đây ạ.' });

    const cv7 = await Conversation.create({ orderId: o7._id, participants: [c7._id, dU7._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv7._id, senderId: c7._id, content: 'Bạn đi cẩn thận nhé, mình chở thuốc men quan trọng.' });
    await Message.create({ conversationId: cv7._id, senderId: dU7._id, content: 'Dạ em biết rồi, em sẽ đi chậm và an toàn ạ.' });

    const cv8 = await Conversation.create({ orderId: o8._id, participants: [c8._id, dU8._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv8._id, senderId: c8._id, content: 'Khi nào tới khu công nghiệp gọi mình đón ở cổng số 2.' });
    await Message.create({ conversationId: cv8._id, senderId: dU8._id, content: 'Vâng ạ, em còn cách khoảng 2km nữa.' });

    const cv9 = await Conversation.create({ orderId: o9._id, participants: [c9._id, dU9._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv9._id, senderId: c9._id, content: 'Xe của bạn là xe mấy tấn vậy?' });
    await Message.create({ conversationId: cv9._id, senderId: dU9._id, content: 'Dạ xe em 3.5 tấn, thùng dài 4m ạ.' });

    const cv10 = await Conversation.create({ orderId: o10._id, participants: [c10._id, dU10._id], lastMessageAt: new Date() });
    await Message.create({ conversationId: cv10._id, senderId: c10._id, content: 'Mình ra tới cổng Vincom rồi, thấy bạn rồi nhé.' });
    await Message.create({ conversationId: cv10._id, senderId: dU10._id, content: 'Dạ em đây ạ, chào chị.' });

    // 8. SUPPORT TICKETS
    console.log('Seeding Support Tickets...');
    await SupportTicket.create({ userId: c1._id, orderId: o1._id, subject: 'Khiếu nại hư hỏng hàng hóa', content: 'Thùng hàng bị móp méo khi giao tới, yêu cầu bồi thường bảo hiểm.', status: 'OPEN', priority: 'HIGH', assignedTo: admin._id });
    await SupportTicket.create({ userId: c2._id, orderId: o2._id, subject: 'Phản ánh thái độ tài xế', content: 'Tài xế có thái độ không đúng mực khi khách hàng hỏi về phí bốc xếp.', status: 'IN_PROGRESS', priority: 'MEDIUM', assignedTo: admin._id });
    await SupportTicket.create({ userId: c3._id, orderId: o3._id, subject: 'Yêu cầu xuất hóa đơn đỏ', content: 'Mình cần xuất hóa đơn cho đơn hàng vận chuyển đồ gỗ văn phòng.', status: 'RESOLVED', priority: 'LOW', assignedTo: admin._id, resolution: 'Đã gửi hóa đơn điện tử qua email khách hàng.' });
    await SupportTicket.create({ userId: c4._id, orderId: o4._id, subject: 'Lỗi nạp tiền ví BenGo', status: 'CLOSED', priority: 'HIGH', content: 'Tôi đã chuyển khoản 200k nhưng số dư ví vẫn chưa cập nhật.', assignedTo: admin._id, resolution: 'Đã cập nhật số dư sau khi kiểm soát giao dịch ngân hàng.' });
    await SupportTicket.create({ userId: c5._id, orderId: o5._id, subject: 'Góp ý về giao diện ứng dụng', content: 'Nút đặt xe đôi khi bị lag trên điện thoại Android cũ.', status: 'OPEN', priority: 'LOW', assignedTo: admin._id });
    await SupportTicket.create({ userId: c6._id, orderId: o6._id, subject: 'Hỏi về quy trình bảo hiểm', content: 'Tôi muốn biết nếu hàng bị mất thì quy trình bồi thường như thế nào.', status: 'OPEN', priority: 'MEDIUM', assignedTo: admin._id });
    await SupportTicket.create({ userId: c7._id, orderId: o7._id, subject: 'Báo cáo mất đồ', content: 'Sau khi nhận hàng, tôi phát hiện thiếu 1 túi nhỏ trong thùng lớn.', status: 'OPEN', priority: 'URGENT', assignedTo: admin._id });
    await SupportTicket.create({ userId: c8._id, orderId: o8._id, subject: 'Sai sót về quãng đường', content: 'Ứng dụng tính 18km nhưng Google Maps chỉ báo 15km.', status: 'OPEN', priority: 'MEDIUM', assignedTo: admin._id });
    await SupportTicket.create({ userId: c9._id, orderId: o9._id, subject: 'Đề xuất thêm loại xe container', content: 'Doanh nghiệp tôi cần xe container để vận chuyển hàng cảng.', status: 'OPEN', priority: 'LOW', assignedTo: admin._id });
    await SupportTicket.create({ userId: c10._id, orderId: o10._id, subject: 'Yêu cầu hoàn trả mã khuyến mãi', content: 'Tôi đặt đơn bị hủy nhưng mã khuyến mãi không được hoàn lại.', status: 'OPEN', priority: 'MEDIUM', assignedTo: admin._id });

    // 9. NOTIFICATIONS
    console.log('Seeding Notifications...');
    await Notification.create({ userId: c1._id, title: 'Đơn hàng hoàn thành', body: 'Cảm ơn bạn đã sử dụng BenGo. Đơn hàng từ Nguyễn Văn Linh đã giao thành công.', type: 'ORDER_COMPLETED' });
    await Notification.create({ userId: c2._id, title: 'Khuyến mãi mới!', body: 'Nhận ngay mã GIAMSAU giảm 15% cho chuyến đi cuối tuần này.', type: 'PROMOTION' });
    await Notification.create({ userId: c3._id, title: 'Cảnh báo số dư ví', body: 'Số dư ví của bạn hiện tại là 0đ. Vui lòng nạp thêm để tiếp tục sử dụng dịch vụ.', type: 'SYSTEM' });
    await Notification.create({ userId: c4._id, title: 'Tài xế đang tới', body: 'Tài xế Nguyễn Văn Mạnh đang trên đường đến điểm đón bạn.', type: 'ORDER_UPDATE' });
    await Notification.create({ userId: c5._id, title: 'Bạn nhận được 50k', body: 'Hệ thống đã hoàn trả 50k phí dịch vụ do đơn hàng gặp sự cố.', type: 'WALLET_UPDATE' });
    await Notification.create({ userId: c6._id, title: 'Nhắc nhở đánh giá', body: 'Hãy dành 30 giây để đánh giá tài xế Hoàng Minh Nhật nhé.', type: 'INFO' });
    await Notification.create({ userId: c7._id, title: 'Đăng ký tài xế thành công', body: 'Chào mừng bạn đến với cộng đồng tài xế BenGo!', type: 'SYSTEM' });
    await Notification.create({ userId: c8._id, title: 'Mã giảm giá sắp hết hạn', body: 'Mã FREESHIP của bạn sẽ hết hạn vào ngày mai. Sử dụng ngay!', type: 'PROMOTION' });
    await Notification.create({ userId: c9._id, title: 'Hỗ trợ đã được phản hồi', body: 'Yêu cầu khiếu nại của bạn đã có câu trả lời từ quản trị viên.', type: 'SUPPORT' });
    await Notification.create({ userId: c10._id, title: 'Cập nhật ứng dụng', body: 'Phiên bản BenGo 2.0 đã sẵn sàng với nhiều tính năng mới.', type: 'SYSTEM' });

    console.log('--- ALL DATA SEEDED WITH DETAILED ADDRESSES ---');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
