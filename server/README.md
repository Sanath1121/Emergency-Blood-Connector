# BloodBridge — Backend (Server)

Node.js + Express.js REST API with Socket.io real-time layer and MongoDB database.

---

## Quick Start

```bash
cd server
npm install
npm run dev        # development (nodemon)
npm start          # production
node seed.js       # populate sample data
```

---

## Folder Structure

```
server/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, login, Google OAuth, /me
│   ├── donorController.js     # Donor profile, availability, history, leaderboard
│   ├── requestController.js   # Full blood request lifecycle + SOS + coordinate
│   ├── bloodBankController.js # Blood bank CRUD
│   ├── notificationController.js  # Read, mark, delete notifications
│   └── adminController.js     # User management, platform stats
├── middleware/
│   ├── authMiddleware.js      # JWT verification (protect)
│   └── roleMiddleware.js      # Role-based access (authorize)
├── models/
│   ├── User.js
│   ├── BloodRequest.js
│   ├── BloodBank.js
│   ├── Notification.js
│   └── DonationRecord.js
├── routes/
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   ├── requestRoutes.js
│   ├── bloodBankRoutes.js
│   ├── notificationRoutes.js
│   └── adminRoutes.js
├── socket/
│   └── socketHandler.js       # Socket.io event definitions
├── utils/
│   ├── drsCalculator.js       # DRS score logic and badge mapping
│   └── bloodCompatibility.js  # Compatible donor-recipient blood type logic
├── seed.js                    # Sample data seeder
├── server.js                  # App entry point, cron jobs
└── package.json
```

---

## Database Models (Schemas)

### User
```
name          String    required
email         String    required, unique
password      String    required (bcrypt hashed)
role          String    enum: ['donor', 'requester', 'hospital', 'admin']
bloodType     String    enum: A+/A-/B+/B-/AB+/AB-/O+/O-  (required if donor)
city          String    required
phone         String
isVerified    Boolean   default: false  (admin must verify donors)
isActive      Boolean   default: true
availability  String    enum: ['available', 'unavailable', 'on_cooldown']
cooldownUntil Date      null until post-donation cooldown starts
drsScore      Number    0–100, default: 50
totalDonations Number   default: 0
lastDonationDate Date
profileComplete Boolean default: false
badges        Array     [{ label: String, awardedAt: Date }]
showOnLeaderboard Boolean default: false
consecutiveIgnoredCount Number default: 0
isGoogleUser  Boolean   default: false
hasPasswordSet Boolean  default: true
avatar        String    (Google profile pic URL)
createdAt     Date
```

### BloodRequest
```
postedBy          ObjectId → User    required
patientName       String             required
bloodType         String             enum: A+/A-/B+/B-/AB+/AB-/O+/O-
unitsRequired     Number             required
hospitalName      String             required
city              String             required
urgency           String             enum: ['critical', 'moderate', 'planned']
status            String             enum: ['open', 'matched', 'fulfilled', 'cancelled']
matchedDonor      ObjectId → User    null until requester confirms
respondedDonors   [ObjectId → User]  all donors who clicked Accept
coordinator       ObjectId → User    null until a donor clicks Help Coordinate
coordinationNudgeSent Boolean        default: false (prevents duplicate cron nudges)
fulfilledAt       Date               null until fulfilled
createdAt         Date
```

### BloodBank
```
name          String    required
city          String    required
address       String
phone         String
availability  Object    { 'A+': Number, 'A-': Number, ... all 8 types }
latitude      Number
longitude     Number
createdAt     Date
```

### Notification
```
recipient       ObjectId → User    required
title           String             required
message         String             required
type            String             enum: ['blood_request', 'sos_alert', 'request_accepted',
                                         'donation_confirmed', 'drs_update',
                                         'cooldown_lifted', 'general']
isRead          Boolean            default: false
relatedRequest  ObjectId → BloodRequest
createdAt       Date
```

### DonationRecord
```
donor       ObjectId → User           required
request     ObjectId → BloodRequest   required
donatedAt   Date
markedBy    ObjectId → User           (who fulfilled/no-showed)
drsChange   Number                    (positive or negative change applied)
outcome     String    enum: ['donated', 'cancelled_by_donor', 'no_show']
```

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with role, email, password |
| POST | `/login` | Public | Login, returns JWT + user |
| POST | `/google` | Public | Google OAuth login / register |
| GET | `/me` | Private | Get current logged-in user |
| PUT | `/me/password` | Private | Set or change password |

### Donors — `/api/donors`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | All available donors (filter: city, bloodType) |
| GET | `/leaderboard` | Private | Top 10 donors by donations in city |
| GET | `/:id` | Private | Single donor profile with DRS |
| PUT | `/profile` | Donor | Update own profile |
| PUT | `/availability` | Donor | Toggle availability status |
| GET | `/my/requests` | Donor | Requests donor has responded to |
| GET | `/my/history` | Donor | Full donation history |

### Blood Requests — `/api/requests`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Requester, Hospital | Post new blood request |
| GET | `/` | Private | All open requests (filter: city, bloodType, urgency) |
| GET | `/:id` | Private | Single request + matched donor list (top 10 by DRS) |
| PUT | `/:id/respond` | Donor | Accept a request |
| PUT | `/:id/confirm/:donorId` | Requester, Hospital | Confirm a donor (reveals phone) |
| PUT | `/:id/fulfill` | Requester, Hospital, Admin | Mark fulfilled → triggers DRS + cooldown |
| PUT | `/:id/cancel` | Any party involved | Cancel request |
| PUT | `/:id/noshow/:donorId` | Requester, Hospital, Admin | Mark donor as no-show → DRS penalty |
| POST | `/:id/sos` | Admin, Hospital | Broadcast SOS to all eligible city donors |
| PUT | `/:id/coordinate` | Donor | Self-assign as request coordinator |

