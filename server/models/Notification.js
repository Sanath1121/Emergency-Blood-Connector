const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['blood_request', 'sos_alert', 'request_accepted', 'donor_confirmed', 'donation_confirmed', 'drs_update', 'cooldown_lifted', 'general'],
    required: true
  },
  isRead: { type: Boolean, default: false },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
