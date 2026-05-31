const mongoose = require('mongoose');

const donationRecordSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donatedAt: { type: Date, default: Date.now },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  drsChange: { type: Number },
  outcome: {
    type: String,
    enum: ['donated', 'cancelled_by_donor', 'no_show'],
    required: true
  }
});

module.exports = mongoose.model('DonationRecord', donationRecordSchema);
