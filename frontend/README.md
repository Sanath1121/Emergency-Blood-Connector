# BloodBridge — Frontend (Client)

React.js application built with Vite. Provides role-based dashboards, real-time notifications, an interactive map, and multilingual support.

---

## Quick Start

```bash
cd frontend
npm install
npm run dev       # development server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

Optional (Google OAuth):
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Folder Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/                # Images, icons
│   ├── components/
│   │   └── common/
│   │       ├── Navbar.jsx     # Top bar: logo, notification bell, language toggle, avatar, logout
│   │       ├── Sidebar.jsx    # Role-specific left navigation
│   │       └── DRSBadge.jsx   # Donor Reliability Score badge component
│   ├── context/
│   │   ├── AuthContext.jsx           # Global auth state: user, token, login, logout, register
│   │   └── NotificationContext.jsx   # In-app toast notifications + unread bell count
│   ├── hooks/
│   │   └── useSocket.js       # Socket.io connection hook
│   ├── i18n/
│   │   ├── index.js           # i18next configuration
│   │   └── locales/
│   │       ├── en.json        # English translations
│   │       ├── hi.json        # Hindi translations
│   │       └── te.json        # Telugu translations
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx      # Email/password + Google Sign-In
│   │   │   └── Register.jsx   # Role selection + onboarding form + Google flow
│   │   ├── donor/
│   │   │   ├── DonorDashboard.jsx   # DRS card, cooldown timer, stats, recent notifications
│   │   │   ├── DonorProfile.jsx     # Edit profile, toggle availability, donation history
│   │   │   └── OpenRequests.jsx     # Compatible requests in city + Accept + Help Coordinate
│   │   ├── requester/
│   │   │   ├── RequesterDashboard.jsx  # My active requests, status tracking
│   │   │   ├── PostRequest.jsx         # Form to post a new blood request
│   │   │   └── MatchedDonors.jsx       # Ranked compatible donor list, confirm button
│   │   ├── hospital/
│   │   │   └── HospitalDashboard.jsx   # Post requests, manage active, SOS trigger
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Platform stats cards
│   │   │   ├── ManageUsers.jsx         # Table of all users, verify/suspend actions
│   │   │   ├── ManageRequests.jsx      # All platform requests with status management
│   │   │   └── ManageBloodBanks.jsx    # CRUD interface for blood bank directory
│   │   ├── Home.jsx                    # Public landing page
│   │   ├── BloodBankDirectory.jsx      # Searchable blood bank list with inventory
│   │   ├── MapView.jsx                 # Leaflet map with donor + blood bank pins
│   │   └── AccountManagementPage.jsx   # Profile settings, password change, avatar
│   ├── routes/
│   │   └── ProtectedRoute.jsx   # Role-based route guard
│   ├── services/
│   │   └── api.js               # Axios instance with base URL + auth interceptor
│   ├── utils/
│   │   └── bloodCompatibility.js  # Client-side blood type compatibility checker
│   ├── App.jsx                  # Router, route definitions, DashboardDecider
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   └── App.css                  # Component-level styles
├── index.html
├── vite.config.js
└── package.json
```

---

## Pages

### Public Pages (no login required)

#### `Home.jsx`
Landing page with platform introduction, live stats (total donors, donations), and CTA buttons to register or login.

#### `auth/Login.jsx`
- Email + password login form
- Google Sign-In button (if `VITE_GOOGLE_CLIENT_ID` is configured)
- On success → redirects to `/dashboard`
- On 401 → Axios interceptor clears token and redirects to `/login`

#### `auth/Register.jsx`
- Role selection (Donor / Patient/Requester / Hospital)
- Role-specific fields: blood type shown only for donors
- Google OAuth onboarding flow: pre-fills name + email, asks for role + city
- On success → redirects to `/dashboard`

---

### Shared Pages (all logged-in roles)

