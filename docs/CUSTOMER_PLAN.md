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
        - **Hiển thị:** Các tài xế xung quanh dưới dạng icon xe di chuyển. Marker tài xế sử dụng `AnimatedRegion` để chuyển động mượt mà khi vị trí được cập nhật định kỳ (Polling API mỗi 10-15s).
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
#### B. Màn hình Tìm kiếm điểm đến (`SearchDestinationScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình phụ (Stack Navigation).
- Xuất hiện khi người dùng nhấn vào **Thanh tìm kiếm (A2)** tại `CustomerHomeScreen`.

**1. Danh sách các thành phần (Components):**
- **S1:** Ô nhập liệu địa chỉ (Search Input Box).
- **S2:** Nút "Vị trí hiện tại" & "Chọn trên bản đồ".
- **S3:** Danh sách địa điểm đã lưu (Saved Places).
- **S4:** Danh sách kết quả gợi ý (Search Predictions).

**2. Đặc tả thiết kế & Công nghệ:**
- **S1:** Sử dụng `react-native-google-places-autocomplete`. Header bo góc, background trắng. Icon: `ios-arrow-back` (để quay lại) và `ios-search` (IonIcons).
- **S2:** Hai hàng phím tắt ngay dưới ô nhập. Icon: `ios-locate` và `ios-map` (IonIcons). Text màu Blue `#0047AB`.
- **S3:** Render các thẻ (rows) nằm ngang hoặc dọc. Icon: `ios-home`, `ios-briefcase`. Text: "Nhà riêng", "Công ty".
- **S4:** Danh sách các kết quả trả về từ Google API. Mỗi hàng gồm: Icon `ios-pin` (xám), Title (đen đậm), Subtitle (xám nhạt).

**3. Tương tác & Xử lý (Logic):**
- **S1:** Tự động Focus khi vào màn hình. Khi gõ > 2 ký tự sẽ bắt đầu hiển thị **S4**.
- **S2:** "Vị trí hiện tại" sẽ gọi Geolocation để lấy tọa độ. "Chọn trên bản đồ" sẽ mở màn hình map trung gian.
- **S3:** Khi nhấn, lấy trực tiếp Tọa độ + Địa chỉ đã lưu và chuyển sang `BookingSetupScreen`.
- **S4:** Khi chọn một địa điểm, hệ thống lưu lại thông tin Destination và điều hướng sang `BookingSetupScreen`.

**4. Tích hợp API:**
- **S1/S4:** Google Places Autocomplete API (Client side).
- **S3:** `GET /auth/profile` (Lấy mảng `savedAddresses` của người dùng).

---

#### C. Màn hình Nhập địa chỉ & Chọn dịch vụ (`BookingSetupScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình chính trong luồng đặt đơn.
- Xuất hiện sau khi người dùng chọn xong địa điểm tại `SearchDestinationScreen`.

**1. Danh sách các thành phần (Components):**
- **C1:** Card hiển thị địa chỉ (Pickup & Dropoff).
- **C2:** Form nhập thông tin hàng hóa (Goods Info Card).
- **C3:** Slider chọn loại xe (Vehicle Selector).
- **C4:** Nút tạo đơn hàng (Action Button).

**2. Đặc tả thiết kế & Công nghệ:**
- **C1:** Hiển thị 2 dòng địa chỉ. Icon: `ios-pin` (điểm lấy) và `ios-flag` (điểm giao).
- **C2:** TextInput cho Tên hàng, Khối lượng. Nút upload ảnh icon `ios-camera` (IonIcons).
- **C3:** Horizontal List các `VehicleCard`. Mỗi Card gồm: Ảnh xe, Tên xe (VAN, TRUCK...), Giá (VND), Thời gian dự kiến.
- **C4:** Nút fixed ở bottom, màu Blue `#0047AB`. Text: "TẠO ĐƠN".

**3. Tương tác & Xử lý (Logic):**
- **C1:** Nhấn vào từng dòng địa chỉ để quay lại màn hình tìm kiếm nếu muốn đổi.
- **C2:** Mở Camera/Library để chụp ảnh hàng hóa.
- **C3:** Khi chọn loại xe khác, gọi API estimate để cập nhật giá tức thời.
- **C4:** Kiểm tra validation (phải có đủ ảnh, tên hàng) rồi mới gọi API tạo đơn.

**4. Tích hợp API:**
- **C3:** `POST /orders/estimate` (Trigger mỗi khi đổi loại xe).
- **C4:** `POST /orders` (Gửi payload tạo đơn).

---

#### D. Màn hình Theo dõi đơn hàng (`TrackOrderScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình Tracking real-time.
- Tự động xuất hiện sau khi đơn hàng được tạo và có tài xế nhận.

**1. Danh sách các thành phần (Components):**
- **D1:** Bản đồ lộ trình (Route Map).
- **D2:** Thông tin Tài xế (Driver Bottom Sheet).
- **D3:** Thanh trạng thái đơn hàng (Timeline Status).

**2. Đặc tả thiết kế & Công nghệ:**
- **D1:** `react-native-maps` + `react-native-maps-directions`. Vẽ đường đi từ Tài xế -> Điểm lấy -> Điểm giao.
- **D2:** `@gorhom/bottom-sheet`. Hiển thị Avatar (tròn), Tên, Biển số xe. Icon: `ios-call` và `ios-chatbubbles` (IonIcons).
- **D3:** Horizontal Step Indicator. Các mốc: Đã xác nhận, Đang đến lấy, Đang giao, Hoàn thành.

