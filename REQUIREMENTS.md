Đề tài: Xây dựng hệ thống cung cấp dịch vụ vận tải, kết nối tài xế đến người dùng,
sử dụng ReactJS, NodeJs, React Native, MongoDB
Tên đề tài (Viết tắt): BenGo
Lý do chọn đề tài:
Trong bối cảnh thương mại điện tử và kinh doanh cá nhân ngày càng phát triển, nhu
cầu vận chuyển hàng hóa cồng kềnh diễn ra thường xuyên nhưng các giải pháp hiện
tại vẫn còn nhiều hạn chế như kết nối chậm, giá cả thiếu minh bạch và khó theo dõi
lộ trình vận chuyển. Bên cạnh đó, nhiều tài xế xe bán tải chưa khai thác hiệu quả
thời gian nhàn rỗi, gây lãng phí nguồn lực xã hội.
Vì vậy, nhóm lựa chọn đề tài xây dựng hệ thống kết nối vận chuyển hàng hóa cồng
kềnh theo mô hình on-demand nhằm giải quyết bài toán kết nối nhanh chóng giữa
khách hàng và tài xế, tối ưu chi phí, tăng tính minh bạch và nâng cao trải nghiệm
người dùng. Đề tài có tính thực tiễn cao, phù hợp với xu hướng công nghệ hiện nay
và có khả năng mở rộng triển khai trong thực tế.
Mục tiêu đề tài:
● Kết nối nhanh chóng
● Minh bạch về giá cả
● Theo dõi vận chuyển thời gian thực
● Tối ưu hiệu quả cho tài xế
● Đảm bảo an toàn và chất lượng dịch vụ
● Hỗ trợ quản lý và vận hành
● Khả năng mở rộng trong tương lai
Technology/algorithm:
● Front-end: ReactJs
● Back-end: NodeJs
● Mobile: ReactNative● Data: MongoDB
● Realtime: WebSocket
● Map: Google Maps Platform
● Encoding: TLS/SSL
Một số website, App kham khảo: Lalamove, Grab, AhaMove, BE
Actors:

- Customer (Khách hàng): Người sử dụng hệ thống để tạo yêu cầu vận chuyển
  hàng hóa, theo dõi quá trình giao hàng và thanh toán dịch vụ.
- Driver (Tài xế): Người cung cấp dịch vụ vận chuyển, nhận đơn hàng từ hệ
  thống, thực hiện giao nhận hàng hóa và cập nhật trạng thái chuyến đi.
- Dispatcher (Điều phối viên): Người giám sát và hỗ trợ hoạt động vận chuyển,
  theo dõi đơn hàng và tài xế theo thời gian thực, xử lý các trường hợp đặc biệt.
- Administrator (Quản trị viên): Người quản lý và cấu hình toàn bộ hệ thống,
  bao gồm người dùng, đơn hàng, giá cước, nội dung và báo cáo.
  Yêu cầu chức năng (Bắt buộc):

1. Customer (Khách hàng)
   ● Register / Đăng ký
   ● Login / Đăng nhập
   ● Profile management / Quản lý hồ sơ
   ● Create shipping request / Tạo yêu cầu vận chuyển
   ● Upload goods photos / Tải ảnh hàng hóa
   ● Automatic pricing / Báo giá tự động
   ● View recommended drivers / Xem tài xế đề xuất
   ● Track driver (GPS) / Theo dõi tài xế
   ● In-app chat & call / Chat – gọi trong app● Online payment / Thanh toán trực tuyến
   ● Rate driver / Đánh giá tài xế
   ● Trip history & invoices /Xem lịch sử & hóa đơn
2. Driver (Tài xế)
   ● Driver registration / Đăng ký tài xế
   ● Document upload & verification / Tải & xác thực giấy tờ
   ● Online / Offline status / Trạng thái hoạt động
   ● Receive trip requests / Nhận yêu cầu chuyến đi
   ● View trip details / Xem chi tiết chuyến đi
   ● Accept / Reject trip / Nhận – từ chối chuyến
   ● Map navigation / Dẫn đường bản đồ
   ● Update trip status / Cập nhật trạng thái chuyến
   ● Upload delivery proof / Tải ảnh xác nhận giao hàng
   ● View earnings & statistics / Xem thu nhập & thống kê
3. Dispatcher (Điều phối)
   ● Monitor orders / Theo dõi đơn hàng
   ● View driver locations / Xem vị trí tài xế
   ● Manual trip assignment / Phân chuyến thủ công
   ● Manage special trips / Quản lý chuyến đặc biệt
   ● Support customers & drivers / Hỗ trợ KH & tài xế
   ● Issue tracking & notes / Ghi chú & xử lý sự cố
   ● Driver performance tracking / Theo dõi hiệu suất tài xế
4. Administration (Quản trị)● User management / Quản lý người dùng
   ● Driver approval / Duyệt tài xế
   ● Order management / Quản lý đơn hàng
   ● Pricing configuration / Cấu hình giá
   ● Promotion management / Quản lý khuyến mãi
   ● Content management / Quản lý nội dung
   ● Reports & statistics / Báo cáo & thống kê
   ● Complaint handling / Xử lý khiếu nại
   ● Role-based access control / Phân quyền người dùng
   Định hướng kỹ thuật, mục tiêu vận hành và an toàn hệ thống:
5. High Availability (Tính sẵn sàng cao): App khác, App tài xế, Server,
   database
6. Data Security & Privacy (Bảo mật & quyền riêng tư): Mã hóa dữ liệu (từ
   lúc gửi đến lúc lưu), Tuân thủ quy định bảo mật, Thường xuyên kiểm tra, vá
   lỗi bảo mật
7. Thuật toán ghép chuyến thông minh: Dựa trên: Vị trí tài xế, Loại xe, tải
   trọng, Điểm đến, Tình trạng giao thông, Đánh giá tài xế
8. Dự đoán nhu cầu từ dữ liệu cũ: Biết lúc nào, khu vực nào hay đông đơn,
   Gợi ý tài xế đến khu vực đó trước
9. GPS & liên lạc trong app: Thanh toán online an toàn, nhanh. Có quy trình
   xử lý khiếu nại rõ ràng. Có bảo hiểm hàng hóa
10. Đánh giá & kiểm duyệt tài xế: Khách đánh giá tài xế. Tài xế đánh giá khách.
    Kiểm tra giấy tờ tài xế & xe
    Một số chức năng mở rộng (Không bắt buộc):

- Đặt lịch trước (Scheduled Booking).
- AI hỗ trợ tạo nhanh đơn hàng.
- Chatbot hỗ trợ khách hàng.
- Báo cáo & phân tích nâng cao: (Thống kê chi tiết theo khu vực, thời gian, loại
  hàng và hiệu suất tài xế.)- Tính giá linh hoạt theo thời điểm (giờ cao điểm, trời mưa giá sẽ cao hơn bình
  thường)
