const User = require('../models/User');
const DonationRecord = require('../models/DonationRecord');
const BloodRequest = require('../models/BloodRequest');
const { updateDRS, DRS_RULES } = require('../utils/drsCalculator');

// @desc    Get all available donors (filtered by city, blood type)
// @route   GET /api/donors
// @access  Private
const getDonors = async (req, res) => {
  try {
    const { city, bloodType } = req.query;
    const query = {
      role: 'donor',
      isActive: true,
      isVerified: true,
      availability: 'available'
    };

    if (city) query.city = city;
    if (bloodType) query.bloodType = bloodType;

    // Standard search: hide phone, sort by DRS score descending
    const donors = await User.find(query)
      .select('-password -phone')
      .sort({ drsScore: -1 });

    res.json({
      success: true,
      data: donors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific donor profile with DRS
// @route   GET /api/donors/:id
// @access  Private
const getDonorById = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: 'donor' }).select('-password -phone');
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/donors/profile
// @access  Private (Donor)
const updateProfile = async (req, res) => {
  try {
    const { name, city, phone, showOnLeaderboard } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wasProfileComplete = user.profileComplete;

    if (name) user.name = name;
    if (city) user.city = city;
    if (phone) user.phone = phone;
    if (showOnLeaderboard !== undefined) user.showOnLeaderboard = showOnLeaderboard;

    // Check if profile is now complete for the first time
    // Name, city, phone, bloodType (if donor) must exist
    const isNowComplete = !!(user.name && user.city && user.phone && (user.role !== 'donor' || user.bloodType));

    if (!wasProfileComplete && isNowComplete) {
      user.profileComplete = true;
      // DRS Profile complete bonus!
      user.drsScore = updateDRS(user.drsScore, DRS_RULES.PROFILE_COMPLETE);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle availability status
// @route   PUT /api/donors/availability
// @access  Private (Donor)
const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.availability === 'on_cooldown') {
      return res.status(400).json({
        success: false,
        message: `Cannot toggle availability. You are currently on cooldown until ${user.cooldownUntil}`
      });
    }

    user.availability = user.availability === 'available' ? 'unavailable' : 'available';
    await user.save();

    res.json({
      success: true,
      data: {
        availability: user.availability
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests donor has responded to
// @route   GET /api/donors/my/requests
// @access  Private (Donor)
const getMyRespondedRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      respondedDonors: req.user._id
    }).populate('postedBy', 'name email city');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donor's full donation history
// @route   GET /api/donors/my/history
// @access  Private (Donor)
const getDonationHistory = async (req, res) => {
  try {
    const history = await DonationRecord.find({ donor: req.user._id })
      .populate({
        path: 'request',
        populate: { path: 'postedBy', select: 'name email city' }
      })
      .sort({ donatedAt: -1 });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top 10 donors in user's city by totalDonations (leaderboard)
// @route   GET /api/donors/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const city = req.user.city;
    const topDonors = await User.find({
      role: 'donor',
      city: city,
      showOnLeaderboard: true,
      isActive: true
    })
      .select('name email city drsScore totalDonations badges')
      .sort({ totalDonations: -1 })
      .limit(10);

    res.json({
      success: true,
      data: topDonors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDonors,
  getDonorById,
  updateProfile,
  toggleAvailability,
  getMyRespondedRequests,
  getDonationHistory,
  getLeaderboard
};
