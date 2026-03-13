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
- **Vị trí:** **Tab Trang chủ**.
- **Chức năng:** Nhận đơn hàng real-time.
- **Thành phần chi tiết:**
    1. **Bản đồ (Map Layer):** Hiển thị vị trí hiện tại và các điểm `PENDING` đơn hàng.
    2. **Danh sách đơn hàng gần đây (Bottom Sheet):**
        - Hiển thị các thẻ đơn cư trú quanh vị trí tài xế.
        - **Thông tin mỗi thẻ:**
            - Điểm lấy hàng & Điểm giao hàng (Địa chỉ ngắn).
            - Khoảng cách từ tài xế tới điểm lấy (VD: `1.2 km`).
            - Giá chuyến đi (Số tiền thực nhận).
            - Thời gian đăng đơn (VD: `2 phút trước`).
        - **Nút hành động:**
            - Nút **"XEM CHI TIẾT"**: Xem ảnh hàng hóa, khối lượng, ghi chú.
            - Nút **"NHẬN ĐƠN"**: Chấp nhận đơn hàng ngay lập tức.
- **Cơ chế:** Khi có đơn mới, hệ thống push realtime lên danh sách. Tài xế nhấn "Nhận đơn" nhanh nhất sẽ được hệ thống khóa đơn (Lock) để tránh nhiều người nhận cùng lúc.

#### B. Pop-up/Modal Nhận đơn (`IncomingRequestModal`)
- **Luồng:** Xuất hiện khi có đơn cực gần hoặc đơn ưu tiên được đẩy riêng.
- **Thành phần:** Tương tự thẻ đơn hàng ở Dashboard nhưng chiếm diện tích lớn, có âm thanh thông báo.

#### C. Màn hình Chuyến đi hiện tại (`ActiveTripScreen`)
- **Giai đoạn 1: Di chuyển tới điểm lấy hàng**
    - Trạng thái: `ACCEPTED`.
    - Hiển thị: Bản đồ dẫn đường tới điểm lấy, thông tin khách hàng (Tên, SĐT).
    - Nút: **"ĐÁ TỚI ĐIỂM ĐÓN"**.
- **Giai đoạn 2: Bắt đầu giao hàng**
    - Trạng thái: `PICKED_UP`.
    - Luồng: Tài xế nhận hàng -> Nhấn nút xác nhận.
    - Hiển thị: Thông tin đơn hàng (Tên hàng, Khối lượng), Bản đồ đường đi tới điểm giao.
    - Nút: **"BẮT ĐẦU GIAO HÀNG"**.
- **Giai đoạn 3: Hoàn thành đơn hàng**
    - Trạng thái: `DELIVERED`.
    - Hiển thị: Điểm giao hàng, Tổng tiền cần thu (nếu là tiền mặt).
    - Nút: **"HOÀN THÀNH ĐƠN"**.
- **API sử dụng:** 
  - `GET /orders/:id`: Lấy chi tiết đơn.
  - `PUT /driver/orders/:id/update`: Cập nhật từng trạng thái (`ACCEPTED` -> `PICKED_UP` -> `DELIVERED`).

---

### 2.3. Phân vùng: Tab Hoạt động (Lịch sử)

