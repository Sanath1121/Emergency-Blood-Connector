const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const mongoose = require('mongoose');

// Models for cron checks
const User = require('./models/User');
const Notification = require('./models/Notification');
const BloodRequest = require('./models/BloodRequest');

// Routes
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');

const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Middleware to check and lift cooldowns on request (compliance with "on every donor login OR via scheduled check")
app.use(async (req, res, next) => {
  // We'll perform this check asynchronously and continue, to avoid blocking the request
  try {
    // If we have a authenticated user or can check generally for expired cooldowns
    // Let's check and lift expired cooldowns for any donor whose time has elapsed
    const expiredCooldownDonors = await User.find({
      role: 'donor',
      availability: 'on_cooldown',
      cooldownUntil: { $lte: new Date() }
    });

    if (expiredCooldownDonors.length > 0) {
      const io = app.get('io');
      for (const donor of expiredCooldownDonors) {
        donor.availability = 'available';
        donor.cooldownUntil = null;
        await donor.save();

        const notif = await Notification.create({
          recipient: donor._id,
          title: '💚 Cooldown Lifted!',
          message: 'Your 90 days cooldown period has ended. You are now available to donate again!',
          type: 'cooldown_lifted'
        });

        if (io) {
          io.to(donor._id.toString()).emit('notification', {
            title: '💚 Cooldown Lifted!',
            message: 'Your cooldown period has ended. You are now available to donate again!',
            type: 'cooldown_lifted',
            notification: notif
          });
        }
        console.log(`Lifting cooldown on-access for donor: ${donor.name}`);
      }
    }
  } catch (error) {
    console.error('Error on-access checking cooldown lifter:', error);
  }
  next();
});

// Bind routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bloodbanks', bloodBankRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health and readiness endpoints for orchestration
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/ready', (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 1 = connected
    if (state === 1) {
      return res.json({ ready: true, mongoState: state });
    }
    return res.status(503).json({ ready: false, mongoState: state });
  } catch (err) {
    return res.status(500).json({ ready: false, error: err.message });
  }
});

// Fallback error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io in app to access it in controllers
app.set('io', io);

// Initialize Socket.io handler
socketHandler(io);

// Hourly cooldown lift cron check
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly cooldown validator job...');
  try {
    const expiredCooldownDonors = await User.find({
      role: 'donor',
      availability: 'on_cooldown',
      cooldownUntil: { $lte: new Date() }
    });

    for (const donor of expiredCooldownDonors) {
      donor.availability = 'available';
      donor.cooldownUntil = null;
      await donor.save();

      // Create notification
      const notif = await Notification.create({
        recipient: donor._id,
        title: '💚 Cooldown Lifted!',
        message: 'Your 90 days cooldown period has ended. You are now available to donate again!',
        type: 'cooldown_lifted'
      });

      // Emit socket notification
      io.to(donor._id.toString()).emit('notification', {
        title: '💚 Cooldown Lifted!',
        message: 'Your cooldown period has ended. You are now available to donate again!',
        type: 'cooldown_lifted',
        notification: notif
      });

      console.log(`Lifting cooldown for donor: ${donor.name}`);
    }
  } catch (error) {
    console.error('Error running cooldown validation cron:', error);
  }
});

// ─── Urgency-based Coordination Nudge Cron ───────────────────────────────────
// Fires every 5 minutes. If a request has no coordinator after the urgency
// threshold, it notifies the requester (and matched donor if any) to
// self-coordinate directly — without depending on a third party.
//
// Thresholds:
//   critical → 15 minutes
//   moderate → 30 minutes
//   planned  → 60 minutes
// ─────────────────────────────────────────────────────────────────────────────
const COORDINATION_NUDGE_MINUTES = {
  critical: 15,
  moderate: 30,
  planned: 60
};

cron.schedule('*/5 * * * *', async () => {
  console.log('Running coordination nudge check...');
  try {
    const now = new Date();

    // Find active requests with no coordinator, nudge not yet sent
    const pendingRequests = await BloodRequest.find({
      status: { $in: ['open', 'matched'] },
      coordinator: null,
      coordinationNudgeSent: false
    }).populate('matchedDonor', '_id name');

    for (const request of pendingRequests) {
      const minutesElapsed = (now - new Date(request.createdAt)) / 1000 / 60;
      const threshold = COORDINATION_NUDGE_MINUTES[request.urgency] || 30;

      if (minutesElapsed < threshold) continue; // not time yet

      const urgencyLabel = request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1);
      const thresholdLabel = `${threshold} minute${threshold > 1 ? 's' : ''}`;

      // Notify requester
      const requesterNotif = await Notification.create({
        recipient: request.postedBy,
        title: `⚠️ No Coordinator Found (${urgencyLabel})`,
        message: `${thresholdLabel} have passed with no donor stepping up to coordinate for ${request.patientName}${
          request.matchedDonor
            ? `. Your confirmed donor has been notified — please coordinate directly with each other.`
            : `. Once a donor is confirmed, please coordinate directly with them.`
        }`,
        type: 'general',
        relatedRequest: request._id
      });

      if (io) {
        io.to(request.postedBy.toString()).emit('notification', {
          title: `⚠️ No Coordinator Found (${urgencyLabel})`,
          message: `Please coordinate directly for ${request.patientName}'s request.`,
          type: 'general',
          notification: requesterNotif
        });
      }

      // If request is already matched, also notify the confirmed donor
      if (request.matchedDonor) {
        const donorNotif = await Notification.create({
          recipient: request.matchedDonor._id,
          title: `⚠️ Please Coordinate Directly (${urgencyLabel})`,
          message: `No coordinator has been assigned for the ${request.urgency} request for ${request.patientName}. Please stay in direct contact with the requester and proceed to the hospital.`,
          type: 'general',
          relatedRequest: request._id
        });

        if (io) {
          io.to(request.matchedDonor._id.toString()).emit('notification', {
            title: `⚠️ Please Coordinate Directly (${urgencyLabel})`,
            message: `No coordinator for ${request.patientName}'s request — contact the requester directly.`,
            type: 'general',
            notification: donorNotif
          });
        }
      }

      // Mark as nudged so this never fires again for this request
      request.coordinationNudgeSent = true;
      await request.save();

      console.log(`[Nudge] Coordination fallback sent — Request: ${request._id} | Urgency: ${request.urgency} | Threshold: ${threshold}min`);
    }
  } catch (error) {
    console.error('Error running coordination nudge cron:', error);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