### Blood Banks — `/api/bloodbanks`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | All blood banks (filter: city) |
| GET | `/:id` | Public | Single blood bank |
| POST | `/` | Admin | Add blood bank |
| PUT | `/:id` | Admin | Update blood bank + inventory |
| DELETE | `/:id` | Admin | Delete blood bank |

### Notifications — `/api/notifications`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | All notifications for current user |
| PUT | `/:id/read` | Private | Mark single notification as read |
| PUT | `/read-all` | Private | Mark all as read |
| DELETE | `/:id` | Private | Delete a notification |

### Admin — `/api/admin`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | All users (filter: role, city, search) |
| PUT | `/users/:id/verify` | Admin | Verify a donor account |
| PUT | `/users/:id/suspend` | Admin | Toggle suspend/activate user |
| GET | `/stats` | Admin | Platform stats |
| GET | `/requests` | Admin | All requests across platform |

---

## Middleware

### `authMiddleware.js` — `protect`
Verifies the JWT token from the `Authorization: Bearer <token>` header.
Attaches the full user object to `req.user`.
Returns `401` if missing or invalid.

### `roleMiddleware.js` — `authorize(...roles)`
Checks that `req.user.role` is in the allowed roles list.
Returns `403` if the role is not permitted.

Usage example:
```js
router.put('/profile', protect, authorize('donor'), updateProfile);
```

---

## Donor Reliability Score (DRS)

Every donor starts at **50**. Score is capped between **0 and 100**.

| Event | DRS Change |
|---|---|
| Donation fulfilled | +10 |
| Responded within 30 minutes | +5 |
| Waited full 90-day cooldown | +3 |
| Profile 100% complete (once) | +2 |
| Cancelled after accepting | -8 |
| Ignored 3 consecutive alerts | -5 |
| No-show after confirmation | -10 |

Badge tiers: 90–100 = 🥇 Trusted Lifesaver, 70–89 = 🥈 Reliable Donor,
50–69 = 🥉 Active Donor, below 50 = ⚠️ Needs Improvement

---

## Blood Compatibility Logic

`server/utils/bloodCompatibility.js`

```
Recipient  →  Can receive from (donor types)
A+         →  A+, A-, O+, O-
A-         →  A-, O-
B+         →  B+, B-, O+, O-
B-         →  B-, O-
AB+        →  All types
AB-        →  A-, B-, AB-, O-
O+         →  O+, O-
O-         →  O- only
```

Used in: donor matching, request notifications, SOS broadcasts.

---

## Socket.io Events

### Server → Client
| Event | When | Payload |
|---|---|---|
| `new_blood_request` | New request posted | `{ request, notification }` |
| `sos_alert` | SOS triggered | `{ request, message, notification }` |
| `request_accepted` | Donor accepts | `{ donorId, donorName, requestId, notification }` |
| `donor_confirmed` | Requester confirms donor | `{ requestId, message, notification }` |
| `donation_confirmed` | Request fulfilled | `{ donorId, newDRS, badge, notification }` |
| `notification` | Any in-app notification | `{ title, message, type, notification }` |

### Room Strategy
- Each user joins room: `userId` (private messages)
- Each user joins room: `city` (city-wide broadcasts)

---

## Background Jobs (node-cron)

### Hourly Cooldown Lift — `0 * * * *`
Finds all donors whose `cooldownUntil` has passed.
Sets `availability = 'available'`, `cooldownUntil = null`.
Sends notification + socket event to each donor.

Also runs on every incoming HTTP request (on-access check) to catch cases between cron ticks.

### Coordination Nudge — `*/5 * * * *`
Finds active requests (`open` or `matched`) with:
- `coordinator = null`
- `coordinationNudgeSent = false`
- Time elapsed ≥ urgency threshold

**Urgency thresholds:**
- Critical → 15 minutes
- Moderate → 30 minutes
- Planned → 60 minutes

Fires once per request (`coordinationNudgeSent = true` after firing).
Notifies requester and matched donor (if any) to coordinate directly.

---

## Donor Matching Algorithm

When a requester views matched donors for their request:
1. Filter donors: `role='donor'`, same `city`, `availability='available'`, `isVerified=true`, `isActive=true`
2. Filter by blood compatibility using `isCompatible(donor.bloodType, request.bloodType)`
3. Sort descending by `drsScore`
4. Return top 10 — phone hidden until donor is confirmed by requester

---

## Milestone Badges

Awarded automatically when `totalDonations` hits a threshold:

| Donations | Badge |
|---|---|
| 1 | First Drop 🩸 |
| 5 | Life Guardian 💪 |
| 10 | Hero of the City 🏆 |
| 25 | Legend 🌟 |

Stored in `user.badges[]`. Notification fires when milestone is reached.

---

## Deployment (Render)

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set root directory to `server/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
7. Deploy — Render provides a stable HTTPS URL

---

## Dependencies

```json
"dependencies": {
  "bcryptjs":    "password hashing",
  "cors":        "cross-origin requests",
  "dotenv":      "environment variables",
  "express":     "web framework",
  "jsonwebtoken":"JWT auth",
  "mongoose":    "MongoDB ODM",
  "node-cron":   "scheduled background jobs",
  "socket.io":   "real-time WebSocket layer"
}
```
