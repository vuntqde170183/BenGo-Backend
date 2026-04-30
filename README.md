# BenGo Backend 🚀

Chào mừng bạn đến với hệ thống Backend của **BenGo** - Giải pháp quản lý vận tải và điều phối xe hiện đại. Đây là dự án được xây dựng bằng **NestJS**, cung cấp hệ thống API mạnh mẽ cho các ứng dụng Client, Driver và Admin.

## 🛠 Công nghệ sử dụng

Dự án sử dụng các công nghệ hiện đại nhằm đảm bảo hiệu suất và khả năng mở rộng:

- **Framework:** [NestJS](https://nestjs.com/) (Node.js framework)
- **Language:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) với [Mongoose](https://mongoosejs.com/)
- **Authentication:** Passport.js & JWT
- **Documentation:** [Swagger/OpenAPI](https://swagger.io/)
- **File Storage:** [Cloudinary](https://cloudinary.com/)
- **Payment Gateway:** [Stripe](https://stripe.com/)
- **Email Service:** Nodemailer & Handlebars
- **Task Scheduling:** NestJS Schedule (Cron jobs)
- **Containerization:** Docker & Docker Compose

## ✨ Tính năng chính

- **Quản lý người dùng:** Đăng ký, đăng nhập, phân quyền (Admin, Dispatcher, Driver, Customer).
- **Hệ thống đặt xe (Orders):** Quy trình tạo đơn, điều phối tài xế và theo dõi trạng thái đơn hàng.
- **Điều phối (Dispatcher):** Hệ thống dành cho điều phối viên để quản lý đơn hàng và tài xế.
- **Tài xế (Driver):** Quản lý hồ sơ, nhận chuyến và cập nhật trạng thái vận chuyển.
- **Thanh toán:** Tích hợp thanh toán trực tuyến qua Stripe.
- **Chat:** Hệ thống giao tiếp thời gian thực giữa các bên.
- **Thông báo:** Gửi thông báo đẩy và email cho người dùng.
- **Upload:** Quản lý hình ảnh và tài liệu thông qua Cloudinary.

## 🚀 Bắt đầu

### Điều kiện tiên quyết

- [Node.js](https://nodejs.org/) (phiên bản 18+)
- [pnpm](https://pnpm.io/) hoặc `npm`
- [MongoDB](https://www.mongodb.com/try/download/community) (Local hoặc Atlas)
- Docker (Tùy chọn)

### Cài đặt

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd BenGo-BE
   ```

2. **Cài đặt dependencies:**
   ```bash
   pnpm install
   # hoặc
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` từ file mẫu và điền các thông tin cần thiết:
   ```bash
   cp .env.example .env # Nếu có file example
   ```
   Các biến chính cần lưu ý:
   - `MONGO_URI`: Đường dẫn kết nối MongoDB.
   - `JWT_SECRET`: Khóa bí mật cho JWT.
   - `CLOUDINARY_URL`: Cấu hình lưu trữ ảnh.
   - `STRIPE_SECRET_KEY`: Khóa API Stripe.

### Chạy ứng dụng

- **Chế độ phát triển:**
  ```bash
  npm run start:dev
  ```

- **Chế độ production:**
  ```bash
  npm run build
  npm run start:prod
  ```

- **Sử dụng Docker:**
  ```bash
  docker-compose up -d
  ```

## 📖 Tài liệu API

Sau khi khởi chạy ứng dụng, bạn có thể truy cập tài liệu Swagger tại:
- Local: `http://localhost:3000/api-docs` (Hoặc port bạn đã cấu hình)

## 🗂 Cấu trúc thư mục

```text
src/
├── admin/          # Quản lý dành cho quản trị viên
├── auth/           # Xác thực và phân quyền
├── chat/           # Xử lý hội thoại và tin nhắn
├── dispatcher/     # Module dành cho điều phối viên
├── driver/         # Module quản lý tài xế
├── mail/           # Dịch vụ gửi email và templates
├── orders/         # Quản lý đơn hàng và vận chuyển
├── payment/        # Xử lý thanh toán Stripe
├── upload/         # Xử lý upload file lên Cloudinary
├── user/           # Quản lý thông tin người dùng
├── utils/          # Các tiện ích và thông báo
└── main.ts         # Điểm khởi đầu của ứng dụng
```

## 📜 Các lệnh hữu ích

- `npm run lint`: Kiểm tra lỗi code style.
- `npm run format`: Tự động format code.
- `npm run seed:promotions`: Khởi tạo dữ liệu khuyến mãi.
- `npm run seed:driver`: Khởi tạo dữ liệu tài xế mẫu.
- `npm run seed:chart`: Khởi tạo dữ liệu thống kê biểu đồ.

---
© 2024 BenGo Team. Trân trọng!
