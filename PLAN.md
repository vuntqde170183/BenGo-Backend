# BenGo - Detailed Project Plan

## 1. Project Overview & Structure

**Role:** On-demand delivery service for bulky goods.
**Stack:**

- **Backend:** NestJS (Node.js) + TypeScript
- **Database:** MongoDB
- **Mobile:** React Native (Expo) + TypeScript
- **Admin Dashboard:** React + Vite + TypeScript
- **Maps:** Google Maps Platform
- **Payment:** SePay (Bank transfer automation)

### Project Directory Structure

```
BenGo/
├── BenGo-BE/           # NestJS Backend
├── BenGo-Native/       # React Native Expo App (Driver & Customer)
└── BenGo-Admin/        # React Admin Dashboard
```

---

## 2. Backend API List (NestJS)

Base URL: `/api/v1`

### Auth Module

| API Endpoint            | Method | Description              | Payload (Body)                                          | Response                                   |
| :---------------------- | :----- | :----------------------- | :------------------------------------------------------ | :----------------------------------------- |
| `/auth/register`        | POST   | Register new user/driver | `{ phone, password, name, type: 'CUSTOMER'\|'DRIVER' }` | `{ accessToken, user: { id, name, ... } }` |
| `/auth/login`           | POST   | Login                    | `{ phone, password }`                                   | `{ accessToken, user: { ... } }`           |
| `/auth/profile`         | GET    | Get current user info    | N/A (Bearer Token)                                      | `{ id, phone, name, avatar, rating, ... }` |
| `/auth/profile`         | PUT    | Update profile           | `{ name, avatar, email }`                               | `{ success: true, user: { ... } }`         |
| `/auth/forgot-password` | POST   | Request Password Reset   | `{ phone }`                                             | `{ success: true, message: "OTP sent" }`   |
| `/auth/reset-password`  | POST   | Reset Password with OTP  | `{ phone, otp, newPassword }`                           | `{ success: true }`                        |

### Booking (Order) Module

| API Endpoint         | Method | Description             | Payload (Body)                                                 | Response                                    |
| :------------------- | :----- | :---------------------- | :------------------------------------------------------------- | :------------------------------------------ |
| `/orders/estimate`   | POST   | Get price estimation    | `{ origin: {lat, lng}, destination: {lat, lng}, vehicleType }` | `{ distance, duration, price, currency }`   |
| `/orders`            | POST   | Create shipping request | `{ origin, destination, vehicleType, goodsImages[], note }`    | `{ orderId, status: 'PENDING', ... }`       |
| `/orders/:id`        | GET    | Get order details       | N/A                                                            | `{ id, status, driver, trackingPath, ... }` |
| `/orders/:id/cancel` | PUT    | Cancel order            | `{ reason }`                                                   | `{ success: true }`                         |
| `/orders/:id/rate`   | POST   | Rate driver             | `{ star: number, comment: string }`                            | `{ success: true }`                         |
| `/orders/history`    | GET    | List user orders        | Query: `?page=1&limit=10&status=COMPLETED`                     | `{ data: [], meta: { total, page } }`       |

### Chat Module

| API Endpoint          | Method | Description    | Payload (Body)                       | Response                                  |
| :-------------------- | :----- | :------------- | :----------------------------------- | :---------------------------------------- |
| `/chat/conversations` | GET    | Get chat rooms | N/A                                  | `[{ roomId, orderId, lastMessage }]`      |
| `/chat/:id/messages`  | GET    | Get messages   | Query: `?page=1`                     | `[{ _id, senderId, content, timestamp }]` |
| `/chat/:id/send`      | POST   | Send message   | `{ content, type: 'TEXT'\|'IMAGE' }` | `{ success: true, message: {...} }`       |

### Driver Module

| API Endpoint                | Method | Description           | Payload (Body)                                     | Response                                |
| :-------------------------- | :----- | :-------------------- | :------------------------------------------------- | :-------------------------------------- |
| `/driver/status`            | PUT    | Toggle Online/Offline | `{ isOnline: boolean, location: {lat, lng} }`      | `{ success: true }`                     |
| `/driver/orders/pending`    | GET    | Get nearby requests   | Query: `?lat=...&lng=...&radius=5`                 | `[{ orderId, distance, price, ... }]`   |
| `/driver/orders/:id/accept` | POST   | Accept a trip         | N/A                                                | `{ success: true, order: { ... } }`     |
| `/driver/orders/:id/update` | PUT    | Update trip status    | `{ status: 'PICKED_UP'\|'DELIVERED', proofImage }` | `{ success: true }`                     |
| `/driver/location`          | PUT    | Update real-time GPS  | `{ lat, lng, heading }`                            | `{ success: true }`                     |
| `/driver/documents`         | POST   | Upload documents      | `{ type: 'LICENSE'\|'VEHICLE', imageUrl }`         | `{ success: true }`                     |
| `/driver/stats`             | GET    | View earnings/stats   | Query: `?from=...&to=...`                          | `{ totalEarnings, totalTrips, rating }` |

