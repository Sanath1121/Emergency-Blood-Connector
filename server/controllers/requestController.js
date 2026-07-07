const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const DonationRecord = require('../models/DonationRecord');
const Notification = require('../models/Notification');
const { isCompatible } = require('../utils/bloodCompatibility');
const { updateDRS, DRS_RULES, getDRSBadge } = require('../utils/drsCalculator');

// Helper to award milestone badges
const checkAndAwardBadges = (user) => {
  const count = user.totalDonations;
  const currentBadges = user.badges.map(b => b.label);
  const newBadges = [];

  if (count >= 1 && !currentBadges.includes('First Drop 🩸')) {
    newBadges.push({ label: 'First Drop 🩸' });
  }
  if (count >= 5 && !currentBadges.includes('Life Guardian 💪')) {
    newBadges.push({ label: 'Life Guardian 💪' });
  }
  if (count >= 10 && !currentBadges.includes('Hero of the City 🏆')) {
    newBadges.push({ label: 'Hero of the City 🏆' });
  }
  if (count >= 25 && !currentBadges.includes('Legend 🌟')) {
    newBadges.push({ label: 'Legend 🌟' });
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    return newBadges.map(b => b.label);
  }
  return [];
};

// @desc    Post new blood request
// @route   POST /api/requests
// @access  Private (Requester, Hospital)
const createRequest = async (req, res) => {
  try {
    const { patientName, bloodType, unitsRequired, hospitalName, city, urgency } = req.body;

    const request = await BloodRequest.create({
      postedBy: req.user._id,
      patientName,
      bloodType,
      unitsRequired,
      hospitalName,
      city,
      urgency
    });

    // Find compatible and verified/available donors in same city to send socket and notification alerts
    const io = req.app.get('io');
    const eligibleDonors = await User.find({
      role: 'donor',
      city,
      availability: 'available',
      isVerified: true,
      isActive: true
    });

    const compatibleDonors = eligibleDonors.filter(donor => isCompatible(donor.bloodType, bloodType));

    // Send notifications to compatible donors
    const notificationPromises = compatibleDonors.map(async (donor) => {
      // Increment consecutive ignored count (will be reset when they respond)
      donor.consecutiveIgnoredCount += 1;
      if (donor.consecutiveIgnoredCount >= 3) {
        donor.drsScore = updateDRS(donor.drsScore, DRS_RULES.IGNORED_3_CONSECUTIVE);
        // Reset count so penalty doesn't keep stacking every request
        donor.consecutiveIgnoredCount = 0;
      }
      await donor.save();

      const notif = await Notification.create({
        recipient: donor._id,
        title: `🩸 Urgent Blood Needed: ${bloodType} in ${city}`,
        message: `Patient ${patientName} requires ${unitsRequired} units of ${bloodType} at ${hospitalName}.`,
        type: 'blood_request',
        relatedRequest: request._id
      });

      // Emit to private user room
      if (io) {
        io.to(donor._id.toString()).emit('new_blood_request', {
          request,
          notification: notif
        });
      }
    });

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests (filterable by city, blood type, urgency, or own requests)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    const { city, bloodType, urgency, my } = req.query;
    const query = {};

    if (my === 'true') {
      query.postedBy = req.user._id;
    } else {
      query.status = 'open';
      if (city) query.city = city;
      if (bloodType) query.bloodType = bloodType;
      if (urgency) query.urgency = urgency;
    }

    const requests = await BloodRequest.find(query)
      .populate('postedBy', 'name email city')
      .populate('matchedDonor', 'name email city phone drsScore totalDonations badges')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single request with compatible matched donors (top 10 by DRS)
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('postedBy', 'name email city phone')
      .populate('matchedDonor', 'name email city phone drsScore totalDonations badges')
      .populate('respondedDonors', 'name email city phone drsScore totalDonations badges');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Hide donor phone numbers in respondedDonors unless the user viewing is the creator and it's the matched donor
    const isCreator = request.postedBy._id.toString() === req.user._id.toString() || req.user.role === 'admin';
    
    let matchedDonorsList = [];
    if (isCreator && request.status === 'open') {
      // Retrieve compatible donors matching algorithm
      const eligibleDonors = await User.find({
        role: 'donor',
        city: request.city,
        availability: 'available',
        isVerified: true,
        isActive: true
      });

      const compatible = eligibleDonors.filter(donor => isCompatible(donor.bloodType, request.bloodType));
      
      // Sort descending by DRS and pick top 10
      compatible.sort((a, b) => b.drsScore - a.drsScore);
      matchedDonorsList = compatible.slice(0, 10).map(d => {
        const dObj = d.toObject();
        delete dObj.password;
        delete dObj.phone; // Hide phone until confirmed!
        return dObj;
      });
    }

    const requestData = request.toObject();
    
    // Hide matchedDonor phone if not creator/admin
    if (requestData.matchedDonor && !isCreator) {
      delete requestData.matchedDonor.phone;
    }
    
    // Hide phone for respondedDonors if not creator/admin
    if (!isCreator && requestData.respondedDonors) {
      requestData.respondedDonors.forEach(donor => {
        delete donor.phone;
      });
    }

    res.json({
      success: true,
      data: {
        request: requestData,
        matchedDonorsList
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Donor responds/accepts a request
// @route   PUT /api/requests/:id/respond
// @access  Private (Donor)
const respondToRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Request is no longer open' });
    }

    if (req.user.availability === 'on_cooldown') {
      return res.status(400).json({ success: false, message: 'You are on cooldown and cannot accept requests.' });
    }

    if (request.respondedDonors.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already responded to this request' });
    }

    request.respondedDonors.push(req.user._id);
    await request.save();

    // Trigger DRS score increase for quick response (+5 DRS if within 30 min)
    const donor = await User.findById(req.user._id);
    const diffMs = Date.now() - new Date(request.createdAt).getTime();
    const diffMins = diffMs / 1000 / 60;
    
    let drsChange = 0;
    if (diffMins <= 30) {
      donor.drsScore = updateDRS(donor.drsScore, DRS_RULES.RESPONDED_WITHIN_30_MIN);
      drsChange = DRS_RULES.RESPONDED_WITHIN_30_MIN;
    }

    // Reset consecutive ignored alerts
    donor.consecutiveIgnoredCount = 0;
    await donor.save();

    // Send notification to requester
    const notif = await Notification.create({
      recipient: request.postedBy,
      title: '🤝 Donor Accepted Request',
      message: `Donor ${req.user.name} (DRS: ${donor.drsScore}) has accepted your blood request!`,
      type: 'request_accepted',
      relatedRequest: request._id
    });

    const io = req.app.get('io');
    if (io) {
      // Send real time to requester
      io.to(request.postedBy.toString()).emit('request_accepted', {
        donorId: req.user._id,
        donorName: req.user.name,
        requestId: request._id,
        notification: notif
      });
    }

    res.json({
      success: true,
      message: 'Responded to request successfully',
      data: {
        drsScore: donor.drsScore,
        drsChange
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Requester confirms a donor
// @route   PUT /api/requests/:id/confirm/:donorId
// @access  Private (Requester, Hospital)
const confirmDonor = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm donor for this request' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Request is already matched or fulfilled' });
    }

    const donorId = req.params.donorId;
    if (!request.respondedDonors.includes(donorId)) {
      return res.status(400).json({ success: false, message: 'Donor did not respond to this request' });
    }

    request.matchedDonor = donorId;
    request.status = 'matched';
    await request.save();

    const donor = await User.findById(donorId);
    
    // Notify donor with requester details (reveal phone number now!)
    const notif = await Notification.create({
      recipient: donorId,
      title: '🥇 Request Confirmed!',
      message: `You have been selected as the donor for patient ${request.patientName}. Please contact ${req.user.name} at ${req.user.phone || 'N/A'}.`,
      type: 'donor_confirmed',
      relatedRequest: request._id
    });

    const io = req.app.get('io');
    if (io) {
      io.to(donorId.toString()).emit('donor_confirmed', {
        requestId: request._id,
        message: `You have been confirmed to donate. Contact number: ${req.user.phone}`,
        notification: notif
      });
    }

    res.json({
      success: true,
      message: 'Donor confirmed successfully. Phone revealed.',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark request as fulfilled (triggers DRS update + cooldown)
// @route   PUT /api/requests/:id/fulfill
// @access  Private (Requester, Hospital, Admin)
const fulfillRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isCreator = request.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to fulfill this request' });
    }

    if (request.status !== 'matched' || !request.matchedDonor) {
      return res.status(400).json({ success: false, message: 'Request must be in matched status with a confirmed donor' });
    }

    request.status = 'fulfilled';
    request.fulfilledAt = Date.now();
    await request.save();

    const donor = await User.findById(request.matchedDonor);
    if (donor) {
      // 1. Update DRS score
      donor.drsScore = updateDRS(donor.drsScore, DRS_RULES.DONATED_AFTER_ACCEPTING);
      
      // 2. Set cooldown (90 days)
      donor.availability = 'on_cooldown';
      donor.cooldownUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      
      // 3. Increment total donations
      donor.totalDonations += 1;
      donor.lastDonationDate = Date.now();

      // 4. Award milestone badges
      const awarded = checkAndAwardBadges(donor);

      await donor.save();

      // 5. Create DonationRecord
      await DonationRecord.create({
        donor: donor._id,
        request: request._id,
        markedBy: req.user._id,
        drsChange: DRS_RULES.DONATED_AFTER_ACCEPTING,
        outcome: 'donated'
      });

      // 6. Create Notification
      const milestoneMsg = awarded.length > 0 ? ` Milestone unlocked: ${awarded.join(', ')}!` : '';
      const notif = await Notification.create({
        recipient: donor._id,
        title: '🎉 Donation Confirmed & DRS Updated!',
        message: `Your donation was confirmed. Your DRS score increased by +10. (New DRS: ${donor.drsScore}, Badge: ${getDRSBadge(donor.drsScore).label}). You are placed on a 90 days cooldown period.${milestoneMsg}`,
        type: 'donation_confirmed',
        relatedRequest: request._id
      });

      const io = req.app.get('io');
      if (io) {
        io.to(donor._id.toString()).emit('donation_confirmed', {
          donorId: donor._id,
          newDRS: donor.drsScore,
          badge: getDRSBadge(donor.drsScore),
          notification: notif
        });
      }
    }

    res.json({
      success: true,
      message: 'Request fulfilled successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a request
// @route   PUT /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isCreator = request.postedBy.toString() === req.user._id.toString();
    const isDonor = request.matchedDonor && request.matchedDonor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isDonor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    // If request was matched, and donor cancels -> Apply DRS penalty
    if (request.status === 'matched' && request.matchedDonor) {
      const donor = await User.findById(request.matchedDonor);
      if (donor) {
        // If donor cancelled
        if (isDonor) {
          donor.drsScore = updateDRS(donor.drsScore, DRS_RULES.CANCELLED_AFTER_ACCEPTING);
          await donor.save();

          await DonationRecord.create({
            donor: donor._id,
            request: request._id,
            drsChange: DRS_RULES.CANCELLED_AFTER_ACCEPTING,
            outcome: 'cancelled_by_donor'
          });

          // Notify requester
          await Notification.create({
            recipient: request.postedBy,
            title: '⚠️ Donor Cancelled Commitment',
            message: `Donor ${donor.name} has cancelled their commitment to donate. The request is set back to open.`,
            type: 'general',
            relatedRequest: request._id
          });

          // Reset request back to open so other donors can match
          request.status = 'open';
          request.matchedDonor = null;
          request.respondedDonors = request.respondedDonors.filter(id => id.toString() !== donor._id.toString());
          await request.save();

          return res.json({
            success: true,
            message: 'Commitment cancelled. Donor DRS penalized.',
            data: request
          });
        }
      }
    }

    // Default: close/cancel the request entirely
    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark donor as no-show (triggers DRS penalty)
// @route   PUT /api/requests/:id/noshow/:donorId
// @access  Private (Requester, Hospital, Admin)
const markNoShow = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isCreator = request.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const donorId = req.params.donorId;
    if (request.matchedDonor?.toString() !== donorId) {
      return res.status(400).json({ success: false, message: 'Donor is not confirmed for this request' });
    }

    // Apply no show penalty to donor
    const donor = await User.findById(donorId);
    if (donor) {
      donor.drsScore = updateDRS(donor.drsScore, DRS_RULES.NO_SHOW_AFTER_CONFIRM);
      await donor.save();

      // Record donation record
      await DonationRecord.create({
        donor: donor._id,
        request: request._id,
        markedBy: req.user._id,
        drsChange: DRS_RULES.NO_SHOW_AFTER_CONFIRM,
        outcome: 'no_show'
      });

      // Send Notification to donor
      await Notification.create({
        recipient: donor._id,
        title: '⚠️ No-Show Penalty Applied',
        message: `You were marked as a no-show. Your DRS score decreased by -10.`,
        type: 'drs_update',
        relatedRequest: request._id
      });
    }

    // Reset request back to open so other donors can match
    request.status = 'open';
    request.matchedDonor = null;
    request.respondedDonors = request.respondedDonors.filter(id => id.toString() !== donorId);
    await request.save();

    res.json({
      success: true,
      message: 'Donor marked as no-show. Request reopened.',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Broadcast SOS to all eligible donors in the city
// @route   POST /api/requests/:id/sos
// @access  Private (Admin, Hospital)
const triggerSOS = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Only Hospital or Admin can trigger SOS alerts' });
    }

    // Broadcast SOS alert via Socket.io to all users joined in the city room
    const io = req.app.get('io');
    const eligibleDonors = await User.find({
      role: 'donor',
      city: request.city,
      availability: 'available',
      isVerified: true,
      isActive: true
    });

    const compatibleDonors = eligibleDonors.filter(donor => isCompatible(donor.bloodType, request.bloodType));

    const notificationPromises = compatibleDonors.map(async (donor) => {
      const notif = await Notification.create({
        recipient: donor._id,
        title: '🚨 CRITICAL SOS ALERT 🚨',
        message: `EMERGENCY! ${request.bloodType} blood is critically required for ${request.patientName} at ${request.hospitalName}, ${request.city}! Please respond immediately!`,
        type: 'sos_alert',
        relatedRequest: request._id
      });

      if (io) {
        io.to(donor._id.toString()).emit('sos_alert', {
          request,
          message: `🚨 Emergency SOS: Compatible blood type ${request.bloodType} required immediately in your city!`,
          notification: notif
        });
      }
    });

    await Promise.all(notificationPromises);

    res.json({
      success: true,
      message: 'SOS broadcasted to eligible city donors'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Donor self-assigns as a coordinator/helper on a request
// @route   PUT /api/requests/:id/coordinate
// @access  Private (Donor)
const coordinateRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!['open', 'matched'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Request is no longer active and cannot be coordinated.' });
    }

    if (request.coordinator && request.coordinator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are already coordinating this request.' });
    }

    if (request.coordinator) {
      return res.status(400).json({ success: false, message: 'This request already has a coordinator assigned.' });
    }

    request.coordinator = req.user._id;
    await request.save();

    // Notify the requester
    await Notification.create({
      recipient: request.postedBy,
      title: '🤝 Donor Volunteered to Coordinate',
      message: `Donor ${req.user.name} has stepped up to help coordinate your request for ${request.patientName}. You can contact them at ${req.user.phone || 'N/A'}.`,
      type: 'general',
      relatedRequest: request._id
    });

    const io = req.app.get('io');
    if (io) {
      io.to(request.postedBy.toString()).emit('notification', {
        title: '🤝 Donor Volunteered to Coordinate',
        message: `Donor ${req.user.name} is helping coordinate your blood request.`,
        type: 'general'
      });
    }

    res.json({
      success: true,
      message: 'You are now coordinating this request. The patient has been notified.',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  respondToRequest,
  confirmDonor,
  fulfillRequest,
  cancelRequest,
  markNoShow,
  triggerSOS,
  coordinateRequest
};
