# 🩸 BloodBridge — Emergency Blood Connector

> Connecting blood donors, patients, and hospitals instantly when every second counts.

---

## What is BloodBridge?

BloodBridge is a real-time emergency blood coordination platform built to solve one of the most urgent problems in healthcare — **finding the right blood donor at the right time**.

When a patient needs blood urgently, family members often spend precious hours making phone calls, visiting blood banks, and hoping for the best. BloodBridge eliminates that chaos by connecting verified donors, patients, hospitals, and administrators on a single platform — instantly.

---

## The Problem It Solves

- Families in emergencies don't know which donors are available nearby
- Blood banks run out of stock with no easy way to find live donors fast
- Donors who want to help have no structured way to be discovered
- No existing platform holds donors accountable for showing up after they commit

BloodBridge fixes all of this.

---

## Who Uses BloodBridge?

BloodBridge has **4 types of users**, each with their own experience on the platform:

### 🩸 Blood Donor
A person who is willing to donate blood in emergencies.
- Gets notified instantly when a compatible blood request is posted in their city
- Can accept a request and show up at the hospital
- Can optionally step up to help coordinate a request (contact the patient's family, guide logistics)
- Builds a personal **Donor Reliability Score (DRS)** based on their commitment and follow-through
- Earns milestone badges for loyalty and contribution
- Goes into a 90-day cooldown after each donation (medically safe interval, enforced automatically)

### 🙋 Patient / Requester
A patient's family member or caregiver who needs blood urgently.
- Posts a blood request with the patient's details, required blood type, hospital, and urgency level
- Instantly sees a ranked list of compatible donors nearby — sorted by reliability
- Confirms the donor of their choice
- Can see the donor's phone number only after confirming them (privacy protection)
- Marks the request as fulfilled when the donation is complete
- Can flag a donor as a no-show if they don't show up

### 🏥 Hospital
A registered hospital account with elevated responsibilities.
- Everything a Requester can do, plus:
- Can trigger a **🚨 SOS Alert** — broadcasts an emergency notification to every eligible donor in the city simultaneously via the app

### 🔴 Admin
The platform manager with full oversight.
- Verifies donor accounts before they appear in search results
- Can suspend or reactivate any user account
- Manages the Blood Bank directory (add, update, remove)
- Triggers SOS alerts like hospitals
- Views platform-wide statistics (total donations, active requests, top cities)

---

## Key Features

### ⚡ Real-Time Notifications
The moment a blood request is posted, every compatible donor in that city receives an in-app notification and a live alert — no refresh needed. This is powered by real-time socket technology.

### 🏆 Donor Reliability Score (DRS)
Every donor has a score from 0 to 100 that reflects their reliability. It goes up when they respond quickly, show up, and complete donations. It goes down when they accept a request and cancel, or don't show up. Requesters can see this score when choosing a donor — so the most trustworthy donors rise to the top.

**DRS Badges:**
| Score | Badge |
|---|---|
| 90 – 100 | 🥇 Trusted Lifesaver |
| 70 – 89 | 🥈 Reliable Donor |
| 50 – 69 | 🥉 Active Donor |
| Below 50 | ⚠️ Needs Improvement |

### 🎖️ Milestone Badges
Donors earn special badges as they reach donation milestones:
- 1st donation → **First Drop 🩸**
- 5 donations → **Life Guardian 💪**
- 10 donations → **Hero of the City 🏆**
- 25 donations → **Legend 🌟**

### 🚨 SOS Alert System
Hospitals and admins can trigger a city-wide SOS alert for critical emergencies. Every eligible donor in the city gets an emergency broadcast simultaneously — not just compatible ones, but all available verified donors.

### ⏱️ Smart Cooldown System
After every donation, a donor is automatically placed on a 90-day cooldown (the medically safe waiting period). The system lifts the cooldown automatically when the time is up and notifies the donor.

### 🤝 Coordination Feature
Donors who cannot donate blood (e.g. wrong blood type) can still help by clicking "Help Coordinate" on a request. This assigns them as the logistics coordinator and notifies the patient's family.

If no coordinator steps up within a set time window (based on urgency), the system automatically notifies both the donor and the patient's family to coordinate directly with each other:
- **Critical requests** → 15-minute fallback
- **Moderate requests** → 30-minute fallback
- **Planned requests** → 60-minute fallback

### 🗺️ Live Map
An interactive map shows anonymous donor pins and blood bank locations filterable by blood type and city — so patients and hospitals can visually find help nearby.

### 🏦 Blood Bank Directory
A searchable directory of all blood banks with real-time inventory levels per blood type, city, address, and phone number — managed by the admin.

### 🌐 Multilingual Support
The platform supports **English, Hindi (हिंदी), and Telugu (తెలుగు)** — because emergencies happen across all communities.

### 🔒 Privacy Protection
A donor's phone number is **never shown** to the requester until the requester has confirmed that specific donor. This prevents spam and protects donor privacy.

---

## How a Typical Emergency Works

```
1. Family member posts a blood request (blood type, hospital, urgency)
        ↓
2. Compatible donors in that city are notified instantly
        ↓
3. A donor accepts the request (DRS score updates)
        ↓
4. Family confirms the donor → donor's phone number is revealed
        ↓
5. Donation happens at the hospital
        ↓
6. Family marks the request as fulfilled
        ↓
7. Donor's DRS increases, cooldown starts, badge awarded if milestone reached
```

---

## Sample Login Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@bloodbridge.com | Admin@123 |
| Donor (Mumbai) | rahul@donor.com | Password@123 |
| Donor (Delhi) | priya@donor.com | Password@123 |
| Requester | sunita@requester.com | Password@123 |
| Hospital | hospital@bloodbridge.com | Password@123 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Real-time | Socket.io |
| Authentication | JWT + bcrypt |
| Maps | Leaflet.js + React-Leaflet |
| Multilingual | i18next + react-i18next |
| Scheduled Jobs | node-cron |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas (database) |

---

*BloodBridge — Built for emergencies. Designed for trust.*
