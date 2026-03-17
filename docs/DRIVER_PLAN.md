# BenGo - Thiết kế Giao diện Mobile App Tài xế (React Native)

Tài liệu này chi tiết cấu trúc giao diện, các thành phần UI, luồng người dùng và tích hợp API cho ứng dụng Mobile phía Tài xế.

---

## 1. Cấu trúc Điều hướng chính (Main Navigation)

Ứng dụng sử dụng **Bottom Tab Navigator** cho các chức năng chính sau khi đăng nhập:

| Tab | Icon | Chức năng chính | Màn hình khởi đầu |
| :--- | :--- | :--- | :--- |
| **Trang chủ** | `map` | Trực tuyến & Nhận đơn | `DriverDashboardScreen` |
| **Hoạt động** | `list` | Lịch sử chuyến đi | `ActivityHistoryScreen` |
| **Thu nhập** | `wallet` | Ví & Thống kê | `EarningsScreen` |
| **Tài khoản** | `person` | Hồ sơ & Cài đặt | `ProfileScreen` |

---

### 2.1. Phân vùng: Xác thực & Đăng ký (Ngoài Tab)
*Mô tả: Các màn hình này xuất hiện trước khi vào giao diện chính.*

#### A. Màn hình Đăng ký Tài xế (`RegisterDriverScreen`)
- **Vị trí:** Ngoài Tab (Stack Navigation).
- **Luồng:** Mở App -> Click "Đăng ký tài xế" tại Login.
- **API sử dụng:** `POST /auth/register` (với `type: "DRIVER"`).

#### B. Màn hình Tải hồ sơ (`DocumentUploadScreen`)
- **Vị trí:** Ngoài Tab (Tiếp nối sau Đăng ký).
- **Luồng:** Đăng ký xong -> Tự động chuyển đến màn hình này.
- **API sử dụng:** `POST /driver/documents` (Tải lên từng loại ảnh giấy tờ).

---

### 2.2. Phân vùng: Tab Trang chủ (Điều khiển chính)

#### A. Màn hình Dashboard Tài xế (`DriverDashboardScreen`)
**0. Vị trí & Luồng:** 
- Màn hình chính thuộc **Tab Trang chủ**. 
- Xuất hiện ngay sau khi tài xế đăng nhập thành công và hồ sơ đã được duyệt.

**1. Các thành phần (Components):**
- **A1:** Thanh trạng thái trực tuyến (Status Toggle Bar).
- **A2:** Bản đồ nhiệt khu vực (Demand Map).
- **A3:** Danh sách đơn hàng chờ gần đây (Incoming Orders Bottom Sheet).
- **A4:** Thẻ thông báo đơn hàng ưu tiên (Priority Order Card).

**2. Thiết kế & Công nghệ:**
- **A1:** Nền trắng, nổi (shadow). Gồm Switch chọn Online/Offline. Text: "Đang ngoại tuyến" / "Sẵn sàng nhận đơn". Icon: `ios-radio-button-on` (màu xám/xanh).
- **A2:** `react-native-maps`. Hiển thị vị trí thực tế của tài xế. Marker icon xe tải hướng theo `heading`.
- **A3:** `@gorhom/bottom-sheet`. Danh sách `FlatList` các đơn hàng `PENDING`.
- **A4:** Card màu vàng nhạt nẳm nổi trên bản đồ khi có đơn mới đẩy riêng cho tài xế. Icon: `ios-flash`.

**3. Tương tác & Xử lý (Logic):**
- **A1:** Gạt switch để đổi trạng thái. Khi Online mới bắt đầu nhận được tọa độ GPS và danh sách đơn.
- **A3:** Vuốt lên để xem toàn bộ danh sách đơn đang chờ xung quanh. Click vào đơn hàng sẽ mở Modal chi tiết.
- **A4:** Click nhanh để chấp nhận ngay (Accept) đơn ưu tiên.

**4. Tích hợp API:**
- **A1:** `PUT /driver/status` (Cập nhật `isOnline` và tọa độ hiện tại).
- **A3:** `GET /driver/orders/pending` (Lấy danh sách đơn quanh vị trí với `radius`).
- **GPS:** `PUT /driver/location` (Cập nhật vị trí thời gian thực mỗi 10s).