### Payment Module (SePay)

| API Endpoint         | Method | Description          | Payload (Body)                                                                                                         | Response                               |
| :------------------- | :----- | :------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| `/payment/webhook`   | POST   | Webhook for SePay    | `{ gateway, transactionDate, accountNumber, subAccount, transferAmount, transferContent, referenceCode, description }` | `{ success: true }` (Confirm to SePay) |
| `/payment/create-qr` | POST   | Create VietQR string | `{ amount, orderId }`                                                                                                  | `{ qrRaw: "...", bankInfo: {...} }`    |

### Dispatcher Module

| API Endpoint          | Method | Description           | Payload (Body)                       | Response                           |
| :-------------------- | :----- | :-------------------- | :----------------------------------- | :--------------------------------- |
| `/dispatcher/orders`  | GET    | Monitor active orders | Query: `?status=PENDING`             | `[{ id, from, to, status, ... }]`  |
| `/dispatcher/drivers` | GET    | View driver map       | Query: `?lat=...&lng=...&radius=...` | `[{ id, name, location, status }]` |
| `/dispatcher/assign`  | POST   | Manual assign         | `{ orderId, driverId }`              | `{ success: true }`                |
| `/dispatcher/support` | GET    | List support tickets  | Query: `?status=OPEN`                | `[{ id, user, content, ... }]`     |

### Administration Module

| API Endpoint              | Method | Description           | Payload (Body)                              | Response                               |
| :------------------------ | :----- | :-------------------- | :------------------------------------------ | :------------------------------------- |
| `/admin/users`            | GET    | Manage users          | Query: `?role=...&search=...`               | `{ data: [], meta: {...} }`            |
| `/admin/drivers/approval` | POST   | Approve/Reject driver | `{ driverId, action: 'APPROVE'\|'REJECT' }` | `{ success: true }`                    |
| `/admin/pricing`          | PUT    | Update pricing config | `{ basePrice, perKm, peakHourMultiplier }`  | `{ success: true }`                    |
| `/admin/reports`          | GET    | System statistics     | Query: `?type=REVENUE`                      | `{ revenue: { daily, monthly }, ... }` |

### Database Models (MongoDB)

**1. Users Collection**

- `_id`: ObjectId
- `phone`: String (Unique, Index)
- `password`: String (Hashed)
- `name`: String
- `role`: Enum `['CUSTOMER', 'DRIVER', 'ADMIN']`
- `avatar`: String (URL)
- `walletBalance`: Number (Default: 0)
- `rating`: Number (0-5, Default: 5)
- `fcmToken`: String (For Push Notification)

**2. Drivers Collection**

- `_id`: ObjectId
- `userId`: ObjectId (Ref: Users)
- `vehicleType`: Enum `['BIKE', 'TRUCK', 'VAN']`
- `plateNumber`: String
- `licenseImages`: Array `[String]` (Front/Back/Registration)
- `isOnline`: Boolean (Default: false)
- `location`: GeoJSON Point `{ type: "Point", coordinates: [lng, lat] }` (Index: 2dsphere)
- `status`: Enum `['PENDING_APPROVAL', 'APPROVED', 'LOCKED']`

**3. Orders Collection**

- `_id`: ObjectId
- `customerId`: ObjectId (Ref: Users)
- `driverId`: ObjectId (Ref: Users, Nullable)
- `pickup`: Object `{ address: String, lat: Number, lng: Number }`
- `dropoff`: Object `{ address: String, lat: Number, lng: Number }`
- `vehicleType`: String
- `goodsImages`: Array `[String]`
- `status`: Enum `['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED']`
- `totalPrice`: Number
- `distanceKm`: Number
- `paymentMethod`: Enum `['CASH', 'WALLET']`
- `paymentStatus`: Enum `['UNPAID', 'PAID']`
- `createdAt`: Date (Index)

**4. Conversations Collection (Chat)**

- `_id`: ObjectId
- `orderId`: ObjectId (Ref: Orders)
- `participants`: Array `[ObjectId]` (User IDs)
- `lastMessage`: String
- `updatedAt`: Date

**5. Messages Collection**

- `_id`: ObjectId
- `conversationId`: ObjectId (Ref: Conversations)
- `senderId`: ObjectId (Ref: Users)
- `content`: String
- `type`: Enum `['TEXT', 'IMAGE']`
- `createdAt`: Date

**6. Transactions Collection (Wallet/SePay)**

- `_id`: ObjectId
- `userId`: ObjectId (Ref: Users)
- `amount`: Number
- `type`: Enum `['DEPOSIT', 'WITHDRAW', 'PAYMENT', 'REFUND']`
- `status`: Enum `['PENDING', 'SUCCESS', 'FAILED']`
- `sepayReference`: String (Code from Bank Transfer)
- `createdAt`: Date

