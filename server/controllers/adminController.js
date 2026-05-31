const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonationRecord = require('../models/DonationRecord');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, city, isVerified, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (isVerified) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a donor account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyDonor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'donor') {
      return res.status(400).json({ success: false, message: 'Only donor accounts can be verified' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Donor account verified successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend / reactivate a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
const toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'suspended'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const verifiedDonors = await User.countDocuments({ role: 'donor', isVerified: true });
    
    const totalRequests = await BloodRequest.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: 'open' });
    const pendingRequests = activeRequests;
    const matchedRequests = await BloodRequest.countDocuments({ status: 'matched' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });

    // Top donors by totalDonations
    const topDonors = await User.find({ role: 'donor' })
      .select('name email city drsScore totalDonations badges')
      .sort({ totalDonations: -1 })
      .limit(5);

    // City distribution for requests
    const cityStats = await BloodRequest.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        verifiedDonors,
        totalRequests,
        activeRequests,
        pendingRequests,
        matchedRequests,
        fulfilledRequests,
        topDonors,
        cityStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests across the platform
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('postedBy', 'name email city')
      .populate('matchedDonor', 'name email city phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  verifyDonor,
  toggleSuspendUser,
  getStats,
  getAllRequests
};