#### B. Pop-up/Modal Nhận đơn (`IncomingRequestModal`)
**0. Vị trí & Luồng:**
- Xuất hiện đè lên Dashboard khi có đơn hàng phù hợp nhất được hệ thống điều phối (đơn cực gần hoặc đơn ưu tiên).

**1. Các thành phần (Components):**
- **M1:** Thông tin đơn hàng (Điểm đón/giao, Số tiền, Loại xe).
- **M2:** Nút hành động "Chấp nhận" và "Bỏ qua".

**2. Thiết kế & Công nghệ:**
- Modal chiếm diện tích lớn, có âm thanh thông báo.
- Tương tự thẻ đơn hàng ở Dashboard nhưng nổi bật hơn.

**3. Tương tác & Xử lý (Logic):**
- Nhấn "Chấp nhận" để khóa đơn.
- Nhấn "Bỏ qua" để từ chối đơn.
- Tự động biến mất sau một khoảng thời gian nếu không có tương tác.

**4. Tích hợp API:**
- `POST /driver/orders/:id/accept` (Khi nhấn "Chấp nhận").

#### C. Màn hình Chuyến đi hiện tại (`ActiveTripScreen`)
**0. Vị trí & Luồng:**
- Màn hình trạng thái động, thay thế `DriverDashboardScreen` khi tài xế đã chấp nhận một đơn hàng.
- Kết thúc khi tài xế nhấn "Hoàn thành" hoặc khách hàng hủy đơn.

**1. Các thành phần (Components):**
- **B1:** Bản đồ chỉ đường thời gian thực (Navigation Map).
- **B2:** Thẻ thông tin khách hàng & Hàng hóa (Customer & Goods Info).
- **B3:** Thanh tiến trình trạng thái (Trip Progress Bar).
- **B4:** Nút hành động chính (Primary Action Button).

**2. Thiết kế & Công nghệ:**
- **B1:** `react-native-maps` + `react-native-maps-directions`. Vẽ đường đi từ vị trí hiện tại đến Điểm lấy / Điểm giao.
- **B2:** Card bo góc phía dưới. Hiển thị Avatar khách, tên, nút gọi/chat. Icon: `ios-call`, `ios-chatbubbles`.
- **B3:** StepIndicator hiển thị lịch trình: "Tới điểm đón" -> "Đã lấy hàng" -> "Tới điểm giao" -> "Hoàn thành".
- **B4:** Nút lớn cố định ở bottom, màu sắc thay đổi theo bước (Cam cho Pick up, Xanh cho Deliver).

**3. Tương tác & Xử lý (Logic):**
- **B2:** Click icon Call gọi `Linking.openURL`, click Chat mở `ChatScreen`.
- **B4:** Nhấn giữ (Long press) để xác nhận trạng thái (để tránh nhấn nhầm). Mỗi lần nhấn sẽ cập nhật status lên server.

**4. Tích hợp API:**
- **Dữ liệu:** `GET /orders/:id`.
- **Sự kiện:** `PUT /driver/orders/:id/update` (Gửi status: `ACCEPTED` -> `PICKED_UP` -> `DELIVERED`).

---

### 2.3. Phân vùng: Tab Hoạt động (Lịch sử)

#### A. Màn hình Lịch sử Chuyến đi (`ActivityHistoryScreen`)
**0. Vị trí & Luồng:**
- Màn hình chính của **Tab Hoạt động**.
- Mục tiêu: Giúp tài xế tra cứu nhanh các đơn hàng đã thực hiện, đang thực hiện hoặc đã hủy để quản lý công việc.

**1. Các thành phần (Components):**
- **H1:** Thanh lọc trạng thái (Trip Filter Tabs).
- **H2:** Thanh công cụ (Tools) gồm ô tìm kiếm và bộ lọc thời gian.
- **H3:** Danh sách lịch sử đơn hàng (Order History List).
- **H4:** Thẻ tóm tắt chuyến đi (Trip Summary Card).