---

## 3. Mobile App Screens (React Native Expo)

Using `Stack Navigation` + `Bottom Tab Navigation`.

### Common Stacks

**1. OnboardingScreen**

- **Layout:** Full-screen Carousel with bottom controls.
- **Components:**
  - `BackgroundImage`: High-quality illustration relevant to moving/delivery.
  - `TitleText`: Bold, H1 size (e.g., "Fast Delivery").
  - `SubtitleText`: Regular, Grey, center-aligned short description.
  - `PaginationDots`: Active (Primary Color) vs Inactive (Grey) indicators.
  - `PrimaryButton`: "Get Started" (Rounded, Bottom-fixed, Shadow).
  - `TextButton`: "Skip" (Top-right corner, transparent).
- **Function:** Introduce app features.
- **Flow:** Click "Get Started" -> `LoginScreen`.

**2. LoginScreen**

- **Layout:** Vertical stack, center aligned content.
- **Components:**
  - `Logo`: App Icon (Top center, 120x120).
  - `InputLabel`: "Phone Number" text.
  - `PhoneInput`: Input field with Country Code (+84) prefix fixed.
  - `InputLabel`: "Password" text.
  - `PasswordInput`: Input field with "Eye" icon to toggle visibility.
  - `ForgotPasswordLink`: Right-aligned text button "Forgot Password?".
  - `PrimaryButton`: "Login" (Full width, High contrast).
  - `Separator`: "Or continue with" line.
  - `SocialButtons`: Google / Facebook icons (Optional).
  - `RegisterLink`: "Don't have an account? Register".
- **Function:** Validate input, call Login API, store Token.
- **Flow:**
  - Success -> `HomeScreen` (Customer) OR `DriverDashboardScreen` (Driver).
  - Click "Register" -> `RegisterScreen`.
  - Click "Forgot Password" -> `ForgotPasswordStack`.

**3. RegisterScreen**

- **Layout:** ScrollView with Form.
- **Components:**
  - `PageHeader`: "Create Account" title + Back Arrow.
  - `RoleSelector`: Segmented Control or 2 Big Cards ("I'm a Customer" vs "I'm a Driver") with icons.
  - `FormInput`: Full Name, Phone Number, Password, Confirm Password.
  - `Checkbox`: "I agree to Terms & Conditions".
  - `PrimaryButton`: "Register".
- **Function:** Create account.
- **Flow:** Submit -> `OTPVerificationScreen`.
- **Screen Variants:**
  - `RegisterCustomerScreen`: Standard form.
  - `RegisterDriverScreen`: Adds `VehicleSelect` (Dropdown), `PlateInput` (Masked input).
  - `DriverDocumentScreen`:
    - `SectionHeader`: "Upload Documents".
    - `UploadCard`: "Driving License (Front)" -> Dashed border box + "Plus" icon.
    - `UploadCard`: "Driving License (Back)".
    - `UploadCard`: "Vehicle Registration".
    - `PrimaryButton`: "Submit for Review". -> Flow: Submit -> `PendingApprovalScreen`.

**4. ForgotPasswordStack**

- **ForgotPasswordScreen:**
  - `InstructionText`: "Enter your phone number to reset password."
  - `PhoneInput`: Standard input.
  - `PrimaryButton`: "Send OTP". -> Flow: Submit -> `OTPVerificationScreen`.
- **OTPVerificationScreen:**
  - `Title`: "Verification Code".
  - `OTPInput`: 4 or 6 individual boxes for digits (Auto-focus).
  - `TimerText`: "Resend in 30s" (Countdown).
  - `PrimaryButton`: "Verify". -> Flow: Success -> `ResetPasswordScreen`.
- **ResetPasswordScreen:**
  - `PasswordInput`: "New Password".
  - `PasswordInput`: "Confirm Password".
  - `PrimaryButton`: "Reset Password". -> Flow: Success -> `LoginScreen`.

### Customer Flow (Tab Navigator)

**1. HomeScreen (Map View)**

- **Layout:** Map background + Floating UI elements.
- **Components:**
  - `MapView`: Full screen, custom style (minimalist), showing User Marker (Blue dot).
  - `TopBar`:
    - `AvatarButton`: Circle image (Top-Left) -> Opens Sidebar/Profile.
    - `GreetingText`: "Hi, [Name]".
    - `NotificationIcon`: Bell icon (Top-Right) with Red Badge.
  - `PromoBanner`: Horizontal list of image cards (Coupons/Ads) - Floating near top.
  - `VehicleSelectionBar` (Bottom area):
    - `VehicleItem`: Vertical stack (Icon + Name + Starting Price). Selected state has Border/Background color.
  - `WhereToInput`: Floating card (Elevation 5) above Vehicle Bar. "Where do you want to send?" -> OnClick opens `SearchModal`.
