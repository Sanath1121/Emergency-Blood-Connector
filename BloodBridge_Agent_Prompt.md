# BloodBridge — Full Agent Prompt
## Emergency Blood Connector Platform (MERN Stack)

---

## ROLE & OBJECTIVE

You are a senior MERN stack developer. Your task is to build **BloodBridge** — a full-stack Emergency Blood Connector web application — from scratch, end to end, with zero ambiguity. Follow every instruction in this prompt exactly. Do not make assumptions. Do not skip any feature. Do not simplify any section unless explicitly stated.

---

## PROJECT OVERVIEW

**BloodBridge** is a real-time emergency blood connector platform that bridges the gap between blood donors, patients in need, hospitals, and volunteers. It solves the critical problem of delayed blood availability during emergencies through instant donor matching, real-time in-app notifications, and a unique **Donor Reliability Score (DRS)** — a trust and accountability system that no existing blood platform currently offers.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router v6, Axios, Tailwind CSS |
| State Management | React Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose (localhost for development) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io (server + client) |
| Maps | Leaflet.js + React-Leaflet |
| Email | SKIPPED — in-app notifications only |
| Multilingual | i18next + react-i18next (English, Hindi, Telugu toggle) |
| Icons | React Icons (ri or lu set) |

---

## FOLDER STRUCTURE

Create the project with this exact folder structure:

```
bloodbridge/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Sidebar, NotificationBell, LanguageToggle, DRSBadge
│   │   │   ├── donor/
│   │   │   ├── requester/
│   │   │   ├── hospital/
│   │   │   ├── volunteer/
│   │   │   └── admin/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── i18n/
│   │   │   ├── index.js
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── hi.json
│   │   │       └── te.json
│   │   ├── pages/
│   │   │   ├── auth/              # Login.jsx, Register.jsx
│   │   │   ├── donor/             # DonorDashboard.jsx, DonorProfile.jsx
│   │   │   ├── requester/         # RequesterDashboard.jsx, PostRequest.jsx
│   │   │   ├── hospital/          # HospitalDashboard.jsx
│   │   │   ├── volunteer/         # VolunteerDashboard.jsx
│   │   │   ├── admin/             # AdminDashboard.jsx, ManageUsers.jsx
│   │   │   ├── BloodBankDirectory.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── Home.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with base URL + token interceptor
│   │   ├── utils/
│   │   │   └── bloodCompatibility.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                        # Express backend
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── donorController.js
│   │   ├── requestController.js
│   │   ├── bloodBankController.js
│   │   ├── volunteerController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verify
│   │   └── roleMiddleware.js      # Role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── BloodRequest.js
│   │   ├── BloodBank.js
│   │   ├── Notification.js
│   │   └── DonationRecord.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── donorRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── bloodBankRoutes.js
│   │   ├── volunteerRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── socket/
│   │   └── socketHandler.js       # Socket.io events
│   ├── utils/
│   │   ├── drsCalculator.js       # DRS score logic
│   │   └── bloodCompatibility.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ENVIRONMENT VARIABLES

### server/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloodbridge
JWT_SECRET=bloodbridge_jwt_secret_key_2024
CLIENT_URL=http://localhost:5173
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## DATABASE MODELS

### 1. User.js
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['donor', 'requester', 'hospital', 'volunteer', 'admin'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() { return this.role === 'donor'; }
  },
  city: { type: String, required: true },
  phone: { type: String },
  isVerified: { type: Boolean, default: false },     // Admin verifies donors
  isActive: { type: Boolean, default: true },
  availability: {
    type: String,
    enum: ['available', 'unavailable', 'on_cooldown'],
    default: 'available'
  },
  cooldownUntil: { type: Date, default: null },
  drsScore: { type: Number, default: 50, min: 0, max: 100 },  // DRS starts at 50
  totalDonations: { type: Number, default: 0 },
  lastDonationDate: { type: Date, default: null },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. BloodRequest.js
```javascript
{
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsRequired: { type: Number, required: true },
  hospitalName: { type: String, required: true },
  city: { type: String, required: true },
  urgency: {
    type: String,
    enum: ['critical', 'moderate', 'planned'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'fulfilled', 'cancelled'],
    default: 'open'
  },
  matchedDonor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  respondedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  fulfilledAt: { type: Date, default: null }
}
```

### 3. DonationRecord.js
```javascript
{
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donatedAt: { type: Date, default: Date.now },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who confirmed it
  drsChange: { type: Number },   // How much DRS changed for this event
  outcome: {
    type: String,
    enum: ['donated', 'cancelled_by_donor', 'no_show'],
    required: true
  }
}
```

### 4. BloodBank.js
```javascript
{
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  availability: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 }
  },
  latitude: { type: Number },
  longitude: { type: Number },
  createdAt: { type: Date, default: Date.now }
}
```

### 5. Notification.js
```javascript
{
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['blood_request', 'sos_alert', 'request_accepted', 'donation_confirmed', 'drs_update', 'cooldown_lifted', 'general'],
    required: true
  },
  isRead: { type: Boolean, default: false },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', default: null },
  createdAt: { type: Date, default: Date.now }
}
```

---

## BLOOD COMPATIBILITY LOGIC

Implement this in both `server/utils/bloodCompatibility.js` and `client/src/utils/bloodCompatibility.js`:

```javascript
const compatibility = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-']
};

