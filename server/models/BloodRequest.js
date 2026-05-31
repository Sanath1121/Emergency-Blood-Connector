const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
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
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  coordinationNudgeSent: { type: Boolean, default: false }, // true after fallback notification fires
  createdAt: { type: Date, default: Date.now },
  fulfilledAt: { type: Date, default: null }
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
