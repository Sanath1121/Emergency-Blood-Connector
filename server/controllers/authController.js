const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'bloodbridge_jwt_secret_key_2024',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, bloodType, city, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      bloodType: role === 'donor' ? bloodType : undefined,
      city,
      phone
    });

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: { token, user: userResponse } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, data: { token, user: userResponse } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth Sign-In / Register
// @route   POST /api/auth/google
// @access  Public
const googleSignin = async (req, res) => {
  try {
    const { credential, role, city, phone, bloodType } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    // Cryptographically verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google account email is not verified' });
    }

    let user = await User.findOne({ email });

    if (user) {
      // EXISTING USER — Auto-link Google account if not already linked
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended' });
      }
    } else {
      // NEW USER via Google — Require role + city for onboarding
      if (!role || !city) {
        return res.status(400).json({
          success: false,
          message: 'First-time Google registration requires role and city',
          requiresOnboarding: true,
          googleName: name,
          googleEmail: email,
          googleAvatar: picture
        });
      }

      // Generate secure random password — user authenticates via Google, not password
      const randomPassword = crypto.randomBytes(32).toString('hex');

      user = await User.create({
        name,
        email,
        password: randomPassword,
        role,
        city,
        phone: phone || '',
        bloodType: role === 'donor' ? (bloodType || 'O+') : undefined,
        isGoogleUser: true,
        hasPasswordSet: false,
        avatar: picture || null,
        isVerified: true,
        isActive: true,
        profileComplete: false
      });
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, data: { token, user: userResponse } });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};

// @desc    Change password (standard password OR Google identity verification)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, googleCredential } = req.body;
    const user = await User.findById(req.user._id);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // ── Path A: Verify via Google credential token ──
    if (googleCredential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleCredential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();

      // Double-layer email security check (case-insensitive, frontend + backend)
      if (payload.email.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: `Google account email does not match profile email`
        });
      }

      // Auto-link Google account on successful Google verification
      user.isGoogleUser = true;
      if (payload.picture && !user.avatar) user.avatar = payload.picture;

    } else {
      // ── Path B: Verify via current password ──
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    // Set new password (pre-save hook will bcrypt hash it)
    user.password = newPassword;
    user.hasPasswordSet = true;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile name
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    user.name = trimmedName;
    await user.save();

    res.json({ success: true, message: 'Name updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleSignin,
  changePassword,
  getMe,
  updateProfile
};
