# BenGo API Documentation - Transport & Delivery Service

## 1. Auth

### 1.1. Register

**Method:** `POST`  
**Path:** `/api/v1/auth/register`  
**Access:** Public  
**Payload:**

```json
{
  "phone": "string",
  "name": "string",
  "password": "string",
  "type": "string" // "CUSTOMER" or "DRIVER"
}
```

### 1.2. Login

**Method:** `POST`  
**Path:** `/api/v1/auth/login`  
**Access:** Public

### 1.3. Get Profile

**Method:** `GET`  
**Path:** `/api/v1/auth/profile`  
**Access:** Private (All roles)

### 1.4. Update Profile

**Method:** `PUT`  
**Path:** `/api/v1/auth/profile`  
**Access:** Private (All roles)

### 1.5. Forgot Password

**Method:** `POST`  
**Path:** `/api/v1/auth/forgot-password`

### 1.6. Reset Password

**Method:** `POST`  
**Path:** `/api/v1/auth/reset-password`

---

## 2. Admin Routes 🔐

### 👥 User Management

#### 2.1. Get All Users **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/users`  
**Query:** `role`, `search`, `page`, `limit`

#### 2.2. Get User Details **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/users/:id`

#### 2.3. Block/Unblock User **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/users/:id/block`  
**Payload:** `{ "blocked": boolean, "reason": "string" }`

#### 2.4. Delete User **[ADMIN]**

**Method:** `DELETE`  
**Path:** `/api/v1/admin/users/:id`

### 🚗 Driver Management

#### 2.5. Get All Drivers **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/drivers`  
**Query:** `status`

#### 2.6. Approve/Reject Driver **[ADMIN]**

**Method:** `POST`  
**Path:** `/api/v1/admin/drivers/approval`  
**Payload:** `{ "driverId": "string", "action": "APPROVE" | "REJECT" }`

### 📦 Order Management

#### 2.7. Get All Orders **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/orders`  
**Query:** `status`, `page`, `limit`

#### 2.8. Get Order Details **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/orders/:id`

#### 2.9. Force Cancel Order **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/orders/:id/cancel`  
**Payload:** `{ "reason": "string" }`

### 💰 Pricing Configuration

#### 2.10. Get Pricing Config **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/pricing`

#### 2.11. Update Pricing **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/pricing`  
**Payload:** `{ "basePrice": number, "perKm": number, "peakHourMultiplier": number }`

### 🎁 Promotion Management

#### 2.12. Get All Promotions **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/promotions`  
**Query:** `active`

#### 2.13. Create Promotion **[ADMIN]**

**Method:** `POST`  
**Path:** `/api/v1/admin/promotions`  
**Payload:**

```json
{
  "code": "SUMMER2024",
  "title": "Summer Sale",
  "description": "Get 20% off",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderValue": 50000,
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "usageLimit": 100,
  "applicableVehicles": ["BIKE", "VAN"]
}
```

#### 2.14. Update Promotion **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/promotions/:id`

#### 2.15. Delete Promotion **[ADMIN]**

**Method:** `DELETE`  
**Path:** `/api/v1/admin/promotions/:id`

### 🎫 Support Tickets / Complaints

#### 2.16. Get All Tickets **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/tickets`  
**Query:** `status`, `priority`

#### 2.17. Get Ticket Details **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/tickets/:id`

#### 2.18. Assign Ticket **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/tickets/:id/assign`  
**Payload:** `{ "assignedTo": "dispatcherId" }`

#### 2.19. Update Ticket Status **[ADMIN]**

**Method:** `PUT`  
**Path:** `/api/v1/admin/tickets/:id/status`  
**Payload:** `{ "status": "RESOLVED", "resolution": "string" }`

### 📊 Reports & Statistics

#### 2.20. Get Reports **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/reports`  
**Query:** `type` (REVENUE, ALL)

#### 2.21. Dashboard Overview **[ADMIN]**

**Method:** `GET`  
**Path:** `/api/v1/admin/dashboard`

---

## 3. Orders

### 3.1. Estimate Price