#### `BloodBankDirectory.jsx`
Searchable, filterable list of all blood banks. Shows per-type inventory (A+, B+, O-, etc.), city, address, and phone.

#### `MapView.jsx`
Interactive Leaflet map with:
- 📍 Anonymous donor pins (blood type shown, no personal info)
- 🏦 Blood bank pins with inventory popup
- Filter by blood type

#### `AccountManagementPage.jsx`
- Edit name, city, phone
- Change or set password
- Google-linked account indicator
- Avatar display

---

### Donor Pages

#### `donor/DonorDashboard.jsx`
- DRS score card with badge (🥇/🥈/🥉/⚠️)
- Cooldown countdown timer (days remaining until available)
- Quick stats: total donations, response rate
- Recent notifications panel
- Leaderboard preview

#### `donor/DonorProfile.jsx`
- Edit profile form (name, city, phone, blood type)
- Availability toggle (Available / Unavailable)
- Full donation history table
- Opt-in/out of city leaderboard
- Profile completion tracker

#### `donor/OpenRequests.jsx`
- Filtered list of compatible blood requests in donor's city
- Each card shows: blood type, patient name, units, hospital, urgency ribbon, time posted
- **Accept Request** button → responds to request, DRS +5 if within 30 min
- **🤝 Help Coordinate** button → self-assigns as coordinator, notifies patient's family
- Buttons update to status badges after action

---

### Requester Pages

#### `requester/RequesterDashboard.jsx`
- All my active requests with status chips (open / matched / fulfilled / cancelled)
- Coordinator status shown per request
- Quick links to Post Request and Matched Donors

#### `requester/PostRequest.jsx`
Form fields:
- Patient name, blood type, units required
- Hospital name, city
- Urgency level (Critical / Moderate / Planned)

On submit → real-time notifications sent to compatible donors in city.

#### `requester/MatchedDonors.jsx`
- Top 10 compatible donors ranked by DRS score
- Shows: name, blood type, DRS score, badge, total donations
- Phone number **hidden** until Confirm is clicked
- Confirm button → status changes to `matched`, donor's phone revealed, donor notified

---

### Hospital Pages

#### `hospital/HospitalDashboard.jsx`
- Post blood requests (same as requester)
- View all hospital's active requests
- **🚨 SOS Alert** button — broadcasts emergency to all eligible city donors simultaneously
- Blood bank inventory reference panel

---

### Admin Pages

#### `admin/AdminDashboard.jsx`
Stats cards:
- Total registered users
- Total donations fulfilled
- Active open requests
- Top city by request activity

#### `admin/ManageUsers.jsx`
- Table of all users with role, city, blood type, DRS, status
- Filter by role (Donor / Requester / Hospital) and city
- Search by name or email
- **Verify** button for unverified donors
- **Suspend / Activate** toggle for any non-admin user

#### `admin/ManageRequests.jsx`
- All blood requests across the platform
- Filter by status, city, urgency
- Fulfill, cancel, and no-show actions available

#### `admin/ManageBloodBanks.jsx`
- Full CRUD: Add, Edit, Delete blood banks
- Update per-blood-type inventory levels
- Set GPS coordinates for map display

---

## Routing

All routes defined in `App.jsx`:

| Path | Component | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | DashboardDecider (role-based) | Any logged-in user |
| `/profile` | DonorProfile | Donor only |
| `/requests` | OpenRequests | Donor only |
| `/requests/post` | PostRequest | Requester, Hospital |
| `/requests/:id/matches` | MatchedDonors | Requester, Hospital, Admin |
| `/bloodbanks` | BloodBankDirectory | Any logged-in user |
| `/map` | MapView | Any logged-in user |
| `/account` | AccountManagementPage | Any logged-in user |
| `/admin/users` | ManageUsers | Admin only |
| `/admin/requests` | ManageRequests | Admin only |
| `/admin/bloodbanks` | ManageBloodBanks | Admin only |

