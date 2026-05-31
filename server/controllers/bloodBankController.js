const BloodBank = require('../models/BloodBank');

// @desc    Get all blood banks (filterable by city)
// @route   GET /api/bloodbanks
// @access  Public
const getBloodBanks = async (req, res) => {
  try {
    const { city } = req.query;
    const query = {};
    if (city) query.city = city;

    const banks = await BloodBank.find(query).sort({ name: 1 });
    res.json({
      success: true,
      data: banks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blood bank
// @route   GET /api/bloodbanks/:id
// @access  Public
const getBloodBankById = async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }
    res.json({
      success: true,
      data: bank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new blood bank
// @route   POST /api/bloodbanks
// @access  Private (Admin)
const createBloodBank = async (req, res) => {
  try {
    const { name, city, address, phone, availability, latitude, longitude } = req.body;

    const bank = await BloodBank.create({
      name,
      city,
      address,
      phone,
      availability,
      latitude,
      longitude
    });

    res.status(201).json({
      success: true,
      data: bank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blood bank info + inventory
// @route   PUT /api/bloodbanks/:id
// @access  Private (Admin)
const updateBloodBank = async (req, res) => {
  try {
    const { name, city, address, phone, availability, latitude, longitude } = req.body;
    const bank = await BloodBank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    if (name) bank.name = name;
    if (city) bank.city = city;
    if (address) bank.address = address;
    if (phone) bank.phone = phone;
    if (availability) bank.availability = availability;
    if (latitude !== undefined) bank.latitude = latitude;
    if (longitude !== undefined) bank.longitude = longitude;

    await bank.save();

    res.json({
      success: true,
      data: bank
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blood bank
// @route   DELETE /api/bloodbanks/:id
// @access  Private (Admin)
const deleteBloodBank = async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Blood bank not found' });
    }

    await bank.deleteOne();
    res.json({
      success: true,
      message: 'Blood bank removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBloodBanks,
  getBloodBankById,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank
};
