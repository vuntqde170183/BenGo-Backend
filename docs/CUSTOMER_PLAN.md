# BenGo - Thiết kế Giao diện Mobile App Khách hàng (React Native)

Tài liệu này chi tiết cấu trúc giao diện, các thành phần UI, luồng người dùng và tích hợp API cho ứng dụng Mobile phía Khách hàng (Customer).

---

## 1. Cấu trúc Điều hướng chính (Main Navigation)

Ứng dụng sử dụng **Bottom Tab Navigator** với phong cách thiết kế hiện đại, bo góc mềm mại:

| Tab | Icon | Chức năng chính | Màn hình khởi đầu |
| :--- | :--- | :--- | :--- |
| **Trang chủ** | `home` | Đặt đơn & Tìm kiếm | `CustomerHomeScreen` |
| **Hoạt động** | `receipt` | Theo dõi đơn & Lịch sử | `OrderHistoryScreen` |
| **Thông báo** | `notifications`| Cập nhật trạng thái đơn | `NotificationScreen` |
| **Tài khoản** | `person` | Hồ sơ & Ví tiền | `CustomerProfileScreen` |

---

## 2. Chi tiết Màn hình & Luồng Hoạt động (App Flow)

### 2.1. Phân vùng: Trang chủ & Đặt đơn (Core Flow)

#### A. Màn hình Trang chủ (`CustomerHomeScreen`)
- **Thành phần:**
    1. **Bản đồ nền (Background Map):** Hiển thị các tài xế xung quanh dưới dạng icon xe di chuyển real-time.
    2. **Thanh tìm kiếm (Search Bar):** "Bạn muốn giao hàng đến đâu?" - Nổi trên bản đồ, bo tròn.
    3. **Shortcut địa chỉ:** Các nút bấm nhanh: "Nhà riêng", "Công ty", "Địa chỉ đã lưu".
    4. **Promotion Slider:** Banner các chương trình khuyến mãi đang diễn ra.
- **API sử dụng:** 
  - `GET /orders/drivers-nearby`: Lấy vị trí tài xế xung quanh để hiển thị trên bản đồ.
  Lấy danh sách tài xế xung quanh (GET /orders/drivers-nearby)
   - Params: ?lat=10.76&lng=106.66&radius=5
   - Response Data:
     [
       {
         "id": "60d0fe...",
         "vehicleType": "VAN",
         "location": { "lat": 10.762, "lng": 106.660 },
         "rating": 4.8
       }
     ]

#### B. Màn hình Nhập địa chỉ & Chọn dịch vụ (`BookingSetupScreen`)
- **Luồng:** Xuất hiện sau khi click vào thanh tìm kiếm.
- **Thành phần:**
    1. **Địa điểm:** 
        - Nhập điểm lấy hàng.
        - Nhập điểm giao hàng.
    2. **Thông tin hàng hóa:**
        - Tên hàng hóa (Input).
        - Khối lượng (kg) (Input số).
        - Ghi chú cho tài xế (VD: "Hàng dễ vỡ", "Gọi trước khi đến").
        - Hình ảnh hàng hóa (Nút upload/chụp ảnh).
    3. **Chọn loại xe (Vehicle Selector):** 
        - Danh sách: Xe máy (BIKE), Xe bán tải (VAN), Xe tải (TRUCK).
        - Hệ thống tính **Giá tạm tính** (Estimated Price) ngay khi chọn loại xe.
    4. **Nút "TẠO ĐƠN":** Gửi yêu cầu lên hệ thống.
- **API sử dụng:** 
  - `POST /orders/estimate`: Tính toán giá cước dựa trên khoảng cách và loại xe.
  - `GET /admin/promotions`: Lấy danh sách mã giảm giá khả dụng.

#### C. Màn hình Theo dõi đơn hàng (`TrackOrderScreen`)
- **Luồng:** Sau khi nhấn "TẠO ĐƠN" và có tài xế nhận.
- **Thành phần:**
    1. **Bản đồ Live:** Vị trí tài xế di chuyển real-time hướng về điểm lấy/giao.
    2. **Thông tin tài xế:** Hiển thị rõ:
        - Tên tài xế.
        - Số điện thoại (Nút gọi nhanh).
        - Biển số xe & Loại xe.
    3. **Trạng thái thực tế:** Theo dõi tài xế "Đang tới điểm lấy" -> "Đã tới" -> "Đang giao".