- **Function:** Show current location, select destination, choose vehicle, view estimation price.
- **Flow:**
  - Select Destination & Vehicle -> `CreateOrderScreen`.
  - Click Menu -> `ProfileScreen`.

**2. CreateOrderScreen**

- **Layout:** Vertical Form (ScrollView) + Fixed Bottom Footer.
- **Components:**
  - `RouteSection`:
    - `PickupLine`: Search bar with "Green Circle" icon. Pre-filled with Current Loc.
    - `DropoffLine`: Search bar with "Red Pin" icon.
    - `DistanceLabel`: Text "5.2 km".
  - `VehicleInfo`: Card showing selected vehicle (e.g., "Van 500kg") + Dimensions.
  - `GoodsSection`:
    - `SectionTitle`: "Goods Details".
    - `PhotoUploader`: Horizontal Scroll of added images + "Add Camera" button.
    - `CategoryTags`: Chips (Furniture, Boxes, Electronics...).
  - `NoteInput`: TextArea "Note for driver...".
  - `Footer` (Fixed Bottom):
    - `PaymentMethod`: Row (Icon + "Cash" or "Wallet") + Chevron to change.
    - `PriceTotal`: Large Bold Text (e.g., "150.000đ").
    - `BookingButton`: "Find Driver" (Primary, Full Width).
- **Function:** Confirm booking details.
- **Flow:** Click "Find Driver" -> `TrackingScreen` (Status: Finding).

**3. TrackingScreen** (Active Trip)

- **Layout:** Map (Top 2/3) + Bottom Sheet (Bottom 1/3).
- **Components:**
  - `MapView`: Shows Route Polyline (Blue), Driver Marker (Car moving), Pickup/Dropoff Markers.
  - `HeaderOverlay`: Status pill "Driver is coming..." (Top center).
  - `BottomSheet`:
    - `DriverInfo`: Profile Row (Avatar, Name, Rating Star).
    - `VehicleInfo`: Text (Color, Model, Plate Number).
    - `ActionRow`:
      - `CallButton`: Circle Green Button (Phone icon).
      - `ChatButton`: Circle Blue Button (Message icon) with Badge.
      - `CancelButton`: Text Button "Cancel Trip" (Red).
- **Function:** Real-time WebSocket updates of driver location.
- **Flow:**
  - Click "Chat" -> `ChatScreen`.
  - Trip Completed -> `RatingScreen`.

**4. ChatScreen** (In-App Chat)

- **Layout:** Standard Chat UI.
- **Components:**
  - `AppBar`: Back Arrow + Driver Name + Call Action.
  - `MessageList`: ListView.
    - `MyMessage`: Right aligned, Blue bg, White text.
    - `TheirMessage`: Left aligned, Grey bg, Black text.
  - `InputArea`:
    - `AttachmentBtn`: Clip icon.
    - `TextField`: "Type a message...".
    - `SendBtn`: Paper plane icon.
- **Function:** Real-time chat between Customer & Driver.
- **Flow:** Back -> Return to `TrackingScreen`.

**5. RatingScreen** (Post-Trip)

- **Layout:** Centered Modal-like view.
- **Components:**
  - `SuccessIcon`: Checkmark animation.
  - `Title`: "Trip Completed!".
  - `Avatar`: Driver photo (Large).
  - `StarRating`: 5 Star Icons (Clickable).
  - `TagSelection`: Grid of chips ("Polite", "On Time", "Safe Driving").
  - `CommentInput`: "Add a comment..." (Optional).
  - `SubmitButton`: "Submit Review".
- **Function:** Submit review for driver.
- **Flow:** Submit -> `HomeScreen`.

**6. ActivityHistoryScreen**

- **Layout:** List View with Tabs.
- **Components:**
  - `Tabs`: "Ongoing" / "Completed" / "Cancelled".
  - `OrderList`: `FlashList`.
    - `OrderItemCard`:
      - `DateText`: "20 Oct, 10:30 AM".
      - `Route`: "District 1 -> District 7".
      - `StatusBadge`: "Completed" (Green) or "Cancelled" (Red).
      - `Price`: "150.000đ".
- **Function:** Review history.
- **Flow:** Click Item -> `HistoryDetailScreen`.

**7. HistoryDetailScreen** (Invoice)

- **Layout:** ScrollView.
- **Components:**
  - `Code`: "Order #BG12345" (Copy icon).
  - `StatusHeader`: Large Icon + Status Text.
  - `DriverRow`: Avatar + Name.
  - `Timeline`: Vertical dots.
    - Pickup time/address.
    - Dropoff time/address.
  - `BillSection`:
    - Row: "Fee"
    - Row: "Discount"
    - Total: Bold.
  - `ProofImage`: Photo taken by driver at delivery (Thumbnail).
  - `ActionButtons`: "Re-book", "Report Issue".