// Returns true if donorType can donate to recipientType
function isCompatible(donorBloodType, recipientBloodType) {
  return compatibility[recipientBloodType]?.includes(donorBloodType) || false;
}

module.exports = { isCompatible, compatibility };
```

---

## DONOR RELIABILITY SCORE (DRS) — CORE USP

Implement in `server/utils/drsCalculator.js`. This is the platform's unique feature. Every donor gets a live DRS score (0–100). Starting score is 50.

### Score Rules:
```javascript
const DRS_RULES = {
  DONATED_AFTER_ACCEPTING:     +10,   // Donation confirmed after accepting request
  RESPONDED_WITHIN_30_MIN:     +5,    // Donor responded to alert within 30 minutes
  COOLDOWN_RESPECTED:          +3,    // Donor waited full 90 days before donating again
  PROFILE_COMPLETE:            +2,    // One-time bonus when profile is fully filled
  CANCELLED_AFTER_ACCEPTING:   -8,    // Donor accepted then cancelled
  IGNORED_3_CONSECUTIVE:       -5,    // Donor ignored 3+ alerts in a row
  NO_SHOW_AFTER_CONFIRM:       -10    // Donor confirmed but didn't show up
};

// Badge mapping
function getDRSBadge(score) {
  if (score >= 90) return { label: 'Trusted Lifesaver', tier: 'gold', emoji: '🥇' };
  if (score >= 70) return { label: 'Reliable Donor', tier: 'silver', emoji: '🥈' };
  if (score >= 50) return { label: 'Active Donor', tier: 'bronze', emoji: '🥉' };
  return { label: 'Needs Improvement', tier: 'warning', emoji: '⚠️' };
}