### `ProtectedRoute.jsx`
Wraps private routes. Checks:
1. Is user authenticated? → if not, redirect to `/login`
2. Is user's role in `allowedRoles`? → if not, redirect to `/dashboard`

### `DashboardDecider`
Routes `/dashboard` to the correct dashboard component based on `user.role`:
- `donor` → DonorDashboard
- `requester` → RequesterDashboard
- `hospital` → HospitalDashboard
- `admin` → AdminDashboard

---

## Global State (Context)

### `AuthContext.jsx`
Provides to entire app:
```
user              Current user object (from /api/auth/me)
token             JWT stored in localStorage as 'bloodbridge_token'
isAuthenticated   Boolean
login(email, password)
register(formData)
googleLogin(credential, onboardingData)
logout()
updateUserProfile(updatedUser)
```

### `NotificationContext.jsx`
Provides to entire app:
```
notifications       Array of in-app notifications
unreadCount         Number shown on bell icon
addToast(title, message, type)   Show a toast popup
markAsRead(id)
markAllAsRead()
deleteNotification(id)
```

Also connects to Socket.io and listens for real-time events:
- `new_blood_request` → toast + bell count
- `sos_alert` → urgent toast + bell count
- `request_accepted` → toast
- `donor_confirmed` → toast
- `donation_confirmed` → toast + DRS badge update
- `notification` → generic bell + toast

---

## API Service (`services/api.js`)

Axios instance configured with:
- `baseURL`: `VITE_API_URL`
- Request interceptor: attaches `Authorization: Bearer <token>` to all requests
- Response interceptor:
  - On `401` → clears `bloodbridge_token` from localStorage → redirects to `/login`
  - On any error → triggers an error toast via NotificationContext

---

## Multilingual (i18n)

Built with `i18next` + `react-i18next`.

**Supported languages:**
- 🇬🇧 English (`en`) — default
- 🇮🇳 Hindi (`hi`)
- 🇮🇳 Telugu (`te`)

Language selection is a 3-button toggle in the Navbar. Selected language is saved in `localStorage` and persists across sessions.

Translation files located in `src/i18n/locales/`.

---

## Components

### `Navbar.jsx`
- Platform logo: **BloodBridge 🩸**
- 🔔 Notification bell with unread count badge
- 🌐 Language toggle (EN / हिं / తె)
- User avatar + role chip
- Logout button

### `Sidebar.jsx`
Role-specific navigation links (auto-built based on `user.role`):

| Role | Nav Links |
|---|---|
| Donor | Dashboard, Requests, Profile, Blood Banks, Map |
| Requester / Hospital | Dashboard, Post Request, Blood Banks, Map |
| Admin | Dashboard, Manage Users, All Requests, Manage Banks, Map |

Shows city and DRS score (donors only) at the bottom.

### `DRSBadge.jsx`
Displays a colour-coded badge based on DRS score:
- 🥇 Gold (90–100): Trusted Lifesaver
- 🥈 Silver (70–89): Reliable Donor
- 🥉 Bronze (50–69): Active Donor
- ⚠️ Red-orange (<50): Needs Improvement

---

## Deployment (Vercel)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import repo
3. Set **Root Directory** to `frontend/`
4. Add environment variables.
5. Deploy → Vercel provides a stable HTTPS URL
6. Every `git push` to your main branch triggers an automatic redeploy at the same URL

---

## Dependencies

```json
"dependencies": {
  "axios":            "HTTP client with interceptors",
  "i18next":          "internationalization framework",
  "leaflet":          "interactive maps",
  "react":            "UI library",
  "react-dom":        "DOM rendering",
  "react-i18next":    "React bindings for i18next",
  "react-icons":      "icon library (lu set)",
  "react-leaflet":    "Leaflet React components",
  "react-router-dom": "client-side routing",
  "socket.io-client": "real-time WebSocket client"
}
```