- **Function:** View full details of a completed order.
- **Flow:** Click "Re-book" -> `CreateOrderScreen` (Pre-filled).

**8. WalletScreen**

- **Layout:** Dashboard style.
- **Components:**
  - `BalanceCard`: Gradient Background, Total Balance (Large), Hidden eye icon.
  - `ActionRow`:
    - `TopUpBtn`: Icon + "Top Up".
    - `WithdrawBtn`: Icon + "Withdraw".
  - `TransactionHeader`: "Recent Transactions" + "View All".
  - `TransactionList`: List of rows (Icon arrow up/down, Date, Amount +/-).
- **Function:** Manage wallet balance.
- **Flow:** Click "Top Up" -> Open Payment Gateway (WebView/DeepLink).

**9. NotificationScreen**

- **Layout:** Simple List.
- **Components:**
  - `NotificationItem`:
    - `Icon`: Bell or Promo icon.
    - `Content`: Title (Bold), Body (Regular), Time (Grey).
    - `UnreadIndicator`: Blue dot.
- **Function:** View notifications.
- **Flow:** Click Notification -> Navigate to relevant screen (e.g., `HistoryDetailScreen`).

**10. ProfileScreen**

- **Layout:** List of Menu Items.
- **Components:**
  - `Header`: User Info (Avatar, Name, Phone, Edit Icon).
  - `WalletPreview`: Mini Balance card.
  - `MenuSection`:
    - `MenuItem`: Icon + "Payment Methods" + Chevron.
    - `MenuItem`: Icon + "Saved Places" + Chevron.
    - `MenuItem`: Icon + "Support Center" + Chevron.
    - `MenuItem`: Icon + "Settings" + Chevron.
  - `LogoutButton`: Text, Red color, centered at bottom.
- **Flow:**
  - Click Wallet -> `WalletScreen`.
  - Click History -> `ActivityHistoryScreen`.
  - Click Logout -> `LoginScreen`.

### Driver Flow (Tab Navigator)

**1. DriverDashboardScreen**

- **Layout:** Map Background + Bottom Control Panel.
- **Components:**
  - `StatusHeader`: Large switch "GO ONLINE" (Green) / "OFFLINE" (Grey).
  - `FloatingStats`: Top-left overlay showing "Today: 500k".
  - `HeatMap`: Map overlay showing high demand areas.
  - `RequestModal` (Popup):
    - `Timer`: Circular countdown (15s).
    - `Price`: Very Large Text.
    - `Distance`: "Pickup: 2km" | "Trip: 10km".
    - `Address`: From -> To (Street names).
    - `Buttons`: "Ignore" (Grey), "Accept" (Green, Large).
- **Function:** Main standby screen.
- **Flow:**
  - New Order Popup -> Click "View" -> `OrderDetailScreen`.
  - Click Stats -> `EarningsScreen`.

**2. OrderDetailScreen** (After Accepting)

- **Layout:** Split View.
- **Components:**
  - `CustomerCard`: Name, Rating, Call/Chat Buttons.
  - `TripTimeline`: Visual line connecting Pickup -> Dropoff with addresses.
  - `GoodsInfo`: Photo thumbnail, Category.
  - `ActionSlider`: "Slide to Pickup" / "Slide to Complete".
  - `NavigationButton`: Arrow icon -> Opens Google Maps App.
- **Function:** Review order before accepting.
- **Flow:**
  - Accept -> `NavigationScreen`.
  - Reject -> `DriverDashboardScreen`.

**3. NavigationScreen** (In-Trip)

- **Layout:** Map Centric (Navigation Mode).
- **Components:**
  - `Map`: 3D view, angled, showing next turn.
  - `TopInstruction`: "Turn left in 200m on Nguyen Van Linh".
  - `BottomControl`:
    - `CustomerMiniCard`.
    - `PrimaryAction`: "Arrived at Pickup".
    - `SecondaryAction`: "Emergency" (SOS).
  - `ProofModal` (Upon Delivery):
    - `CameraView`: Take photo.
    - `ConfirmBtn`: "Confirm Delivery".
- **Function:** Turn-by-turn navigation (simulated or via intent), status updates.
- **Flow:**
  - Click "Chat" -> `ChatScreen`.
  - Click "Delivered" -> `DriverDashboardScreen` (Trip End).

**4. EarningsScreen**

- **Layout:** ScrollView with Charts.
- **Components:**
  - `TimeFilter`: "Today", "This Week", "This Month".
  - `ChartComponent`: Bar chart showing income per day.
  - `StatsGrid`:
    - `Tile`: "Total Trips".
    - `Tile`: "Online Hours".
    - `Tile`: "Acceptance Rate".
  - `TripHistoryList`: Compact list of recent earnings.
