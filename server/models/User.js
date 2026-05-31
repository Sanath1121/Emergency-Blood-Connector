const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['donor', 'requester', 'hospital', 'admin'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() { return this.role === 'donor'; }
  },
  city: { type: String, required: true },
  phone: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  availability: {
    type: String,
    enum: ['available', 'unavailable', 'on_cooldown'],
    default: 'available'
  },
  cooldownUntil: { type: Date, default: null },
  drsScore: { type: Number, default: 50, min: 0, max: 100 },
  totalDonations: { type: Number, default: 0 },
  lastDonationDate: { type: Date, default: null },
  profileComplete: { type: Boolean, default: false },
  badges: [{
    label: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now }
  }],
  showOnLeaderboard: { type: Boolean, default: false },
  consecutiveIgnoredCount: { type: Number, default: 0 },
  isGoogleUser: { type: Boolean, default: false },
  hasPasswordSet: { type: Boolean, default: true },
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