**2. Thiết kế & Công nghệ:**
- **H1:** `@react-navigation/material-top-tabs`. Phân loại: "Tất cả", "Hoàn thành", "Đã hủy".
- **H2:** Ô tìm kiếm theo Mã đơn hàng hoặc địa chỉ. Bộ lọc thời gian: "Hôm nay", "7 ngày qua", "Tùy chọn".
- **H3:** `FlatList` với `RefreshControl`. Tích hợp phân trang (Lazy load).
- **H4:** Card trắng, shadow nhẹ. Header: Mã đơn hàng và Tag trạng thái màu sắc. Body: Thời gian, Lộ trình (2 điểm kèm địa chỉ rút gọn), Tổng tiền nổi bật. Footer: Nút "Xem chi tiết" hoặc icon mũi tên.

**3. Tương tác & Xử lý (Logic):**
- **H1:** Chạm để lọc nhanh danh sách bên dưới.
- **H3:** Pull-to-refresh để cập nhật danh sách mới nhất. Infinite Scroll để tải thêm khi cuộn xuống cuối trang.
- **H4:** Chạm vào thẻ đơn hàng để chuyển sang `TripDetailScreen`.

**4. Tích hợp API:**
- **Dữ liệu:** `GET /driver/orders` (Params: `status`, `page`, `limit`, `search`, `timeFilter`).

#### B. Màn hình Chi tiết Chuyến đi (`TripDetailScreen`)
**0. Vị trí & Luồng:**
- Màn hình phụ xuất hiện khi nhấn vào một đơn hàng trong lịch sử từ `ActivityHistoryScreen` (Stack Navigation).

**1. Các thành phần (Components):**
- **D1:** Bản đồ tĩnh lộ trình (Static Route Map).
- **D2:** Thông tin chi tiết thời gian & Quãng đường (Timeline Detail).
- **D3:** Chi tiết khách hàng (Customer Details).
- **D4:** Bảng kê tài chính tài xế (Earnings Breakdown).
- **D5:** Mục minh chứng hình ảnh (Delivery Proof).

**2. Thiết kế & Công nghệ:**
- **D1:** Hiển thị Snapshot bản đồ với đường đi đã thực hiện từ điểm đón đến điểm giao.
- **D2:** List các mốc thời gian: Giờ nhận, Giờ lấy hàng, Giờ giao xong. Quãng đường di chuyển (Km). Loại xe sử dụng. Icon: `ios-time-outline`.
- **D3:** Tên và thông tin liên lạc khách hàng (chỉ hiển thị đầy đủ nếu đơn đang hoạt động).
- **D4:** Hiển thị rõ: Giá cước thực tế, Phí dịch vụ (Hệ thống khấu trừ), Khuyến mãi khách hàng áp dụng, **Thu nhập thực tế tài xế nhận được** (Màu xanh lá, cỡ chữ lớn).
- **D5:** Hiển thị ảnh chụp hiện trường/hàng hóa nếu là đơn đã hoàn thành.

**3. Tương tác & Xử lý (Logic):**
- **D5:** Click vào ảnh để xem toàn màn hình.

**4. Tích hợp API:**
- **Dữ liệu:** `GET /orders/:id` (Xem lại toàn bộ dữ liệu đơn hàng và lịch đóng/mở trạng thái).

---

### 2.4. Phân vùng: Tab Thu nhập (Ví tiền)

#### A. Màn hình Thống kê Thu nhập (`EarningsScreen`)
**0. Vị trí & Luồng:**
- Màn hình chính của **Tab Thu nhập**.

**1. Các thành phần (Components):**
- **W1:** Thống kê tổng quan (Earnings Overview Card).
- **W2:** Biểu đồ doanh thu (Revenue Chart).
- **W3:** Danh sách giao dịch ví (Wallet Transactions).

**2. Thiết kế & Công nghệ:**
- **W1:** Header màu Blue, hiển thị số dư ví hiện tại và tổng thu nhập trong ngày/tuần. Icon: `ios-wallet`.
- **W2:** `react-native-chart-kit`. Biểu đồ cột (Bar Chart) thu nhập 7 ngày gần nhất.
- **W3:** Danh sách các khoản cộng/trừ tiền sau mỗi đơn hàng hoặc lệnh rút tiền. Icon `ios-add-circle` / `ios-remove-circle`.

