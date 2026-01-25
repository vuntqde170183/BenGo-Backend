# API Phân Quyền Người Dùng

## Tổng quan
API này cho phép Admin cập nhật vai trò (role) của người dùng trong hệ thống BenGo.

## Endpoint
```
PUT /admin/users/:id/role
```

## Authentication
- Yêu cầu: Bearer Token (JWT)
- Quyền: ADMIN hoặc SUPERADMIN

## Request Parameters

### Path Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | string | ✅ | ID của người dùng cần cập nhật role |

### Body Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| role | string | ✅ | Vai trò mới: `CUSTOMER`, `DRIVER`, `ADMIN`, `DISPATCHER`, `SUPERADMIN` |
| reason | string | ❌ | Lý do thay đổi vai trò (tùy chọn) |
| driverProfile | object | ⚠️ | Thông tin tài xế (bắt buộc khi chuyển sang DRIVER) |

### Driver Profile Object (khi role = DRIVER)
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| vehicleType | string | ✅ | Loại xe: `BIKE`, `VAN`, `TRUCK` |
| plateNumber | string | ✅ | Biển số xe |
| rating | number | ❌ | Điểm đánh giá (mặc định: 5) |
| licenseImage | string | ❌ | URL ảnh giấy phép lái xe |
| identityNumber | string | ❌ | Số CCCD/CMND |
| identityFrontImage | string | ❌ | URL ảnh mặt trước CCCD |
| identityBackImage | string | ❌ | URL ảnh mặt sau CCCD |
| vehicleRegistrationImage | string | ❌ | URL ảnh đăng ký xe |
| drivingLicenseNumber | string | ❌ | Số giấy phép lái xe |
| bankInfo | object | ❌ | Thông tin ngân hàng |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Cập nhật vai trò người dùng thành công",
  "data": {
    "userId": "694eea39736c474360b86b15",
    "name": "Nguyễn Văn A",
    "oldRole": "CUSTOMER",
    "newRole": "DISPATCHER",
    "reason": "Thăng chức lên điều phối viên"
  }
}
```

### Error Responses

#### 400 Bad Request - Thiếu thông tin Driver
```json
{
  "success": false,
  "message": "Cần cung cấp thông tin vehicleType và plateNumber khi chuyển sang vai trò DRIVER"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc không có quyền admin"
}
```

## Ví dụ sử dụng

### 1. Chuyển CUSTOMER thành DISPATCHER
```bash
curl -X PUT http://localhost:3000/admin/users/694eea39736c474360b86b15/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "DISPATCHER",
    "reason": "Thăng chức lên điều phối viên"
  }'
```

### 2. Chuyển CUSTOMER thành DRIVER
```bash
curl -X PUT http://localhost:3000/admin/users/694eea39736c474360b86b15/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "DRIVER",
    "reason": "Đăng ký làm tài xế",
    "driverProfile": {
      "vehicleType": "BIKE",
      "plateNumber": "59-S2 123.45",
      "rating": 5,
      "licenseImage": "https://example.com/license.jpg",
      "identityNumber": "123456789012",
      "identityFrontImage": "https://example.com/id-front.jpg",
      "identityBackImage": "https://example.com/id-back.jpg",
      "vehicleRegistrationImage": "https://example.com/vehicle-reg.jpg",
      "drivingLicenseNumber": "B2-12345678",
      "bankInfo": {
        "bankName": "Vietcombank",
        "accountNumber": "1234567890",
        "accountHolder": "Nguyen Van A"
      }
    }
  }'
```

### 3. Chuyển DRIVER về CUSTOMER
```bash
curl -X PUT http://localhost:3000/admin/users/694eea39736c474360b86b15/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "CUSTOMER",
    "reason": "Ngừng hoạt động tài xế"
  }'
```

## Lưu ý quan trọng

### 1. Chuyển sang DRIVER
- **Bắt buộc** cung cấp `driverProfile` với `vehicleType` và `plateNumber`
- Hệ thống sẽ tự động tạo hồ sơ Driver mới
- Trạng thái driver mặc định: `APPROVED`
- Rating mặc định: `5`

### 2. Chuyển từ DRIVER sang role khác
- Hồ sơ Driver sẽ **tự động bị xóa**
- Tất cả thông tin xe, giấy tờ sẽ mất
- Không thể khôi phục sau khi xóa

### 3. Các role có sẵn
- `CUSTOMER`: Khách hàng sử dụng dịch vụ
- `DRIVER`: Tài xế cung cấp dịch vụ vận chuyển
- `DISPATCHER`: Điều phối viên hỗ trợ và giám sát
- `ADMIN`: Quản trị viên hệ thống
- `SUPERADMIN`: Quản trị viên cấp cao nhất

### 4. Quyền hạn
- Chỉ ADMIN và SUPERADMIN mới có thể sử dụng API này
- Cần có JWT token hợp lệ trong header

## Testing với Swagger
Truy cập: `http://localhost:3000/api-docs`
- Tìm endpoint: `PUT /admin/users/{id}/role`
- Click "Try it out"
- Nhập userId và body request
- Click "Execute"

## Changelog
- **2026-01-25**: Tạo API phân quyền người dùng
  - Hỗ trợ chuyển đổi role
  - Tự động tạo/xóa hồ sơ Driver
  - Ghi nhận lý do thay đổi
