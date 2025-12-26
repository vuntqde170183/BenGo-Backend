# BenGo API Documentation - Transport & Delivery Service

**Base URL:** `http://localhost:3000/api/v1`  
**Swagger Docs:** `http://localhost:3000/docs`

---

## 📑 Table of Contents

1. [Auth](#1-auth)
2. [Admin (21 routes)](#2-admin-routes-)
3. [Orders](#3-orders)
4. [Driver](#4-driver)
5. [Dispatcher](#5-dispatcher)
6. [Chat](#6-chat)
7. [Payments & Upload](#7-payments--upload)
8. [Example Accounts](#example-accounts)

---

## 1. Auth

### 1.1. Register

**Method:** `POST`  
**Path:** `/auth/register`  
**Access:** Public  
**Payload:**

```json
{
  "phone": "0901234567",
  "name": "Nguyen Van A",
  "password": "password123",
  "type": "CUSTOMER" // or "DRIVER"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "phone": "0901234567",
      "name": "Nguyen Van A",
      "role": "CUSTOMER"
    }
  }
}
```

### 1.2. Login

**Method:** `POST`  
**Path:** `/auth/login`  
**Access:** Public  
**Payload:**

```json
{
  "phone": "0901234567",
  "password": "password123"
}
```

**Response:** Same as Register

### 1.3. Get Profile

**Method:** `GET`  
**Path:** `/auth/profile`  
**Access:** Private (All roles)  
**Headers:** `Authorization: Bearer <token>`  
**Response:**

```json
{
  "statusCode": 200,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "phone": "0901234567",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "CUSTOMER",
    "walletBalance": 500000,
    "rating": 5,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.4. Update Profile

**Method:** `PUT`  
**Path:** `/auth/profile`  
**Access:** Private (All roles)  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**

```json
{
  "name": "Nguyen Van B",
  "avatar": "https://example.com/avatar.jpg",
  "email": "newmail@example.com"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Cập nhật thông tin thành công",
  "data": { ...updatedUser }
}
```

### 1.5. Forgot Password

**Method:** `POST`  
**Path:** `/auth/forgot-password`  
**Payload:** `{ "phone": "0901234567" }`  
**Response:** `{ "success": true, "message": "OTP sent" }`

### 1.6. Reset Password

**Method:** `POST`  
**Path:** `/auth/reset-password`  
**Payload:**

```json
{
  "phone": "0901234567",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

---

## 2. Admin Routes 🔐

> **Note:** All admin routes require `Authorization: Bearer <admin_token>`

### 👥 User Management

#### 2.1. Get All Users

**Method:** `GET`  
**Path:** `/admin/users`  
**Query Params:**

- `role` (optional): `CUSTOMER` | `DRIVER` | `ADMIN` | `DISPATCHER`
- `search` (optional): Search by name/phone/email
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Example:** `/admin/users?role=CUSTOMER&search=Nguyen&page=1&limit=10`

**Response:**

```json
{
  "data": [
    {
      "id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "phone": "0901234567",
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "role": "CUSTOMER",
      "avatar": null,
      "rating": 5,
      "walletBalance": 500000
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### 2.2. Get User Details

**Method:** `GET`  
**Path:** `/admin/users/:id`  
**Response:** Full user object with all fields

#### 2.3. Block/Unblock User

**Method:** `PUT`  
**Path:** `/admin/users/:id/block`  
**Payload:**

```json
{
  "blocked": true,
  "reason": "Spam orders"
}
```

#### 2.4. Delete User

**Method:** `DELETE`  
**Path:** `/admin/users/:id`  
**Response:** `{ "success": true }`

### 🚗 Driver Management

#### 2.5. Get All Drivers

**Method:** `GET`  
**Path:** `/admin/drivers`  
**Query:** `status` (optional): `PENDING_APPROVAL` | `APPROVED` | `LOCKED`  
**Response:**

```json
{
  "data": [
    {
      "_id": "64f5...",
      "userId": {
        "name": "Nguyen Van Driver",
        "phone": "0911234567",
        "email": "driver@example.com",
        "rating": 4.8
      },
      "vehicleType": "VAN",
      "plateNumber": "29A-12345",
      "licenseImages": ["url1", "url2"],
      "isOnline": true,
      "location": {
        "type": "Point",
        "coordinates": [105.83416, 21.02776]
      },
      "status": "APPROVED"
    }
  ],
  "total": 50
}
```

#### 2.6. Approve/Reject Driver

**Method:** `POST`  
**Path:** `/admin/drivers/approval`  
**Payload:**

```json
{
  "driverId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "action": "APPROVE" // or "REJECT"
}
```

### 📦 Order Management

#### 2.7. Get All Orders

**Method:** `GET`  
**Path:** `/admin/orders`  
**Query:**

- `status` (optional): `PENDING` | `ACCEPTED` | `PICKED_UP` | `DELIVERED` | `CANCELLED`
- `page`, `limit`

**Response:**

```json
{
  "data": [
    {
      "_id": "64f5...",
      "customerId": {
        "name": "Customer Name",
        "phone": "0901234567"
      },
      "driverId": {
        "name": "Driver Name",
        "phone": "0911234567"
      },
      "pickup": {
        "address": "123 Nguyen Van Linh",
        "lat": 21.0244,
        "lng": 105.8587
      },
      "dropoff": {
        "address": "456 Tran Duy Hung",
        "lat": 21.0583,
        "lng": 105.8233
      },
      "vehicleType": "VAN",
      "status": "DELIVERED",
      "totalPrice": 150000,
      "distanceKm": 5.2,
      "paymentMethod": "CASH",
      "paymentStatus": "PAID",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": { "total": 500, "page": 1, "limit": 20 }
}
```

#### 2.8. Get Order Details

**Method:** `GET`  
**Path:** `/admin/orders/:id`

#### 2.9. Force Cancel Order

**Method:** `PUT`  
**Path:** `/admin/orders/:id/cancel`  
**Payload:** `{ "reason": "Admin override due to complaint" }`

### 💰 Pricing Configuration

#### 2.10. Get Pricing Config

**Method:** `GET`  
**Path:** `/admin/pricing`  
**Response:**

```json
[
  {
    "_id": "64f5...",
    "vehicleType": "BIKE",
    "basePrice": 15000,
    "perKm": 5000,
    "peakHourMultiplier": 1.2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "vehicleType": "VAN",
    "basePrice": 50000,
    "perKm": 12000,
    "peakHourMultiplier": 1.5
  },
  {
    "vehicleType": "TRUCK",
    "basePrice": 100000,
    "perKm": 18000,
    "peakHourMultiplier": 1.8
  }
]
```

#### 2.11. Update Pricing

**Method:** `PUT`  
**Path:** `/admin/pricing`  
**Payload:**

```json
{
  "basePrice": 20000,
  "perKm": 6000,
  "peakHourMultiplier": 1.3
}
```

**Note:** Updates pricing for all vehicle types

### 🎁 Promotion Management

#### 2.12. Get All Promotions

**Method:** `GET`  
**Path:** `/admin/promotions`  
**Query:** `active` (optional): `true` | `false`

**Response:**

```json
{
  "data": [
    {
      "_id": "64f5...",
      "code": "SUMMER2024",
      "title": "Summer Sale",
      "description": "Get 20% off on all trips",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minOrderValue": 50000,
      "maxDiscountAmount": 100000,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.999Z",
      "usageLimit": 100,
      "usedCount": 25,
      "isActive": true,
      "applicableVehicles": ["BIKE", "VAN"]
    }
  ],
  "total": 10
}
```

#### 2.13. Create Promotion

**Method:** `POST`  
**Path:** `/admin/promotions`  
**Payload:**

```json
{
  "code": "NEWYEAR2024",
  "title": "New Year Promotion",
  "description": "Special discount for new year",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50000,
  "minOrderValue": 100000,
  "maxDiscountAmount": 50000,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "usageLimit": 500,
  "applicableVehicles": ["VAN", "TRUCK"]
}
```

#### 2.14. Update Promotion

**Method:** `PUT`  
**Path:** `/admin/promotions/:id`  
**Payload:** (Any fields from create)

```json
{
  "title": "Updated Title",
  "isActive": false
}
```

#### 2.15. Delete Promotion

**Method:** `DELETE`  
**Path:** `/admin/promotions/:id`

### 🎫 Support Tickets / Complaints

#### 2.16. Get All Tickets

**Method:** `GET`  
**Path:** `/admin/tickets`  
**Query:**

- `status`: `OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`
- `priority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`

**Response:**

```json
{
  "data": [
    {
      "_id": "64f5...",
      "userId": {
        "name": "Customer Name",
        "phone": "0901234567",
        "email": "customer@example.com"
      },
      "subject": "Driver was rude",
      "content": "The driver was very unprofessional...",
      "status": "OPEN",
      "priority": "HIGH",
      "assignedTo": null,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "total": 15
}
```

#### 2.17. Get Ticket Details

**Method:** `GET`  
**Path:** `/admin/tickets/:id`

#### 2.18. Assign Ticket

**Method:** `PUT`  
**Path:** `/admin/tickets/:id/assign`  
**Payload:** `{ "assignedTo": "dispatcherId" }`

#### 2.19. Update Ticket Status

**Method:** `PUT`  
**Path:** `/admin/tickets/:id/status`  
**Payload:**

```json
{
  "status": "RESOLVED",
  "resolution": "Refunded customer and warned driver"
}
```

### 📊 Reports & Statistics

#### 2.20. Get Reports

**Method:** `GET`  
**Path:** `/admin/reports`  
**Query:** `type`: `REVENUE` | `ALL`  
**Response:**

```json
{
  "revenue": {
    "daily": 18540000,
    "monthly": 450000000
  }
}
```

#### 2.21. Dashboard Overview

**Method:** `GET`  
**Path:** `/admin/dashboard`  
**Response:**

```json
{
  "users": 2547,
  "drivers": 245,
  "orders": 1245,
  "activeOrders": 132,
  "revenue": 450000000,
  "pendingTickets": 15
}
```

---

## 3. Orders

### 3.1. Estimate Price

**Method:** `POST`  
**Path:** `/orders/estimate`  
**Payload:**

```json
{
  "origin": {
    "lat": 21.0244,
    "lng": 105.8587,
    "address": "Hanoi Opera House"
  },
  "destination": {
    "lat": 21.0583,
    "lng": 105.8233,
    "address": "West Lake"
  },
  "vehicleType": "VAN"
}
```

**Response:**

```json
{
  "distance": 4.5,
  "duration": 15,
  "price": 75000,
  "currency": "VND"
}
```

### 3.2. Create Order

**Method:** `POST`  
**Path:** `/orders`  
**Headers:** `Authorization: Bearer <token>`  
**Payload:**

```json
{
  "origin": {
    "lat": 21.0244,
    "lng": 105.8587,
    "address": "123 Nguyen Van Linh"
  },
  "destination": {
    "lat": 21.0583,
    "lng": 105.8233,
    "address": "456 Tran Duy Hung"
  },
  "vehicleType": "VAN",
  "goodsImages": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "note": "Handle with care, fragile items"
}
```

**Response:**

```json
{
  "orderId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "status": "PENDING",
  "totalPrice": 75000,
  "distanceKm": 4.5,
  "estimatedTime": 15,
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### 3.3. Order History

**Method:** `GET`  
**Path:** `/orders/history`  
**Query:**

- `page` (default: 1)
- `limit` (default: 10)
- `status`: `PENDING` | `COMPLETED` | `CANCELLED`

**Response:**

```json
{
  "data": [...orders],
  "meta": { "total": 50, "page": 1 }
}
```

### 3.4. Get Order Detail

**Method:** `GET`  
**Path:** `/orders/:id`  
**Response:** Full order object with driver info, tracking path, etc.

### 3.5. Cancel Order

**Method:** `PUT`  
**Path:** `/orders/:id/cancel`  
**Payload:** `{ "reason": "Changed my mind" }`

### 3.6. Rate Driver

**Method:** `POST`  
**Path:** `/orders/:id/rate`  
**Payload:**

```json
{
  "star": 5,
  "comment": "Very professional and fast!"
}
```

---

## 4. Driver

### 4.1. Toggle Online Status

**Method:** `PUT`  
**Path:** `/driver/status`  
**Headers:** `Authorization: Bearer <driver_token>`  
**Payload:**

```json
{
  "isOnline": true,
  "location": {
    "lat": 21.0244,
    "lng": 105.8587
  }
}
```

### 4.2. Get Pending Requests

**Method:** `GET`  
**Path:** `/driver/orders/pending`  
**Query:**

- `lat`, `lng`: Current driver location
- `radius` (default: 5): Search radius in km

**Example:** `/driver/orders/pending?lat=21.0244&lng=105.8587&radius=10`

**Response:**

```json
[
  {
    "orderId": "64f5...",
    "distance": 2.3,
    "price": 75000,
    "pickup": {
      "address": "123 Nguyen Van Linh",
      "lat": 21.0244,
      "lng": 105.8587
    },
    "dropoff": {
      "address": "456 Tran Duy Hung",
      "lat": 21.0583,
      "lng": 105.8233
    },
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### 4.3. Accept Order

**Method:** `POST`  
**Path:** `/driver/orders/:id/accept`  
**Response:**

```json
{
  "success": true,
  "order": { ...fullOrderDetails }
}
```

### 4.4. Update Trip Status

**Method:** `PUT`  
**Path:** `/driver/orders/:id/update`  
**Payload:**

```json
{
  "status": "PICKED_UP", // or "DELIVERED"
  "proofImage": "https://example.com/proof.jpg" // Required for DELIVERED
}
```

### 4.5. Update Real-time Location

**Method:** `PUT`  
**Path:** `/driver/location`  
**Payload:**

```json
{
  "lat": 21.0244,
  "lng": 105.8587,
  "heading": 90
}
```

### 4.6. Upload Documents

**Method:** `POST`  
**Path:** `/driver/documents`  
**Payload:**

```json
{
  "type": "LICENSE", // or "VEHICLE"
  "imageUrl": "https://cloudinary.com/..."
}
```

### 4.7. View Earnings/Stats

**Method:** `GET`  
**Path:** `/driver/stats`  
**Query:** `from`, `to` (date range, optional)  
**Example:** `/driver/stats?from=2024-01-01&to=2024-01-31`

**Response:**

```json
{
  "totalEarnings": 15000000,
  "totalTrips": 150,
  "rating": 4.8,
  "onlineHours": 240,
  "acceptanceRate": 95
}
```

---

## 5. Dispatcher

### 5.1. Monitor Orders

**Method:** `GET`  
**Path:** `/dispatcher/orders`  
**Query:** `status`: `PENDING` | `ACTIVE` | `ALL`  
**Response:**

```json
[
  {
    "id": "64f5...",
    "from": "123 Nguyen Van Linh",
    "to": "456 Tran Duy Hung",
    "status": "PENDING",
    "customerId": {...},
    "driverId": null,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### 5.2. View Driver Map

**Method:** `GET`  
**Path:** `/dispatcher/drivers`  
**Query:** `lat`, `lng`, `radius`  
**Response:**

```json
[
  {
    "id": "64f5...",
    "name": "Driver Name",
    "location": {
      "lat": 21.0244,
      "lng": 105.8587
    },
    "status": "ONLINE",
    "currentOrderId": null
  }
]
```

### 5.3. Manual Dispatch

**Method:** `POST`  
**Path:** `/dispatcher/assign`  
**Payload:**

```json
{
  "orderId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "driverId": "64f5a1b2c3d4e5f6g7h8i9j1"
}
```

### 5.4. Support Tickets

**Method:** `GET`  
**Path:** `/dispatcher/support`  
**Query:** `status`: `OPEN` | `IN_PROGRESS`  
**Response:** Same as Admin tickets endpoint

---

## 6. Chat

### 6.1. Get Conversations

**Method:** `GET`  
**Path:** `/chat/conversations`  
**Headers:** `Authorization: Bearer <token>`  
**Response:**

```json
[
  {
    "roomId": "64f5...",
    "orderId": "64f5...",
    "participants": ["customerId", "driverId"],
    "lastMessage": "I'm on my way",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### 6.2. Get Messages

**Method:** `GET`  
**Path:** `/chat/:id/messages`  
**Query:** `page` (default: 1)  
**Response:**

```json
[
  {
    "_id": "64f5...",
    "senderId": "64f5...",
    "content": "Hello, I'm waiting at the gate",
    "type": "TEXT",
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
]
```

### 6.3. Send Message

**Method:** `POST`  
**Path:** `/chat/:id/send`  
**Payload:**

```json
{
  "content": "I'll be there in 5 minutes",
  "type": "TEXT" // or "IMAGE"
}
```

---

## 7. Payments & Upload

### 7.1. Create Payment QR

**Method:** `POST`  
**Path:** `/payment/create-qr`  
**Payload:**

```json
{
  "amount": 75000,
  "orderId": "64f5a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**

```json
{
  "qrRaw": "https://qr.sepay.vn/img?acc=...",
  "bankInfo": {
    "accountNumber": "1234567890",
    "bankCode": "VCB",
    "accountName": "BenGo Transport"
  }
}
```

### 7.2. Payment Webhook (SePay)

**Method:** `POST`  
**Path:** `/payment/webhook`  
**Note:** Called by SePay server, not client  
**Payload:**

```json
{
  "gateway": "VCB",
  "transactionDate": "2024-01-01 10:00:00",
  "accountNumber": "1234567890",
  "transferAmount": 75000,
  "transferContent": "BGORD64f5a1b2c3d4e5f6g7h8i9j0",
  "referenceCode": "REF123456"
}
```

### 7.3. Upload Image

**Method:** `POST`  
**Path:** `/upload`  
**Content-Type:** `multipart/form-data`  
**Body:**

- `file`: Image file (jpg, jpeg, png, gif)
- Max size: 5MB

**Response:**

```json
{
  "statusCode": 200,
  "message": "Upload hình ảnh thành công",
  "data": {
    "public_id": "BenGo-BE/abc123",
    "url": "https://res.cloudinary.com/.../abc123.jpg",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "bytes": 102400
  }
}
```

---

## Example Accounts

| Role           | Email/Phone                  | Password         |
| -------------- | ---------------------------- | ---------------- |
| **ADMIN**      | `adminbengo@gmail.com`       | `Admin123!`      |
| **DISPATCHER** | `dispatcherbengo1@gmail.com` | `Dispatcher123!` |
| **DRIVER**     | `tranhonamson@gmail.com`     | `Driver123!`     |
| **CUSTOMER**   | `nguyenngochavy@gmail.com`   | `Customer123!`   |

**Run seed script to populate database:**

```bash
npm run seed
```

---

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup environment variables (.env):**

   ```env
   MONGO_URI=mongodb://localhost:27017/bengo
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Seed database:**

   ```bash
   npm run seed
   ```

4. **Start development server:**

   ```bash
   npm run start:dev
   ```

5. **Access Swagger docs:**
   Open `http://localhost:3000/docs`

---

## Notes

- All routes marked **[ADMIN]** require Admin role
- Protected routes need `Authorization: Bearer <token>` header
- Timestamps are in ISO 8601 format (UTC)
- Prices are in VND (Vietnamese Dong)
- Distance is in kilometers

---

**Last Updated:** 2024-12-27  
**API Version:** 1.0.0