**3. Tương tác & Xử lý (Logic):**
- **D1:** Tự động Polling API mỗi 5-10s để cập nhật vị trí Marker tài xế.
- **D2:** Nhấn icon Call để mở trình gọi điện; Nhấn icon Chat để mở màn hình chat.
- **D3:** View-only (Cập nhật dựa trên status từ API).

**4. Tích hợp API:**
- **D1/D2/D3:** `GET /orders/:id` (Polling liên tục để đồng bộ trạng thái & tọa độ).

---

#### E. Màn hình Thanh toán & Đánh giá (`PaymentScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình kết thúc dịch vụ.
- Xuất hiện khi tài xế nhấn "Hoàn thành đơn" hoặc khách hàng nhấn xác nhận nhận hàng.

**1. Danh sách các thành phần (Components):**
- **E1:** Chi tiết hóa đơn (Receipt Card).
- **E2:** Phương thức thanh toán (Payment Selector).
- **E3:** Form đánh giá tài xế (Rating & Review Form).

**2. Đặc tả thiết kế & Công nghệ:**
- **E1:** Text lớn hiển thị số tiền. Icon: `ios-card` (IonIcons).
- **E2:** List lựa chọn: "Tiền mặt", "Ví BenGo", "Chân trang Chuyển khoản". Icon: `ios-wallet`, `ios-cash`.
- **E3:** `react-native-ratings` (5 sao). TextInput cho comment.

**3. Tương tác & Xử lý (Logic):**
- **E2:** Khi chọn thanh toán ví, hệ thống trừ số dư tự động (nếu đủ).
- **E3:** Nhấn gửi đánh giá sẽ gọi API rate và quay về màn hình Home.

**4. Tích hợp API:**
- **E2:** `POST /payment/pay`.
- **E3:** `POST /orders/:id/rate`.

---

### 2.2. Phân vùng: Tab Hoạt động (Lịch sử)

#### A. Màn hình Lịch sử đơn hàng (`OrderHistoryScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Thuộc Tab **Hoạt động**.

**1. Danh sách các thành phần (Components):**
- **H1:** Tab chuyển đổi (Top Tab: Đang diễn ra | Lịch sử).
- **H2:** Danh sách thẻ đơn hàng (FlatList Order Cards).

**2. Đặc tả thiết kế & Công nghệ:**
- **H1:** Sử dụng `@react-navigation/material-top-tabs`. Active tab có gạch chân màu Blue.
- **H2:** Mỗi thẻ (Card) gồm: Mã đơn (#1234), Trạng thái (Badge), Thời gian, và Icon loại xe (`ios-car`).

**3. Tương tác & Xử lý (Logic):**
- **H2:** Khi nhấn vào một thẻ đơn hàng, điều hướng sang `CustomerOrderDetailScreen`.

**4. Tích hợp API:**
- **H2:** `GET /orders/history` (Phân trang và lọc theo trạng thái).

---

#### B. Màn hình Chi tiết đơn hàng (`CustomerOrderDetailScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình chi tiết (Stack). Xuất hiện khi nhấn vào item từ Lịch sử.

**1. Danh sách các thành phần (Components):**
- **CH1:** Bản đồ lộ trình tĩnh (Static Route Map).
- **CH2:** Thông tin chi tiết hóa đơn (Billing Detail).
- **CH3:** Nút chức năng (Re-order / Support).

**2. Đặc tả thiết kế & Công nghệ:**
- **CH1:** Snapshot bản đồ với Polyline lộ trình cũ.
- **CH2:** View liệt kê: Phí dịch vụ, Giảm giá, Tổng thanh toán. Icon: `ios-document-text`.
- **CH3:** Button "Đặt lại đơn này" màu Blue; Button "Hỗ trợ" icon `ios-help-circle`.

**3. Tương tác & Xử lý (Logic):**
- **CH3:** "Đặt lại" sẽ copy dữ liệu cũ và quay về `BookingSetupScreen`.

**4. Tích hợp API:**
- **CH2:** `GET /orders/:id`.

---

### 2.3. Phân vùng: Tab Tài khoản

#### A. Màn hình Hồ sơ Khách hàng (`CustomerProfileScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Thuộc Tab **Tài khoản**.

**1. Danh sách các thành phần (Components):**
- **P1:** Thẻ ví BenGo (Wallet Card).
- **P2:** Danh sách cài đặt & Menu (Settings Menu).
- **P3:** Nút Đăng xuất (Logout Button).

**2. Đặc tả thiết kế & Công nghệ:**
- **P1:** Background Gradient, hiển thị số dư lớn. Icon: `ios-wallet`. Nút "Nạp tiền" icon `ios-add-circle`.
- **P2:** Danh sách các dòng icon trái - text giữa - icon chevron phải. Các icon: `ios-person`, `ios-location`, `ios-notifications`, `ios-shield-checkmark`.
- **P3:** Text màu đỏ, icon `ios-log-out`.

**3. Tương tác & Xử lý (Logic):**
- **P2:** Nhấn "Địa chỉ đã lưu" để quản lý Home/Work address.
- **P3:** Hiển thị Alert xác nhận trước khi xóa token và về màn Login.

**4. Tích hợp API:**
- **P1/P2:** `GET /auth/profile`.

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

