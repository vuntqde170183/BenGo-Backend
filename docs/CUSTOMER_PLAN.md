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

**0. Vị trí & Luồng xuất hiện:**
- Màn hình chính thuộc Tab **"Trang chủ" (Home)**.
- Mặc định xuất hiện khi người dùng mở ứng dụng và đã đăng nhập.

**1. Danh sách các thành phần (Components):**
- **H1:** Bản đồ nền tương tác (Interactive Background Map).
- **H2:** Thanh tìm kiếm địa điểm (Floating Search Bar).
- **H3:** Nhóm phím tắt địa chỉ (Quick Address Chips).
- **H4:** Carousel khuyến mãi (Promotion Slider).

**2. Đặc tả thiết kế & Công nghệ:**
- **H1:** `react-native-maps`. Background toàn màn hình. Hiển thị tài xế dưới dạng Marker icon xe. Sử dụng `Animated` để di chuyển xe mượt mà.
- **H2:** Box bo tròn 25px, màu trắng, đổ bóng nhẹ. Text: "Bạn muốn giao hàng đến đâu?". Icon: `ios-search` (IonIcons).
- **H3:** Row chứa các `Chip` thành phần: "Nhà riêng", "Công ty", "Đã lưu". Icon: `ios-home`, `ios-briefcase`, `ios-bookmark` (IonIcons).
- **H4:** `react-native-reanimated-carousel`. Hiển thị các Banner quảng cáo bo góc 10px. Lồng trong `View` có lùi lề (padding).

**3. Tương tác & Xử lý (Logic):**
- **H2:** Khi nhấn vào sẽ điều hướng sang màn hình `SearchDestinationScreen`.
- **H3:** Khi nhấn chọn một địa chỉ đã lưu, hệ thống tự động điền điểm đến và chuyển sang `BookingSetupScreen`.
- **H4:** Vuốt ngang để xem các banner. Nhấn vào một banner để mở chi tiết khuyến mãi hoặc áp dụng mã.

**4. Tích hợp API:**
- **H1:** `GET /orders/drivers-nearby` (Polling 15s/lần) để lấy tọa độ tài xế xung quanh.
- **H4:** `GET /admin/promotions` để lấy danh sách ảnh banner và mã giảm giá.
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
- Là màn hình chính thuộc Tab **"Hoạt động" (Activities)** trên thanh Bottom Tab Navigator.
- Xuất hiện khi người dùng nhấn vào biểu tượng `receipt` ở thanh điều hướng dưới cùng.

**1. Danh sách các thành phần (Components):**
- **H1:** Thanh điều hướng Tab phụ (Sub-tab Navigator).
- **H2:** Danh sách đơn hàng (Order FlatList).
- **H3:** Thẻ tóm tắt đơn hàng (Order Item Card).
- **H4:** Trạng thái trống (Empty History State).

**2. Đặc tả thiết kế & Công nghệ:**
- **H1:** Sử dụng thư viện `@react-navigation/material-top-tabs`. Chia làm 2 tab: **"Đang diễn ra"** và **"Lịch sử"**. Indicator màu Blue `#0047AB`.
- **H2:** Sử dụng `FlatList` với `RefreshControl`. Tích hợp Skeleton Loading khi đang tải dữ liệu.
- **H3:** Card trắng bo góc 12px. Icon: `ios-barcode` (Mã đơn), `ios-radio-button-on` (Điểm đi), `ios-location` (Điểm đến), `ios-car` (Loại xe). 
- **H4:** Icon `ios-document-text-outline` lớn màu xám. Text: "Bạn chưa có đơn hàng nào".

**3. Tương tác & Xử lý (Logic):**
- **H1:** Chuyển đổi tab lọc theo trạng thái đơn hàng.
- **H3:** Nhấn vào Card điều hướng sang `CustomerOrderDetailScreen` kèm `orderId`.
- **H3 (Action):** Nút "Đặt lại" cho các đơn đã hoàn thành để chuyển sang `BookingSetupScreen`.

**4. Tích hợp API:**
- **H2/H3:** `GET /orders/history`.
  - **Params:** `?status=...&page=1&limit=10`.
  - **Data Map:** Hiển thị `totalPrice`, Status badge màu sắc động, địa chỉ `pickup`/`dropoff` rút gọn.