**Method:** `POST`  
**Path:** `/api/v1/orders/estimate`

### 3.2. Create Order

**Method:** `POST`  
**Path:** `/api/v1/orders`

### 3.3. Order History

**Method:** `GET`  
**Path:** `/api/v1/orders/history`

### 3.4. Get Order Detail

**Method:** `GET`  
**Path:** `/api/v1/orders/:id`

### 3.5. Cancel Order

**Method:** `PUT`  
**Path:** `/api/v1/orders/:id/cancel`

### 3.6. Rate Driver

**Method:** `POST`  
**Path:** `/api/v1/orders/:id/rate`

---

## 4. Driver

### 4.1. Toggle Online Status

**Method:** `PUT`  
**Path:** `/api/v1/driver/status`

### 4.2. Get Pending Requests

**Method:** `GET`  
**Path:** `/api/v1/driver/orders/pending`

### 4.3. Accept Order

**Method:** `POST`  
**Path:** `/api/v1/driver/orders/:id/accept`

### 4.4. Update Trip Status

**Method:** `PUT`  
**Path:** `/api/v1/driver/orders/:id/update`

### 4.5. Update Real-time Location

**Method:** `PUT`  
**Path:** `/api/v1/driver/location`

### 4.6. Upload Documents

**Method:** `POST`  
**Path:** `/api/v1/driver/documents`

### 4.7. View Earnings/Stats

**Method:** `GET`  
**Path:** `/api/v1/driver/stats`

---

## 5. Dispatcher

### 5.1. Monitor Orders

**Method:** `GET`  
**Path:** `/api/v1/dispatcher/orders`

### 5.2. View Driver Map

**Method:** `GET`  
**Path:** `/api/v1/dispatcher/drivers`

### 5.3. Manual Dispatch

**Method:** `POST`  
**Path:** `/api/v1/dispatcher/assign`

### 5.4. Support Tickets

**Method:** `GET`  
**Path:** `/api/v1/dispatcher/support`

---

## 6. Chat

### 6.1. Get Conversations

**Method:** `GET`  
**Path:** `/api/v1/chat/conversations`

### 6.2. Get Messages

**Method:** `GET`  
**Path:** `/api/v1/chat/:id/messages`

### 6.3. Send Message

**Method:** `POST`  
**Path:** `/api/v1/chat/:id/send`

---

## 7. Payments & Upload

### 7.1. Create Payment QR

**Method:** `POST`  
**Path:** `/api/v1/payment/create-qr`

### 7.2. Payment Webhook (SePay)

**Method:** `POST`  
**Path:** `/api/v1/payment/webhook`

### 7.3. Upload Image

**Method:** `POST`  
**Path:** `/api/v1/upload`

---

## Feature Checklist ✅

### Completed Admin Features:

- ✅ **User Management** - View, block, delete users
- ✅ **Driver Approval** - Approve/reject driver applications
- ✅ **Order Management** - View all orders, force cancel
- ✅ **Pricing Configuration** - Set base price, per-km rates
- ✅ **Promotion Management** - CRUD for discount codes
- ✅ **Content Management** - Via support tickets system
- ✅ **Reports & Statistics** - Revenue reports, dashboard
- ✅ **Complaint Handling** - Full ticket management
- ✅ **Role-Based Access Control** - JWT Guard with role check

---

## Example Accounts

| Role           | Email                        | Password         |
| -------------- | ---------------------------- | ---------------- |
| **ADMIN**      | `adminbengo@gmail.com`       | `Admin123!`      |
| **DISPATCHER** | `dispatcherbengo1@gmail.com` | `Dispatcher123!` |
| **DRIVER**     | `tranhonamson@gmail.com`     | `Driver123!`     |
| **CUSTOMER**   | `nguyenngochavy@gmail.com`   | `Customer123!`   |

_(Full list of accounts available in `src/scripts/seed.ts`)_

---

## Notes

- All routes marked **[ADMIN]** require Admin role and JWT authentication
- Use the `Authorization: Bearer <token>` header for protected routes
- Admin accounts can be created via seed script or manually in database
- Swagger documentation available at `/docs` after running the server