#### D. Màn hình Thanh toán (`PaymentScreen`)
- **Vị trí:** Tự động mở hoặc Notification khi tài xế nhấn "Hoàn thành đơn".
- **Thành phần:**
    1. **Tổng tiền:** Hiển thị số tiền cuối cùng cần thanh toán.
    2. **Phương thức thanh toán:**
        - **Tiền mặt:** Trả trực tiếp cho tài xế.
        - **Ví điện tử (BenGo Wallet):** Khấu trừ từ số dư tài khoản.
        - **Chuyển khoản:** Hiển thị QR/Thông tin ngân hàng.
    3. **Nút "XÁC NHẬN":** Hoàn tất quy trình giao dịch.
- **API sử dụng:** 
  - `POST /payment/pay`: Thực hiện trừ tiền ví hoặc xác nhận đã trả tiền mặt.

---

### 2.2. Phân vùng: Tab Hoạt động (Lịch sử)

#### A. Màn hình Lịch sử đơn hàng (`OrderHistoryScreen`)
- **Trình bày:** Chia làm 2 Tab: **Đang diễn ra** và **Lịch sử**.
- **Thành phần:**
    - Danh sách các thẻ đơn hàng (Order Cards).
    - Mỗi thẻ hiện: Mã đơn, Thời gian, Lộ trình rút gọn, Tổng tiền và Trạng thái.
- **API sử dụng:** 
  - `GET /orders/history`: Lấy danh sách đơn hàng của khách hàng.

#### B. Màn hình Chi tiết đơn hàng (`CustomerOrderDetailScreen`)
- **Thành phần:**
    - Bản đồ lộ trình đã đi.
    - Chi tiết hóa đơn: Giá gốc, Giảm giá, Tổng thanh toán.
    - Nút "Đặt lại" (Re-order) để copy thông tin cũ cho đơn mới.
    - Đánh giá tài xế (Rating & Comment) sau khi hoàn thành.

---

### 2.3. Phân vùng: Tab Tài khoản

#### A. Màn hình Hồ sơ Khách hàng (`CustomerProfileScreen`)
- **Thành phần:**
    1. **Card Ví BenGo:** Hiển thị số dư hiện tại và nút "Nạp tiền".
    2. **Thông tin cá nhân:** Tên, Số điện thoại, Email.
    3. **Địa chỉ đã lưu:** Quản lý Nhà/Văn phòng/Yêu thích.
    4. **Trung tâm hỗ trợ:** Chat với tổng đài.
- **API sử dụng:** 
  - `GET /auth/profile`: Lấy thông tin cá nhân và số dư ví.

---

## 3. Bản đồ Ánh xạ API (API Mapping Summary - Customer)

| Màn hình | API Endpoints | Hành động Trigger |
| :--- | :--- | :--- |
| **Trang chủ** | `GET /orders/drivers-nearby` | Mở ứng dụng |
| **Đặt đơn** | `POST /orders/estimate` | Sau khi nhập xong địa chỉ |
| **Đặt đơn** | `POST /orders` | Nhấn "Xác nhận đặt đơn" |
| **Theo dõi** | `GET /orders/:id` | Tự động cập nhật mỗi 5-10s |
| **Lịch sử** | `GET /orders/history` | Vào tab Hoạt động |
| **Tài khoản** | `GET /auth/profile` | Vào tab Tài khoản |
| **Nạp ví** | `POST /payment/deposit` | Nhấn xác nhận nạp tiền |

---

## 4. Thiết kế Aesthetic (Yêu cầu Visual)

1. **Color Palette:**
   - **Primary:** Xanh dương đậm (BenGo Blue) cho các nút hành động chính.
   - **Accent:** Vàng cam (BenGo Gold) cho các thông báo quan trọng hoặc trạng thái đơn.
   - **Background:** Trắng sứ, sử dụng đổ bóng mềm (Soft Shadows) cho các Card.
2. **Typography:** Font chữ không chân (Hệ thống Inter hoặc Roboto), kích thước lớn cho địa chỉ điểm giao.
3. **Micro-interaction:** Hiệu ứng slide-up khi mở bộ chọn loại xe, hiệu ứng mượt khi marker tài xế di chuyển trên bản đồ.