- **Function:** View detailed financial stats.

---

## 4. Google Maps Integration Guide

### Backend (NestJS)

Use `@googlemaps/google-maps-services-js` for server-side calculations (Distance Matrix, Geocoding).

**Installation:**

```bash
npm install @googlemaps/google-maps-services-js
```

**Code Snippet (Price Estimation Service):**

```typescript
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

async function calculatePrice(origin, destination) {
  const response = await client.distancematrix({
    params: {
      origins: [origin],
      destinations: [destination],
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const element = response.data.rows[0].elements[0];
  const distanceKm = element.distance.value / 1000;
  const pricePerKm = 10000; // 10k VND
  return Math.max(distanceKm * pricePerKm, 30000); // Min 30k
}
```

### Mobile (React Native Expo)

Use `react-native-maps` for rendering and `expo-location` for GPS.

**Installation:**

```bash
npx expo install react-native-maps expo-location
```

**Code Snippet (Map Screen):**

```tsx
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 10.762,
        longitude: 106.66,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      provider="google"
    >
      {location && (
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        />
      )}
      {/* Draw route using Polyline with decoded points from Directions API */}
    </MapView>
  );
}
```

---

## 5. SePay Payment Integration Guide

Sepay allows auto-confirmation of bank transfers.

**Mechanism:**

1. Client creates Order -> Server generates QR with specific content (e.g., `BGORD123`).
2. User scans QR & pays via Banking App.
3. Bank notifies SePay -> SePay calls Webhook on your Server.
4. Server verifies `content` -> Updates Order Status.

### Backend (NestJS) Webhook

**1. Define Payment Controller:**

```typescript
@Post('webhook')
async handleSePayWebhook(@Body() data: SePayWebhookDto) {
  const orderId = extractOrderId(data.transferContent);

  const order = await this.orderService.findOne(orderId);
  if (order && data.transferAmount >= order.totalPrice) {
    await this.orderService.updateStatus(orderId, 'PAID');
    this.gateway.notifyUser(order.userId, 'PaymentReceived');
  }

  return { success: true };
}
```

**2. Frontend QR Generation:**
Use a library like `react-native-qrcode-svg`.
Pattern for content: `https://qr.sepay.vn/img?acc={ACC_NO}&bank={BANK_CODE}&amount={AMOUNT}&des={CONTENT}`
Or simply display the string content for custom QR generation.

**Setup Steps:**

