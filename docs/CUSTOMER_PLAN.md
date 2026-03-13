# BenGo - Thiết kế Giao diện Mobile App Khách hàng (React Native)

Tài liệu này chi tiết cấu trúc giao diện, các thành phần UI, luồng người dùng và tích hợp API cho ứng dụng Mobile phía Khách hàng (Customer).

---

## 1. Cấu trúc Điều hướng chính (Main Navigation)

Ứng dụng sử dụng **Bottom Tab Navigator** (React Navigation v6) với phong cách thiết kế hiện đại, bo góc mềm mại:

| Tab | Icon (`react-native-vector-icons`) | Chức năng chính | Màn hình khởi đầu |
| :--- | :--- | :--- | :--- |
| **Trang chủ** | `home` | Đặt đơn & Tìm kiếm | `CustomerHomeScreen` |
| **Hoạt động** | `receipt` | Theo dõi đơn & Lịch sử | `OrderHistoryScreen` |
| **Thông báo** | `notifications`| Cập nhật trạng thái đơn | `NotificationScreen` |
| **Tài khoản** | `person` | Hồ sơ & Ví tiền | `CustomerProfileScreen` |

---

## 2. Đặc tả Chi tiết Màn hình & Luồng Hoạt động (App Flow)

### 2.1. Phân vùng: Trang chủ & Đặt đơn (Core Flow)

#### A. Màn hình Trang chủ (`CustomerHomeScreen`)
- **Thành phần:**
    1. **Bản đồ nền (Background Map):** 
        - **Library:** `react-native-maps`.
        - **Hiển thị:** Các tài xế xung quanh dưới dạng icon xe di chuyển real-time. Marker tài xế sử dụng `AnimatedRegion` để chuyển động mượt mà khi vị trí thay đổi qua Socket.
    2. **Thanh tìm kiếm (Search Bar):** 
        - **UI:** "Bạn muốn giao hàng đến đâu?" - Nổi trên bản đồ, bo tròn.
        - **Tương tác:** Khi nhấn vào sẽ điều hướng (`navigation.navigate`) sang màn hình `SearchDestinationScreen` để nhập địa chỉ chi tiết.
    3. **Shortcut địa chỉ:** Các nút bấm nhanh: "Nhà riêng", "Công ty", "Địa chỉ đã lưu".
    4. **Promotion Slider:** 
        - **Library:** `react-native-reanimated-carousel`.
        - **Chức năng:** Banner các chương trình khuyến mãi đang diễn ra. Lấy dữ liệu từ API `/admin/promotions`.
- **API sử dụng:** 
  - `GET /orders/drivers-nearby`: Lấy vị trí tài xế xung quanh để hiển thị trên bản đồ.
  Lấy danh sách tài xế xung quanh (GET /orders/drivers-nearby)
   - Params: `?lat=10.76&lng=106.66&radius=5`
   - Response Data:
     ```json
     [
       {
         "id": "60d0fe...",
         "vehicleType": "VAN",
         "location": { "lat": 10.762, "lng": 106.660 },
         "rating": 4.8
       }
     ]
     ```
   - `GET /admin/promotions`: Lấy danh sách banner khuyến mãi.
Response Data:
     [
       {
         "_id": "...",
         "code": "SUMMER20",
         "title": "...",
         "discountType": "PERCENTAGE"|"FIXED_AMOUNT",
         "discountValue": 20,
         "minOrderValue": 50000,
         "maxDiscountAmount": 100000,
         "startDate": "...",
         "endDate": "...",
         "usageLimit": 100,
         "usedCount": 5,
         "isActive": true,
         "applicableVehicles": ["BIKE", "VAN"]
       }
     ]
#### B. Màn hình Nhập địa chỉ & Chọn dịch vụ (`BookingSetupScreen`)
- **Luồng:** Xuất hiện sau khi chọn địa điểm từ Search Bar.
- **Thành phần:**
    1. **Địa điểm:** 
        - Nhập điểm lấy hàng (Mặc định location hiện tại).
        - Nhập điểm giao hàng (Sử dụng `react-native-google-places-autocomplete`).
    2. **Thông tin hàng hóa:**
        - Tên hàng hóa, Khối lượng (kg).
        - Ghi chú cho tài xế (VD: "Hàng dễ vỡ").
        - Hình ảnh hàng hóa: Sử dụng `react-native-image-picker` để chụp/chọn ảnh.
    3. **Chọn loại xe (Vehicle Selector):** 
        - Danh sách: Xe máy (BIKE), Xe bán tải (VAN), Xe tải (TRUCK).
        - Hiển thị dưới dạng Horizontal List với các Card (VehicleCard).
        - Hệ thống tính **Giá tạm tính** (Estimated Price) ngay khi chọn loại xe.
    4. **Nút "TẠO ĐƠN":** Gửi yêu cầu lên hệ thống.