#### A. Màn hình Lịch sử Chuyến đi (`ActivityHistoryScreen`)
- **Vị trí:** **Tab Hoạt động**.
- **Mục tiêu:** Giúp tài xế tra cứu nhanh các đơn hàng đã thực hiện, đang thực hiện hoặc đã hủy để quản lý công việc.
- **Thành phần chi tiết:**
    1. **Top Tab Navigator:**
        - **Tất cả:** Hiển thị toàn bộ danh sách đơn hàng.
        - **Hoàn thành:** Lọc các đơn có trạng thái `DELIVERED`.
        - **Đã hủy:** Lọc các đơn có trạng thái `CANCELLED`.
    2. **Thanh công cụ (Tools):**
        - Ô tìm kiếm theo Mã đơn hàng hoặc địa chỉ.
        - Bộ lọc thời gian: "Hôm nay", "7 ngày qua", "Tùy chọn".
    3. **Danh sách thẻ chuyến đi (Trip Cards):**
        - **Header:** Mã đơn hàng (VD: #BG1023) và Tag trạng thái màu sắc (Xanh lá: Thành công, Đỏ: Đã hủy).
        - **Body:** 
            - Thời gian: `14:30 - 20/03/2024`.
            - Lộ trình: Hiển thị 2 điểm (Icon Đón/Giao) kèm địa chỉ rút gọn.
            - Tổng tiền: Hiển thị số tiền lớn, nổi bật (VD: **150.000đ**).
        - **Footer:** Nút "Xem chi tiết" hoặc icon mũi tên.

- **Tương tác:**
    - **Pull-to-refresh:** Kéo xuống để cập nhật danh sách mới nhất.
    - **Infinite Scroll:** Tự động tải thêm khi cuộn xuống cuối trang (phân trang).

- **API sử dụng:** 
  - `GET /driver/orders`: Lấy danh sách kèm phân trang (`page`, `limit`) và lọc (`status`).

#### B. Màn hình Chi tiết Hóa đơn (`TripDetailScreen`)
- **Vị trí:** Thâm nhập sâu từ ActivityHistoryScreen (Stack Navigation).
- **Thành phần chi tiết:**
    1. **Bản đồ tóm tắt (Mini Map View):** 
        - Hiển thị tĩnh (Static Map) vẽ lại cung đường từ điểm đón đến điểm giao.
    2. **Thông tin chuyến đi:**
        - Thời gian bắt đầu và kết thúc thực tế.
        - Quãng đường di chuyển (Km).
        - Loại xe sử dụng (VAN, TRUCK...).
    3. **Chi tiết khách hàng:** Tên và thông tin liên lạc (chỉ hiển thị đầy đủ nếu đơn đang hoạt động).
    4. **Bảng kê tài chính (Billing):**
        - Giá cước thực tế.
        - Phí dịch vụ (Hệ thống khấu trừ).
        - Khuyến mãi khách hàng áp dụng.
        - **Thu nhập thực tế tài xế nhận được** (Màu xanh lá, cỡ chữ lớn).
    5. **Ảnh minh chứng (Proof Image):** Hiển thị ảnh chụp hiện trường/hàng hóa nếu là đơn đã hoàn thành.

- **API sử dụng:** 
  - `GET /orders/:id`: Xem lại toàn bộ dữ liệu đơn hàng và lịch đóng/mở trạng thái.

---

### 2.4. Phân vùng: Tab Thu nhập (Ví tiền)

#### A. Màn hình Thống kê Thu nhập (`EarningsScreen`)
- **Vị trí:** **Tab Thu nhập**.
- **Thành phần:** Biểu đồ, Tổng số dư, Danh sách giao dịch ví.
- **API sử dụng:** 
  - `GET /driver/stats`: Lấy dữ liệu biểu đồ và các chỉ số KPI theo thời gian.

---

### 2.5. Phân vùng: Tab Tài khoản (Cá nhân)

#### A. Màn hình Hồ sơ Tài xế (`ProfileScreen`)
- **Vị trí:** **Tab Tài khoản**.
- **Mục tiêu:** Quản lý thông tin định danh, trạng thái hoạt động và các thiết lập ứng dụng.
- **Thành phần chi tiết:**
    1. **Header Hồ sơ (Profile Header):**
        - Avatar lớn (hình tròn), có nút biểu tượng camera để đổi ảnh nhanh.
        - Tên tài xế (VD: **Nguyễn Văn A**) và ID tài xế.
        - Chỉ số đánh giá: `4.9 ⭐` (Rating trung bình).
    2. **Thông tin định danh nhanh:**
        - Loại xe đang đăng ký (VD: Xe tải 500kg).
        - Biển số xe (VD: 29A-123.45).
    3. **Danh mục chức năng (Action Menu):**
        - **Cài đặt tài khoản:** Chỉnh sửa thông tin cá nhân (Tên, Email).
        - **Quản lý tài liệu:** Xem trạng thái phê duyệt và cập nhật giấy tờ (GPLX, Đăng ký xe).
        - **Đổi mật khẩu:** Cập nhật bảo mật.
        - **Trung tâm hỗ trợ:** Gửi phản hồi hoặc báo cáo sự cố (Ticket).
        - **Điều khoản & Chính sách:** Các quy định của BenGo.
        - **Đăng xuất:** Nút màu đỏ ở cuối danh sách.

- **Tương tác:**
    - Click vào Avatar: Mở thư viện ảnh hoặc Camera (API `POST /upload` -> `PUT /auth/profile`).
    - Click vào các mục menu: Chuyển hướng đến các màn hình con tương ứng.

- **API sử dụng:** 
  - `GET /auth/profile`: Lấy toàn bộ thông tin hiển thị.

#### B. Màn hình Chỉnh sửa Hồ sơ (`EditProfileScreen`)
- **Vị trí:** Stack Navigation (Từ ProfileScreen).
- **Thành phần:** 
    - Các ô nhập liệu (Input): Tên hiển thị, Email.
    - Số điện thoại (Chế độ chỉ đọc - Read only để bảo mật).
    - Nút "LƯU THAY ĐỔI" ở dưới cùng.
- **API sử dụng:** `PUT /auth/profile` để cập nhật dữ liệu mới.

#### C. Màn hình Quản lý tài liệu (`DocumentStatusScreen`)
- **Vị trí:** Stack Navigation.
- **Mục tiêu:** Kiểm tra giấy tờ nào đã được duyệt (Approved), đang chờ (Pending) hoặc bị từ chối (Rejected).
- **Luồng:** Cho phép chụp lại và tải lên nếu giấy tờ bị từ chối.
- **API sử dụng:** `POST /driver/documents`.

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