#### B. Màn hình Chi tiết đơn hàng (`CustomerOrderDetailScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Màn hình chi tiết (Stack Navigation).
- Xuất hiện khi nhấn vào một thẻ đơn hàng (**H3**) tại `OrderHistoryScreen` hoặc từ thông báo trạng thái.

**1. Danh sách các thành phần (Components):**
- **CD1:** Thanh tiêu đề & Nút quay lại (Header).
- **CD2:** Trạng thái đơn hàng & Mã đơn (Status Banner).
- **CD3:** Bản đồ lộ trình tóm tắt (Route Map Summary).
- **CD4:** Thông tin địa chỉ chi tiết (Address Info Card).
- **CD5:** Thông tin hàng hóa & Ghi chú (Goods Section).
- **CD6:** Thông tin Tài xế (Driver Info Card - Hiện khi đã có tài xế).
- **CD7:** Chi tiết thanh toán (Payment Summary).
- **CD8:** Nhóm phím chức năng (Action Button Group).

**2. Đặc tả thiết kế & Công nghệ:**
- **CD1:** Icon `ios-arrow-back` (IonIcons). Text: "Chi tiết đơn hàng" (Bold, size 18).
- **CD2:** Nền thay đổi theo trạng thái (Xanh dương: ACCEPTED, Xanh lá: DELIVERED, Đỏ: CANCELLED). Hiển thị ID đơn hàng rút gọn.
- **CD3:** `react-native-maps`. Hiển thị Marker điểm Pickup và Dropoff, vẽ Route đơn giản nối hai điểm.
- **CD4:** Icon `ios-radio-button-on` (Xanh - Pickup) và `ios-location` (Đỏ - Dropoff). Hiển thị địa chỉ đầy đủ.
- **CD5:** Icon `ios-cube-outline`. Render danh sách ảnh hàng hóa ngang (Thumbnail) và `specialNote`.
- **CD6:** Hình ảnh `Avatar` tròn, tên, biển số. Icon `ios-call` (Blue) và `ios-chatbubble` (Green).
- **CD7:** Icon `ios-receipt-outline`. Hiển thị: Giá cước, Giảm giá (nếu có), Tổng tiền (Bold, Blue).
- **CD8:** Nút "Hủy đơn" (Viền đỏ), "Đặt lại" (Nền Blue), "Đánh giá" (Nền Gold).

**3. Tương tác & Xử lý (Logic):**
- **CD6:** Nút gọi điện dùng `Linking.openURL`, nút Chat điều hướng sang `ChatScreen`.
- **CD8 (Hủy đơn):** Hiện Alert xác nhận, nếu OK gọi API và quay về màn hình trước. Chỉ hiện khi status là PENDING/ACCEPTED.
- **CD8 (Đặt lại):** Copy thông tin địa chỉ/hàng hóa và chuyển người dùng sang màn `BookingSetupScreen`.
- **CD8 (Đánh giá):** Mở Modal đánh giá hoặc màn hình `PaymentScreen` phần rating nếu đơn đã hoàn thành.

**4. Tích hợp API:**
- **Toàn màn hình:** `GET /orders/:id`.
- **CD8 (Hủy đơn):** `PUT /orders/:id/cancel`.
- **CD8 (Đánh giá):** `POST /orders/:id/rate`.

---

### 2.3. Phân vùng: Tab Thông báo

#### A. Màn hình Thông báo (`NotificationScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Là màn hình chính thuộc Tab **"Thông báo" (Notifications)**.
- Xuất hiện khi khách hàng nhấn vào biểu tượng `notifications`.

**1. Danh sách các thành phần (Components):**
- **N1:** Header danh sách (Notification Header).
- **N2:** Thanh lọc loại thông báo (Notification Filter Bar).
- **N3:** Danh sách thẻ thông báo (Notification FlatList).