1. Register at [SePay.vn](https://sepay.vn).
2. Add your Bank Account.
3. Go to "Integration" -> "Webhook".
4. Set Webhook URL: `https://your-api.bengo.com/api/v1/payment/webhook`.
5. Test with a small transfer.

---

## 6. Admin Dashboard Design (React + Vite)

### Tech Stack

- **Framework:** React + Vite + TypeScript
- **UI Library:** Tailwind CSS or Material-UI (MUI)
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table (React Table v8)
- **State Management:** Zustand or Redux Toolkit
- **HTTP Client:** Axios
- **Routing:** React Router v6

---

### 6.1. Sidebar Navigation

**Position:** Fixed left sidebar (Width: 260px, Collapsible to 80px on mobile/toggle)

**Structure:**

```
┌─────────────────────────────┐
│ 🚚 BenGo Admin             │  ← Logo + Title (Clickable -> Dashboard)
├─────────────────────────────┤
│ 📊 Dashboard               │  ← Active state: Blue bg, White text
│ 👥 User Management         │
│ 🚗 Driver Management       │
│   ├─ Pending Approval      │  ← Sub-menu (indented)
│   └─ All Drivers           │
│ 📦 Orders                  │
│   ├─ All Orders            │
│   ├─ Pending               │
│   ├─ Active                │
│   └─ Completed             │
│ 💰 Financial               │
│   ├─ Pricing Config        │
│   └─ Revenue Reports       │
│ 🎁 Promotions              │
│ 🎫 Support Tickets         │
│ ⚙️ Settings                │
└─────────────────────────────┘
```

**Menu Items:**

1. **Dashboard** (Icon: 📊 Chart-Bar)

   - Route: `/dashboard`
   - Description: Overview & key metrics

2. **User Management** (Icon: 👥 Users)

   - Route: `/users`
   - Description: View all users with filters
   - **Page Features:**
     - Filter/Tab: `All` | `Customers` | `Drivers` | `Admin` | `Blocked`
     - Search by name, phone, email
     - Actions: View, Edit, Block/Unblock, Delete

3. **Driver Management** (Icon: 🚗 Car)

   - **Pending Approval** → `/drivers/pending` (Badge with count)
     - Quick approve/reject actions
   - **All Drivers** → `/drivers`
     - **Page Features:**
       - Filter/Tab: `Active` | `Offline` | `Blocked`
       - Real-time online status indicators
       - Search, sort by rating

4. **Orders** (Icon: 📦 Box)

   - **All Orders** → `/orders`
     - Filter/Tab: `All` | `Pending` | `Active` | `Completed` | `Cancelled`
   - **Pending** → `/orders/pending` (Badge, quick access)
   - **Active** → `/orders/active` (Real-time tracking)
   - **Completed** → `/orders/completed`

5. **Financial** (Icon: 💰 Dollar-Sign)

   - **Pricing Config** → `/pricing` (CRUD for vehicle pricing)
   - **Revenue Reports** → `/reports` (Charts & export)

6. **Promotions** (Icon: 🎁 Gift)

   - Route: `/promotions`
   - Description: Create/Edit discount codes
   - Filter: Active promotions vs Expired

7. **Support Tickets** (Icon: 🎫 Ticket)

   - Route: `/tickets`
   - **Page Features:**
     - Filter/Tab: `Open` | `In Progress` | `Resolved` | `Closed`
     - Filter by Priority: High, Medium, Low
     - Search by ticket ID or customer name

8. **Settings** (Icon: ⚙️ Gear)
   - **Profile** → `/settings/profile`
   - **System Config** → `/settings/system`

**Sidebar Footer:**

- `Admin Avatar` + Name (Small)
- `Logout Button` (Red text, Icon: Exit)

---

### 6.2. Header (Top Bar)

**Position:** Fixed top bar (Height: 64px, Shadow)

**Layout (Left to Right):**

```
┌──────────────────────────────────────────────────────────────┐
│ [☰ Menu Toggle]  BenGo Admin  [🔍 Search] [🔔 Notifications] [👤 Profile] │
└──────────────────────────────────────────────────────────────┘
```

**Components:**

1. **Menu Toggle Button** (Left-most, Icon: Hamburger ☰)

   - Function: Collapse/Expand Sidebar (Mobile/Desktop)
   - Style: Ghost button, hover effect

2. **Page Title/Breadcrumb** (Left, after toggle)

   - Dynamic text showing current page (e.g., "Dashboard", "User Management > All Users")
   - Style: Font bold, 18px

3. **Global Search Bar** (Center)

   - Input: "Search users, orders, tickets..." (Width: 400px)
   - Icon: 🔍 Magnifying glass (Inside input, left)
   - Function: Opens modal with quick search results (Users, Orders, Drivers)
   - Shortcut: Press `/` to focus

4. **Notifications Button** (Right side, Icon: 🔔 Bell)

   - Red Badge: Count of unread notifications
   - Dropdown: Recent notifications (max 5)
     - "Driver #123 needs approval"
     - "New order #4567"
     - "Support ticket #89 escalated"
   - Link: "View All Notifications" at bottom

5. **Profile Dropdown** (Right-most, Avatar + Name)
   - Avatar: Circle image (40x40)
   - Name: "Admin Nguyen" (Small text below avatar on desktop)
   - Dropdown Menu:
     - `View Profile` (Icon: User)
     - `Settings` (Icon: Gear)
     - Divider
     - `Logout` (Icon: Exit, Red text)

---

### 6.3. Dashboard Home Page (Statistics Overview)

**Route:** `/dashboard`

**Layout:** Grid-based responsive layout (Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`)

---

#### Section 1: **Key Metrics Cards** (Top Row)

**Grid:** 4 columns on desktop, stack on mobile

**Card Components:**

1. **Total Users Card**

   - **Icon:** 👥 (Blue circle background)
   - **Number:** Large text (e.g., "2,547")
   - **Label:** "Total Users"
   - **Sub-text:** "+12% from last month" (Green, up arrow ↑)
   - **Route:** Click → `/users`

2. **Active Orders Card**

   - **Icon:** 📦 (Orange background)
   - **Number:** "132"
   - **Label:** "Active Orders"
   - **Sub-text:** "15 pending assignment" (Yellow dot)
   - **Route:** Click → `/orders/active`

3. **Active Drivers Card**

   - **Icon:** 🚗 (Green background)
   - **Number:** "89"
   - **Label:** "Drivers Online"
   - **Sub-text:** "Out of 245 total" (Grey text)
   - **Route:** Click → `/drivers/active`

4. **Revenue Today Card**
   - **Icon:** 💰 (Purple background)
   - **Number:** "18,540,000đ"
   - **Label:** "Revenue Today"
   - **Sub-text:** "Target: 20M" (Progress bar 90%)
   - **Route:** Click → `/reports`

---

#### Section 2: **Charts Row** (Middle)

**Grid:** 2 columns (8 cols + 4 cols on desktop)

1. **Revenue Chart (Left, wider - 8 cols)**

   - **Title:** "Revenue Overview" + Dropdown filter (Today | This Week | This Month | Custom)
   - **Chart Type:** Line Chart or Area Chart
   - **X-Axis:** Date/Time
   - **Y-Axis:** Revenue (VND)
   - **Lines:**
     - Total Revenue (Blue line)
     - Cash Payments (Green dashed)
     - Wallet Payments (Orange dashed)
   - **Library:** Recharts `<LineChart>` or `<AreaChart>`

2. **Order Status Distribution (Right, 4 cols)**
   - **Title:** "Orders by Status"
   - **Chart Type:** Donut/Pie Chart
   - **Segments:**
     - Pending (Yellow, 15%)
     - Active (Blue, 25%)
     - Completed (Green, 55%)
     - Cancelled (Red, 5%)
   - **Center:** Total count "1,245"
   - **Library:** Recharts `<PieChart>`

---

#### Section 3: **Tables Row** (Bottom)

**Grid:** 2 columns (6 cols + 6 cols)

1. **Recent Orders Table (Left)**

   - **Title:** "Recent Orders" + "View All" link
   - **Columns:**
     - Order ID (Link, blue)
     - Customer Name
     - Driver Name
     - Status (Badge: color-coded)
     - Price (VND format)
     - Time (Relative: "5 min ago")
   - **Rows:** Last 5 orders
   - **Actions:** Click row → `/orders/:id` (Order detail modal/page)
   - **Empty State:** "No recent orders" with icon

2. **Pending Driver Approvals (Right)**
   - **Title:** "Driver Approvals Needed" + Badge count
   - **Columns:**
     - Driver Name + Avatar
     - Vehicle Type (Icon + Text)
     - Applied Date
     - Actions: [✅ Approve] [❌ Reject] buttons
   - **Rows:** Top 5 pending
   - **Empty State:** "All drivers approved! 🎉"

---

#### Section 4: **Support Tickets Widget** (Bottom, Full Width)

**Grid:** Full width (12 cols)

- **Title:** "Open Support Tickets" + Badge count
- **Layout:** Horizontal scrollable cards (Mobile) or Table (Desktop)
- **Card/Row Content:**
  - Ticket ID (Link)
  - Customer Name + Avatar
  - Subject (First 50 chars...)
  - Priority Badge (High: Red, Medium: Orange, Low: Grey)
  - Status (Open, In Progress)
  - Assigned To (Dispatcher name or "Unassigned")
  - Action Buttons: [Assign] [View Details]
- **Rows:** Max 5
- **"View All" Button:** → `/tickets`

---

### 6.4. Design Principles

**Colors:**

- **Primary:** Blue (#3B82F6) - For action buttons, active states
- **Success:** Green (#10B981) - Completed, Approved
- **Warning:** Yellow/Orange (#F59E0B) - Pending, Warnings
- **Danger:** Red (#EF4444) - Cancelled, Rejected, Delete
- **Grey Scale:** Neutral backgrounds, borders, text

**Typography:**

- **Headings:** Inter or Roboto, Bold
- **Body:** Inter or Roboto, Regular
- **Numbers:** Tabular Nums for alignment

**Spacing:**

- Use consistent Tailwind spacing scale (4px base: p-4, gap-6, etc.)

**Shadows:**

- Cards: `shadow-sm` (subtle)
- Dropdowns: `shadow-lg` (prominent)

**Animations:**

- Hover states: Smooth transition (200ms)
- Loading states: Skeleton loaders or spinners
- Page transitions: Fade in (300ms)

**Responsive:**

- Mobile: Stack all cards, collapsible sidebar (drawer)
- Tablet: 2-column grid
- Desktop: Full 4-column grid with sidebar

---

### 6.5. Additional Pages (Quick Reference)

1. **User Management Page** (`/users`)

   - Data Table with filters (Role, Status, Search)
   - Actions: View, Block, Delete
   - Modal: User Details (Edit form)

2. **Driver Approval Page** (`/drivers/pending`)

   - Card-based layout showing driver info + documents
   - Image viewer for license photos
   - Approve/Reject actions with reason input

3. **Order Details Modal/Page** (`/orders/:id`)

   - Map showing route
   - Timeline of order status updates
   - Customer & Driver info cards
   - Action: Force Cancel (Admin override)

4. **Pricing Config Page** (`/pricing`)

   - Form with inputs for each vehicle type (BIKE, VAN, TRUCK)
   - Base Price, Per KM, Peak Hour Multiplier
   - Save button → API call

5. **Promotions Page** (`/promotions`)

   - Table with filters (Active, Expired)
   - Create/Edit modal with form:
     - Code, Title, Description
     - Discount Type (Percentage/Fixed)
     - Start/End dates
     - Usage limit

6. **Support Tickets Page** (`/tickets`)
   - Kanban board view or Table
   - Filters: Status, Priority
   - Assign to dispatcher dropdown
   - Update status (Open → In Progress → Resolved)

---