**3. Tương tác & Xử lý (Logic):**
- **W1:** Nút "Rút tiền" để yêu cầu rút về ngân hàng đã đăng ký.
- **W2:** Chạm vào cột để xem số tiền cụ thể của ngày đó.

**4. Tích hợp API:**
- **Dữ liệu:** `GET /driver/stats` (Lấy dữ liệu biểu đồ và các chỉ số KPI theo thời gian).

---

### 2.5. Phân vùng: Tab Tài khoản (Cá nhân)

#### A. Màn hình Hồ sơ Tài xế (`ProfileScreen`)
**0. Vị trí & Luồng:**
- Màn hình chính của **Tab Tài khoản**.

**1. Các thành phần (Components):**
- **P1:** Header thông tin cá nhân (Profile Header Card).
- **P2:** Chỉ số hiệu suất tài xế (Driver Performance Stats).
- **P3:** Danh mục quản lý (Setting Menu List).

**2. Thiết kế & Công nghệ:**
- **P1:** Avatar tròn phía trái, tên và hạng tài xế phía phải. Icon: `ios-star` hiển thị số sao trung bình.
- **P2:** Card chia 3 cột: Số chuyến (Trips), Tỷ lệ hoàn thành (Acceptance Rate), Năm gắn bó (Experience).
- **P3:** Danh sách các item menu. Icon bên trái: `ios-person`, `ios-document-attach`, `ios-settings`, `ios-log-out`.

**3. Tương tác & Xử lý (Logic):**
- **P1:** Click vào Avatar để cập nhật ảnh hồ sơ.
- **P3:** Link đến các màn hình `EditProfileScreen`, `DocumentStatusScreen`, `SettingsScreen`.
- **P3 (Đăng xuất):** Hiện Dialog xác nhận xóa token và chuyển về Trang Login.

**4. Tích hợp API:**
- **Dữ liệu:** `GET /auth/profile`.

#### B. Màn hình Chỉnh sửa Hồ sơ (`EditProfileScreen`)
**0. Vị trí & Luồng:**
- Màn hình phụ xuất hiện khi nhấn "Chỉnh sửa thông tin" từ `ProfileScreen`.

**1. Các thành phần (Components):** 
- Ô nhập liệu Tên, Email, SĐT (Read-only).
- Nút "Cập nhật".

**2. Thiết kế:** Form nhập liệu chuẩn với validation.

**3. Logic:** Gọi API cập nhật thông tin JSON.

**4. API:** `PUT /auth/profile`.

#### C. Màn hình Quản lý tài liệu (`DocumentStatusScreen`)
**0. Vị trí & Luồng:**
- Màn hình phụ từ tài khoản.

**1. Các thành phần (Components):**
- List trạng thái các giấy tờ: GPLX, Đăng ký xe, Bảo hiểm. 
- Nút "Tải lên lại".

**2. Thiết kế:** Hiển thị Chip trạng thái (Approved/Pending/Rejected).

**3. Logic:** Cho phép chọn ảnh mới nếu bị từ chối.

**4. API:** `POST /driver/documents`.

---

## 3. Bản đồ Ánh xạ API (API Mapping Summary)

| Màn hình | API Endpoints | Trigger Action |
| :--- | :--- | :--- |
| **Dashboard** | `PUT /driver/status` | Gạt switch Trực tuyến |
| **Dashboard** | `GET /driver/orders/pending` | Tự động cập nhật đơn gần đây |
| **Modal Nhận đơn** | `POST /driver/orders/:id/accept` | Nhấn nút Chấp nhận |
| **Đang di chuyển** | `PUT /driver/ orders/:id/update` | Xác nhận Đã lấy hàng / Đã giao |
| **Lịch sử** | `GET /driver/orders` | Tải danh sách khi vào Tab |
| **Thu nhập** | `GET /driver/stats` | Tải dữ liệu biểu đồ |
| **Tài khoản** | `GET /auth/profile` | Tải thông tin khi vào Tab |