**2. Đặc tả thiết kế & Công nghệ:**
- **N1:** Tiêu đề "Thông báo" căn trái, font Bold 24px. Icon `ios-settings-outline` bên phải (IonIcons).
- **N2:** Nhóm các `Chip` lọc: "Tất cả", "Ưu đãi", "Đơn hàng". Màu sắc hài hòa với palette Blue.
- **N3:** `FlatList` với `RefreshControl`. Mỗi item card: 
    - Icon trái: `ios-cube` (Đơn hàng), `ios-gift` (Khuyến mãi), `ios-alert-circle` (Cảnh báo).
    - Text: Tiêu đề (Bold), Mô tả ngắn (Xám), Thời gian (Xám nhạt).
    - Chấm xanh báo hiệu thông báo chưa đọc.

**3. Tương tác & Xử lý (Logic):**
- **N2:** Nhấn để lọc danh sách thông báo theo category.
- **N3:** 
    - Nhấn vào thông báo đơn hàng: Điều hướng sang `CustomerOrderDetailScreen`.
    - Nhấn vào thông báo khuyến mãi: Hiển thị Modal chi tiết hoặc điều hướng sang màn Promotion.
    - Vuốt sang trái (Swipeable): Hiện nút "Xóa" hoặc "Đánh dấu đã đọc".

**4. Tích hợp API:**
- **Toàn màn hình:** `GET /notifications` (Lấy danh sách thông báo).
- **Xử lý trạng thái:** `PUT /notifications/:id/read` (Gọi khi người dùng nhấn vào thông báo).

---

### 2.4. Phân vùng: Tab Tài khoản

#### A. Màn hình Hồ sơ Khách hàng (`CustomerProfileScreen`)

**0. Vị trí & Luồng xuất hiện:**
- Là màn hình chính thuộc Tab **"Tài khoản" (Account)**.
- Xuất hiện khi người dùng nhấn vào biểu tượng `person` ở thanh Bottom Tab Navigator.

**1. Danh sách các thành phần (Components):**
- **P1:** Header thông tin cá nhân (User Identity Header).
- **P2:** Thẻ số dư ví điện tử (BenGo Wallet Card).
- **P3:** Danh sách Menu cài đặt (Settings & Actions Menu List).
- **P4:** Nút Đăng xuất (Logout Action).

**2. Đặc tả thiết kế & Công nghệ:**
- **P1:** Hiển thị Avatar (tròn, viền trắng), Tên thành viên (Size 20, Bold), Hạng thành viên (Gold/Silver). Icon `ios-brush` (IonIcons) để chỉnh sửa.
- **P2:** Sử dụng `LinearGradient` (màu Blue `#0047AB`). Text trắng. Hiển thị số dư phong cách thẻ ATM. Nút "Nạp tiền" (Nền trắng, text Blue). Icon: `ios-card` (IonIcons).
- **P3:** Mỗi hàng gồm: Icon IonIcons trái (vd: `ios-location`, `ios-notifications`, `ios-shield-checkmark`), Label (thường), Icon mũi tên phải `ios-chevron-forward` (màu xám).
- **P4:** Nút rộng 90%, viền đỏ nhạt, text đỏ. Icon `ios-log-out-outline` (IonIcons).

**3. Tương tác & Xử lý (Logic):**
- **P1:** Nhấn vào Header hoặc Icon Brush điều hướng sang màn hình `EditProfileScreen`.
- **P2:** Nhấn "Nạp tiền" chuyển sang màn hình Thanh toán/Nạp ví. Hiển thị Modal QR hoặc các cổng thanh toán.
- **P3:** 
    - "Địa chỉ đã lưu": Điều hướng sang quản lý địa chỉ.
    - "Bảo mật & Mật khẩu": Mở màn hình đổi mã PIN/Mật khẩu.
    - "Hỗ trợ khách hàng": Mở trình gọi điện hoặc Chat hỗ trợ.
- **P4:** Hiển thị `Alert.alert` xác nhận. Nếu OK, xóa Token cục bộ và điều hướng về màn hình Đăng nhập.

**4. Tích hợp API:**
- **P1/P2/P3:** `GET /auth/profile` để lấy thông tin chi tiết và danh sách địa chỉ.
- **P4:** `POST /auth/logout` (nếu cần xóa session trên server).

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