- **API sử dụng:** 
  - `POST /orders/estimate`: Tính toán giá cước dựa trên khoảng cách và loại xe.
  - `POST /orders`: Tạo đơn hàng mới.
  - `GET /admin/promotions`: Lấy danh sách mã giảm giá khả dụng.

#### C. Màn hình Theo dõi đơn hàng (`TrackOrderScreen`)
- **Luồng:** Sau khi nhấn "TẠO ĐƠN" và có tài xế nhận.
- **Thành phần:**
    1. **Bản đồ Live:** 
        - Vẽ lộ trình (Polyline) bằng `react-native-maps-directions`.
        - Vị trí tài xế di chuyển real-time hướng về điểm lấy/giao (Socket.IO update).
    2. **Thông tin tài xế & Bottom Sheet:**
        - Sử dụng `@gorhom/bottom-sheet` để hiển thị thông tin: Tên, SĐT (Nút gọi nhanh qua `Linking`), Biển số xe & Loại xe.
    3. **Trạng thái thực tế:** View tiến trình: "Đang tới điểm lấy" -> "Đã tới" -> "Đang giao".

#### D. Màn hình Thanh toán & Đánh giá (`PaymentScreen`)
- **Vị trí:** Tự động mở hoặc Notification khi tài xế nhấn "Hoàn thành đơn".
- **Thành phần:**
    1. **Tổng tiền:** Hiển thị số tiền cuối cùng cần thanh toán.
    2. **Phương thức thanh toán:** Tiền mặt, Ví điện tử (BenGo Wallet), Chuyển khoản QR.
    3. **Đánh giá (Rating):** Hiển thị sau khi thanh toán thành công. Sử dụng `react-native-ratings`.
- **API sử dụng:** 
  - `POST /payment/pay`: Thực hiện thanh toán.
  - `POST /orders/:id/rate`: Gửi đánh giá tài xế.

---

### 2.2. Phân vùng: Tab Hoạt động (Lịch sử)

#### A. Màn hình Lịch sử đơn hàng (`OrderHistoryScreen`)
- **UI:** Chia làm 2 Tab (`react-navigation/material-top-tabs`): **Đang diễn ra** và **Lịch sử**.
- **Thành phần:** 
    - Danh sách các thẻ đơn hàng (Order Cards) sử dụng `FlatList`.
    - Mỗi thẻ hiện: Mã đơn, Thời gian, Lộ trình rút gọn, Tổng tiền và Trạng thái.
- **API sử dụng:** 
  - `GET /orders/history`: Lấy danh sách đơn hàng.

#### B. Màn hình Chi tiết đơn hàng (`CustomerOrderDetailScreen`)
- **Thành phần:** Bản đồ lộ trình, Chi tiết hóa đơn, Nút "Đặt lại" (Re-order), Đánh giá tài xế.

---

### 2.3. Phân vùng: Tab Tài khoản

#### A. Màn hình Hồ sơ Khách hàng (`CustomerProfileScreen`)
- **Thành phần:** 
    1. **Card Ví BenGo:** Số dư (`walletBalance`) & Button "Nạp tiền".
    2. **Thông tin cá nhân:** Tên, SĐT, Email.
    3. **Địa chỉ đã lưu:** Quản lý địa chỉ yêu thích.
- **API sử dụng:** 
  - `GET /auth/profile`: Lấy thông tin cá nhân và số dư ví.

---

## 3. Bản đồ Ánh xạ API chi tiết (Technical Mapping)

| Màn hình | API Endpoints | Hành động Trigger | Logic/Dữ liệu chính |
| :--- | :--- | :--- | :--- |
| **Trang chủ** | `GET /orders/drivers-nearby` | Mở ứng dụng | `lat, lng, radius` |
| **Đặt đơn** | `POST /orders/estimate` | Thay đổi loại xe | Nhận `totalPrice` dự kiến |
| **Đặt đơn** | `POST /orders` | Nhấn "Xác nhận" | Gửi payload kèm ảnh |
| **Theo dõi** | `GET /orders/:id` | Mở màn hình tracking | Lấy info driver & order |
| **Tài khoản** | `GET /auth/profile` | Vào tab Tài khoản | Sync số dư ví |

---

## 4. Thiết kế Aesthetic (Yêu cầu Visual)

1. **Color Palette:** 
    - `#0047AB` (Primary Blue), `#FFD700` (Accent Gold), `#FFFFFF` (Background).
2. **Typography:** Font **Inter** hoặc **Roboto**.
3. **Micro-interaction:** Hiệu ứng `LottieView` khi tìm tài xế, Skeleton loading khi tải danh sách.
4. **Performance:** Cạnh tranh mượt mà với `React Query` cho data caching.