// Score never goes below 0 or above 100
function updateDRS(currentScore, change) {
  return Math.max(0, Math.min(100, currentScore + change));
}
```

### When DRS Updates:
- When a donation is marked as **fulfilled** → apply `DONATED_AFTER_ACCEPTING`
- When a donor **cancels** after accepting → apply `CANCELLED_AFTER_ACCEPTING`
- When a donor is marked **no-show** by requester/admin → apply `NO_SHOW_AFTER_CONFIRM`
- When donor **responds within 30 minutes** of notification → apply `RESPONDED_WITHIN_30_MIN`
- When donor **profile is 100% complete** for the first time → apply `PROFILE_COMPLETE` (one-time only)
- DRS change is always logged in `DonationRecord`

---

## API ROUTES

### Auth Routes — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with role, name, email, password, bloodType (if donor), city |
| POST | `/login` | Public | Login, returns JWT token + user object |
| GET | `/me` | Private | Get current logged-in user profile |

### Donor Routes — `/api/donors`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get all available donors (filtered by city, blood type) |
| GET | `/:id` | Private | Get specific donor profile with DRS |
| PUT | `/profile` | Donor | Update own profile |
| PUT | `/availability` | Donor | Toggle availability status |
| GET | `/my/requests` | Donor | Get all requests donor has responded to |
| GET | `/my/history` | Donor | Full donation history |

### Blood Request Routes — `/api/requests`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Requester, Hospital | Post new blood request |
| GET | `/` | Private | Get all open requests (filterable by city, blood type, urgency) |
| GET | `/:id` | Private | Get single request with matched donors |
| PUT | `/:id/respond` | Donor | Donor responds/accepts a request |
| PUT | `/:id/confirm/:donorId` | Requester, Hospital | Requester confirms a donor |
| PUT | `/:id/fulfill` | Requester, Hospital, Admin | Mark request as fulfilled (triggers DRS update + cooldown) |
| PUT | `/:id/cancel` | Requester, Hospital, Admin | Cancel a request |
| PUT | `/:id/noshow/:donorId` | Requester, Hospital, Admin | Mark donor as no-show (triggers DRS penalty) |
| POST | `/:id/sos` | Admin, Hospital | Broadcast SOS to all eligible donors in the city |

### Blood Bank Routes — `/api/bloodbanks`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all blood banks (filterable by city) |
| GET | `/:id` | Public | Get single blood bank |
| POST | `/` | Admin | Add new blood bank |
| PUT | `/:id` | Admin | Update blood bank info + inventory |
| DELETE | `/:id` | Admin | Delete blood bank |

### Notification Routes — `/api/notifications`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get all notifications for current user |
| PUT | `/:id/read` | Private | Mark single notification as read |
| PUT | `/read-all` | Private | Mark all notifications as read |
| DELETE | `/:id` | Private | Delete a notification |

### Volunteer Routes — `/api/volunteers`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get all volunteers (filterable by city) |
| PUT | `/profile` | Volunteer | Update volunteer profile |
| PUT | `/:id/assign/:requestId` | Volunteer | Volunteer marks themselves as helping on a request |

### Admin Routes — `/api/admin`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | Get all users with filters |
| PUT | `/users/:id/verify` | Admin | Verify a donor account |
| PUT | `/users/:id/suspend` | Admin | Suspend / reactivate a user |
| GET | `/stats` | Admin | Platform statistics (total donations, active requests, top donors) |
| GET | `/requests` | Admin | All requests across the platform |

---

## SOCKET.IO EVENTS

Implement in `server/socket/socketHandler.js`.

### Server Emits:
| Event | Payload | When |
|---|---|---|
| `new_blood_request` | `{ request, compatibleBloodTypes, city }` | New request posted → emit to donors in same city with compatible blood type |
| `sos_alert` | `{ request, city, message }` | SOS triggered → emit to ALL eligible donors in city |
| `request_accepted` | `{ donorId, donorName, requestId }` | Donor accepts → emit to requester |
| `donor_confirmed` | `{ requestId, message }` | Requester confirms donor → emit to donor |
| `donation_confirmed` | `{ donorId, newDRS, badge }` | Donation fulfilled → emit to donor with updated DRS |
| `notification` | `{ title, message, type }` | Generic in-app notification to a specific user |

### Client Listens:
- All of the above events
- On `new_blood_request` and `sos_alert` → show a toast notification + add to notification bell count
- On `donation_confirmed` → update donor's DRS badge in real time in the UI

### Room Strategy:
- Each user joins a room by their `userId` on socket connect
- Each user also joins a room by their `city` (for broadcast alerts)

---

## FRONTEND PAGES & COMPONENTS

### Public Pages (no login required):
- **Home.jsx** — Landing page with platform intro, stats (total donors, donations saved), CTA to register/login
- **Login.jsx** — Email + password login form
- **Register.jsx** — Role selection first, then role-specific fields

### Donor Pages:
- **DonorDashboard.jsx** — DRS score card, badge, cooldown timer, recent notifications, quick stats (total donations, response rate)
- **DonorProfile.jsx** — Edit profile, toggle availability, view donation history
- **OpenRequests.jsx** — List of matching open requests in donor's city with Accept button

### Requester Pages:
- **RequesterDashboard.jsx** — My active requests, status tracking, matched donor info
- **PostRequest.jsx** — Form to post new blood request
- **MatchedDonors.jsx** — After posting, shows ranked list of compatible donors with DRS score visible, confirm button

### Hospital Pages:
- **HospitalDashboard.jsx** — Post requests, manage active requests, SOS trigger button, blood bank inventory view

### Volunteer Pages:
- **VolunteerDashboard.jsx** — Browse open requests in city, mark as helping, contact info

### Admin Pages:
- **AdminDashboard.jsx** — Platform stats cards (total users, active requests, fulfilled donations, top city by activity)
- **ManageUsers.jsx** — Table of all users with verify/suspend buttons, filter by role
- **ManageRequests.jsx** — All requests with status management
- **ManageBloodBanks.jsx** — CRUD for blood bank directory

### Shared Pages:
- **BloodBankDirectory.jsx** — Searchable list + filter by city, shows inventory per blood type
- **MapView.jsx** — Leaflet map with anonymous donor pins and blood bank pins, filter by blood type

---

## UI DESIGN SYSTEM

### Theme: Clean & Minimal + Modern Dashboard
- White background with red accent for public pages
- Sidebar navigation for all dashboard pages
- Card-based layout for all data sections

### Color Palette (Tailwind CSS variables):
```javascript
// tailwind.config.js
colors: {
  primary: '#C0392B',       // Deep blood red — buttons, accents
  primaryLight: '#E74C3C',  // Lighter red — hover states
  secondary: '#2C3E50',     // Dark navy — sidebar, headings
  surface: '#FFFFFF',       // Card backgrounds
  background: '#F8F9FA',    // Page background
  muted: '#6C757D',         // Secondary text
  success: '#27AE60',       // Available status, success states
  warning: '#F39C12',       // Moderate urgency, DRS warning
  danger: '#C0392B',        // Critical urgency
  border: '#E9ECEF'         // Dividers
}
```

### DRS Badge Component (`DRSBadge.jsx`):
```
Gold  (90–100): Gold background, crown icon, "Trusted Lifesaver"
Silver (70–89): Silver background, "Reliable Donor"
Bronze (50–69): Bronze background, "Active Donor"
Warning (<50):  Red-orange, warning icon, "Needs Improvement"
```

### Layout Rules:
- All dashboard pages use a persistent left **Sidebar** with role-specific nav links
- Top **Navbar** has: platform logo (BloodBridge 🩸), notification bell with unread count, language toggle (EN / हिं / తె), user avatar + role chip, logout button
- All forms use Tailwind utility classes — no external form libraries
- All tables are responsive with horizontal scroll on mobile

---

## MULTILINGUAL (i18n)

Use `i18next` and `react-i18next`. Create translation files for:
- `client/src/i18n/locales/en.json` — English (default)
- `client/src/i18n/locales/hi.json` — Hindi
- `client/src/i18n/locales/te.json` — Telugu

### Keys to translate (minimum):
```json
{
  "nav": { "home": "", "dashboard": "", "requests": "", "bloodBanks": "", "map": "", "logout": "" },
  "auth": { "login": "", "register": "", "email": "", "password": "", "role": "" },
  "request": { "post": "", "urgency": "", "critical": "", "moderate": "", "planned": "", "bloodType": "", "hospital": "", "city": "" },
  "donor": { "available": "", "unavailable": "", "onCooldown": "", "drsScore": "", "donate": "", "accept": "" },
  "drs": { "trustedLifesaver": "", "reliableDonor": "", "activeDonor": "", "needsImprovement": "" },
  "common": { "save": "", "cancel": "", "confirm": "", "search": "", "filter": "", "loading": "" }
}
```

Language toggle is a 3-button toggle in the Navbar. Selected language stored in localStorage.

---

## COOLDOWN SYSTEM

- When a donation is marked fulfilled → set `user.availability = 'on_cooldown'` and `user.cooldownUntil = Date.now() + 90 days`
- A cron-like check: on every donor login OR via a scheduled check (use `node-cron` — run every hour) → if `cooldownUntil` has passed, auto-set `availability = 'available'` and send a notification: "Your cooldown period has ended. You are now available to donate again!"
- Donor dashboard shows a countdown: "X days remaining until you can donate again"
- Donor CANNOT accept any request while on cooldown — backend must enforce this

---

## DONOR MATCHING ALGORITHM

When a requester posts a request or views matched donors:
1. Filter donors by: compatible blood type (use bloodCompatibility logic), same city, `availability = 'available'`, `isVerified = true`, `isActive = true`
2. Sort results by `drsScore` descending (highest DRS shown first)
3. Return top 10 donors with: name, bloodType, city, drsScore, badge, totalDonations, phone (only after requester confirms)

---

## ACHIEVEMENT MILESTONES

Track `totalDonations` on User model. Award badges on these milestones:
- 1st donation → "First Drop 🩸"
- 5 donations → "Life Guardian 💪"
- 10 donations → "Hero of the City 🏆"
- 25 donations → "Legend 🌟"

Store milestone badges as an array on the User model: `badges: [{ label: String, awardedAt: Date }]`

Trigger a notification when a milestone is reached.

---

## LEADERBOARD

- Opt-in leaderboard per city
- Shows top 10 donors by `totalDonations` in the donor's city
- Donors can toggle `showOnLeaderboard: Boolean` in their profile settings
- Accessible from Donor Dashboard

---

## ERROR HANDLING

- All Express routes must use try/catch and return consistent error format:
```json
{ "success": false, "message": "Error description here" }
```
- All successful responses:
```json
{ "success": true, "data": { ... } }
```
- Frontend Axios instance must have a response interceptor that:
  - On 401 → clears token from localStorage and redirects to `/login`
  - On any error → shows a toast error notification

---

## AUTHENTICATION FLOW

- On register → hash password with bcrypt (salt rounds: 10) → save user → return JWT
- On login → compare password → return JWT + user object (without password)
- JWT payload: `{ id: user._id, role: user.role, name: user.name }`
- JWT expiry: `7d`
- Frontend stores JWT in `localStorage` as `bloodbridge_token`
- `AuthContext` provides: `user`, `token`, `login()`, `logout()`, `isAuthenticated`
- `ProtectedRoute.jsx` checks role and redirects unauthorized users

---

## SEEDER / SAMPLE DATA

Create `server/seed.js` that inserts:
- 1 Admin user (email: admin@bloodbridge.com, password: Admin@123)
- 5 Donor users across 3 cities with different blood types and DRS scores
- 3 Requester users
- 2 Blood bank entries
- 3 Sample open blood requests

Run with: `node server/seed.js`

---

## PACKAGE.JSON SCRIPTS

### server/package.json:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

### client/package.json:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## DEPENDENCIES TO INSTALL

### Server:
```
express mongoose dotenv bcryptjs jsonwebtoken cors socket.io node-cron
```
Dev: `nodemon`

### Client:
```
axios react-router-dom react-leaflet leaflet i18next react-i18next react-icons
```

---

## FINAL CHECKLIST FOR THE AGENT

Before considering the project complete, verify every item:

- [ ] All 5 user roles work with correct protected routes
- [ ] JWT auth works on all private routes
- [ ] Blood compatibility logic is correct and used in donor matching
- [ ] DRS score updates correctly on all 6 trigger events
- [ ] DRS badge renders correctly on donor cards and dashboard
- [ ] Socket.io emits and receives all listed events
- [ ] Cooldown system activates after donation and lifts after 90 days
- [ ] In-app notification bell shows unread count and marks as read
- [ ] Leaflet map renders donor pins and blood bank pins
- [ ] Language toggle switches between EN, Hindi, Telugu for all translated keys
- [ ] Admin can verify donors, suspend users, view platform stats
- [ ] SOS alert broadcasts to all eligible donors in a city via socket
- [ ] Seeder file works and populates sample data
- [ ] All API responses follow the consistent `{ success, data/message }` format
- [ ] Axios interceptor handles 401 and redirects to login
- [ ] Sidebar nav is role-specific and highlights the active route
- [ ] Tailwind color theme matches the defined palette
- [ ] No hardcoded API URLs — all use environment variables

---

## IMPORTANT NOTES FOR THE AGENT

1. Never mix frontend and backend code in the same file
2. Never store passwords in plain text — always bcrypt
3. Never expose password field in any API response — use `.select('-password')` in all user queries
4. Phone number of donor is only revealed to requester AFTER they have confirmed that donor — not before
5. DRS score of a donor is always visible to requesters during matching — this is intentional
6. The SOS feature is only available to Admin and Hospital roles — not to requesters
7. All monetary references, ads, or premium features are strictly absent — this is a free humanitarian platform
8. Mobile responsiveness is required on all pages — use Tailwind responsive prefixes (sm:, md:, lg:)
9. The Leaflet map must show donor locations as anonymous pins (no name or personal info on the pin — only blood type and city)
10. Use `node-cron` to schedule a job that runs every hour and lifts expired cooldowns automatically

---

*This prompt is complete. Build BloodBridge exactly as specified above. Every model, route, component, and feature described here must be implemented. Do not skip, simplify, or substitute any part without explicit instruction.*
