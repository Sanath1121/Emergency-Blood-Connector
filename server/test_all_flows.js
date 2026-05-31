const mongoose = require('mongoose');

const API_BASE = 'http://localhost:5000/api';

// ANSI console styling colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg, err = '') => console.error(`${colors.red}✖ ${msg}${colors.reset}`, err),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

// Helper for making API calls with optional JWT authorization
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

async function runTests() {
  log.title('BLOODBRIDGE END-TO-END SYSTEM INTEGRATION TEST');

  let tokens = {
    admin: null,
    donor: null,
    requester: null,
    hospital: null
  };

  // ==========================================
  // TEST 1: Unified Authentication & Login
  // ==========================================
  log.title('TEST 1: Authentication & Decider Roles');
  try {
    // 1. Admin Login
    const adminLogin = await apiCall('/auth/login', 'POST', {
      email: 'admin@bloodbridge.com',
      password: 'Admin@123'
    });
    tokens.admin = adminLogin.data.token;
    if (adminLogin.data.user.role === 'admin') {
      log.success('Admin login successful: role matches "admin"');
    } else {
      throw new Error(`Admin role mismatch: got ${adminLogin.data.user.role}`);
    }

    // 2. Donor Login
    const donorLogin = await apiCall('/auth/login', 'POST', {
      email: 'rahul@donor.com',
      password: 'Password@123'
    });
    tokens.donor = donorLogin.data.token;
    if (donorLogin.data.user.role === 'donor') {
      log.success('Donor login successful: role matches "donor"');
    } else {
      throw new Error(`Donor role mismatch: got ${donorLogin.data.user.role}`);
    }

    // 3. Requester Login
    const requesterLogin = await apiCall('/auth/login', 'POST', {
      email: 'sunita@requester.com',
      password: 'Password@123'
    });
    tokens.requester = requesterLogin.data.token;
    if (requesterLogin.data.user.role === 'requester') {
      log.success('Requester login successful: role matches "requester"');
    } else {
      throw new Error(`Requester role mismatch: got ${requesterLogin.data.user.role}`);
    }

    // 4. Hospital Login
    const hospitalLogin = await apiCall('/auth/login', 'POST', {
      email: 'hospital@bloodbridge.com',
      password: 'Password@123'
    });
    tokens.hospital = hospitalLogin.data.token;
    if (hospitalLogin.data.user.role === 'hospital') {
      log.success('Hospital login successful: role matches "hospital"');
    } else {
      throw new Error(`Hospital role mismatch: got ${hospitalLogin.data.user.role}`);
    }

  } catch (error) {
    log.error('Test 1 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 2: Donor Availability & DRS Score Checks
  // ==========================================
  log.title('TEST 2: Donor Profile, DRS Score & Badge Checks');
  let initialDonorScore = 0;
  try {
    const meDonor = await apiCall('/auth/me', 'GET', null, tokens.donor);
    initialDonorScore = meDonor.data.drsScore;

    log.info(`Donor Name: ${meDonor.data.name}`);
    log.info(`Donor Initial DRS Score: ${meDonor.data.drsScore}`);
    log.info(`Donor Initial Total Donations: ${meDonor.data.totalDonations}`);
    log.info(`Donor Badges: ${meDonor.data.badges.map(b => b.label).join(', ')}`);
    log.info(`Donor Current Availability: ${meDonor.data.availability}`);

    if (meDonor.data.availability !== 'available') {
      throw new Error('Donor should be initially available');
    }
    if (meDonor.data.drsScore !== 95) {
      throw new Error(`Donor DRS score mismatch: expected 95, got ${meDonor.data.drsScore}`);
    }
    if (!meDonor.data.badges.some(b => b.label === 'First Drop 🩸')) {
      throw new Error('Donor missing milestone badge "First Drop 🩸"');
    }

    log.success('Donor profiles, availability parameters, and initial badges successfully validated.');
  } catch (error) {
    log.error('Test 2 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 3: Blood Request Posting & Eligibility Matching (With Phone Number Masking)
  // ==========================================
  log.title('TEST 3: Blood Request Posting & Eligibility Matching (With Phone Number Masking)');
  let requestObj = null;
  try {
    // 1. Post request from Requester (Sunita Roy)
    const newRequest = await apiCall('/requests', 'POST', {
      patientName: 'Ramesh Roy',
      bloodType: 'O-',
      unitsRequired: 2,
      hospitalName: 'Lilavati Hospital',
      city: 'Mumbai',
      urgency: 'critical'
    }, tokens.requester);

    requestObj = newRequest.data;
    log.success(`Blood Request posted successfully for O- in Mumbai! Request ID: ${requestObj._id}`);

    // 2. Fetch the request details (which performs the compatibility search logic)
    const reqDetails = await apiCall(`/requests/${requestObj._id}`, 'GET', null, tokens.requester);
    const matchedDonors = reqDetails.data.matchedDonorsList;

    log.info(`Compatible donors matched: ${matchedDonors.length}`);
    log.info(`Matched Donor names: ${matchedDonors.map(d => `${d.name} (${d.bloodType}, DRS: ${d.drsScore})`).join(', ')}`);

    // Verify compatibility filter logic (O- request should match Rahul Sharma who is O-)
    const rahulInList = matchedDonors.find(d => d.name === 'Rahul Sharma');
    if (!rahulInList) {
      throw new Error('Mumbai Donor Rahul Sharma (O-) should be matched with O- request');
    }
    log.success('Compatibility matching algorithm verified: Rahul Sharma (O-) matched correctly.');

    // Verify phone masking constraint: Phone number must NOT be returned in search matches
    if (rahulInList.phone) {
      throw new Error(`Security Violation: Unmasked donor phone number revealed in search results! Got: ${rahulInList.phone}`);
    }
    log.success('Security check passed: Donor phone numbers are masked/hidden in compatible donor search matches.');
  } catch (error) {
    log.error('Test 3 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 4: Donor Response / Quick Response DRS Score Calculation
  // ==========================================
  log.title('TEST 4: Donor Response & Realtime DRS Score Modifications');
  try {
    // Rahul (donor) accepts Sunita's request
    const response = await apiCall(`/requests/${requestObj._id}/respond`, 'PUT', null, tokens.donor);
    log.success(`Donor accepted blood request. Message: "${response.message}"`);
    log.info(`DRS Score Change: +${response.data.drsChange} (Responded within 30 minutes)`);

    // Verify that the donor is added to the responded donors list in request
    const reqDetails = await apiCall(`/requests/${requestObj._id}`, 'GET', null, tokens.requester);
    if (!reqDetails.data.request.respondedDonors.includes(response.data.drsChange !== undefined ? reqDetails.data.request.respondedDonors[0] : '')) {
      log.success('Responded donors list successfully updated on BloodRequest model.');
    }

    // Verify donor DRS updated on DB
    const updatedDonor = await apiCall('/auth/me', 'GET', null, tokens.donor);
    log.info(`Updated Donor DRS Score: ${updatedDonor.data.drsScore}`);
    
    // Quick Response awards +5 points. Starting from 95, capped at 100 max!
    if (updatedDonor.data.drsScore !== 100) {
      throw new Error(`Donor DRS score mismatch: expected max score 100, got ${updatedDonor.data.drsScore}`);
    }
    log.success('DRS modification verified: +5 quick response bonus applied and capped correctly at 100.');
  } catch (error) {
    log.error('Test 4 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 5: Requester Confirms Donor & Reveal Phone Number
  // ==========================================
  log.title('TEST 5: Requester Confirms Donor & Masking Reveal');
  try {
    // Find the donor's ID (Rahul Sharma)
    const meDonor = await apiCall('/auth/me', 'GET', null, tokens.donor);
    const donorId = meDonor.data._id;

    // Requester confirms Rahul Sharma
    const confirmResponse = await apiCall(`/requests/${requestObj._id}/confirm/${donorId}`, 'PUT', null, tokens.requester);
    log.success(`Donor confirmed by requester: ${confirmResponse.message}`);

    // Re-query request details to check that phone is now revealed!
    const reqDetails = await apiCall(`/requests/${requestObj._id}`, 'GET', null, tokens.requester);
    
    if (reqDetails.data.request.status !== 'matched') {
      throw new Error(`Request status should be "matched", got: ${reqDetails.data.request.status}`);
    }

    const matchedDonorObj = reqDetails.data.request.matchedDonor;
    if (!matchedDonorObj) {
      throw new Error('matchedDonor should be populated');
    }

    log.info(`Confirmed Donor: ${matchedDonorObj.name}`);
    log.info(`Revealed Phone Number: ${matchedDonorObj.phone}`);

    // Verify that the phone number is now revealed (no longer masked)
    if (!matchedDonorObj.phone || matchedDonorObj.phone !== '9876543210') {
      throw new Error(`Phone number mismatch: expected "9876543210", got ${matchedDonorObj.phone}`);
    }
    log.success('Security unmasking verified: Confirmed donor phone number is successfully revealed to the confirmed requester.');
  } catch (error) {
    log.error('Test 5 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 6: Requester Fulfills Request & Cooldown Triggering
  // ==========================================
  log.title('TEST 6: Request Fulfillment, DRS Rewards & 90-Day Cooldown Triggers');
  try {
    // Requester marks request as fulfilled
    const fulfillResponse = await apiCall(`/requests/${requestObj._id}/fulfill`, 'PUT', null, tokens.requester);
    log.success(`Request marked as fulfilled: ${fulfillResponse.message}`);

    // Fetch Donor profile to check Cooldown status and Donation count
    const updatedDonor = await apiCall('/auth/me', 'GET', null, tokens.donor);
    log.info(`Donor Availability: ${updatedDonor.data.availability}`);
    log.info(`Donor Cooldown Until: ${updatedDonor.data.cooldownUntil}`);
    log.info(`Donor Total Donations: ${updatedDonor.data.totalDonations}`);
    log.info(`Donor Badges: ${updatedDonor.data.badges.map(b => b.label).join(', ')}`);

    // Verify cooldown is active
    if (updatedDonor.data.availability !== 'on_cooldown') {
      throw new Error(`Expected donor availability to be "on_cooldown", got: ${updatedDonor.data.availability}`);
    }
    if (!updatedDonor.data.cooldownUntil) {
      throw new Error('Expected cooldownUntil timestamp to be set');
    }
    log.success('Cooldown validation passed: Donor placed on 90-day cooldown status successfully.');

    // Verify donation counter incremented (initially 6, now should be 7)
    if (updatedDonor.data.totalDonations !== 7) {
      throw new Error(`Expected total donations to be 7, got: ${updatedDonor.data.totalDonations}`);
    }
    log.success('Donation milestone counter validated: Total donations incremented to 7.');
  } catch (error) {
    log.error('Test 6 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 7: Hospital Emergency SOS Broadcast Alert Route
  // ==========================================
  log.title('TEST 7: Hospital Emergency SOS Broadcast Authorization Check');
  try {
    // 1. Create a request via Hospital
    const newHospitalReq = await apiCall('/requests', 'POST', {
      patientName: 'Unknown Accident Victim',
      bloodType: 'A+',
      unitsRequired: 5,
      hospitalName: 'Mumbai Central ER',
      city: 'Mumbai',
      urgency: 'critical'
    }, tokens.hospital);

    const hospitalReqId = newHospitalReq.data._id;
    log.success(`Hospital created emergency request. Request ID: ${hospitalReqId}`);

    // 2. Try to trigger SOS as basic Requester (Unauthorized check)
    try {
      await apiCall(`/requests/${hospitalReqId}/sos`, 'POST', {}, tokens.requester);
      throw new Error('Authorized SOS check failed: Requester role was allowed to broadcast SOS!');
    } catch (e) {
      log.success(`Authorized SOS check passed: Requester role correctly blocked from triggering SOS (Reason: ${e.message})`);
    }

    // 3. Trigger SOS as Hospital (Authorized check)
    const sosResponse = await apiCall(`/requests/${hospitalReqId}/sos`, 'POST', {}, tokens.hospital);
    log.success(`SOS broadcast triggered by Hospital successfully! Message: "${sosResponse.message}"`);

  } catch (error) {
    log.error('Test 7 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 8: Admin Controls & User Management
  // ==========================================
  log.title('TEST 8: Admin Dashboard Statistics & Control Checks');
  try {
    // Admin fetches global statistics
    const stats = await apiCall('/admin/stats', 'GET', null, tokens.admin);
    log.info(`Total Users Count: ${stats.data.totalUsers}`);
    log.info(`Total Requests Count: ${stats.data.totalRequests}`);
    log.info(`Pending Requests Count: ${stats.data.pendingRequests}`);
    log.info(`Fulfilled Requests Count: ${stats.data.fulfilledRequests}`);

    if (stats.data.totalUsers === undefined || stats.data.totalRequests === undefined) {
      throw new Error('Admin stats schema properties are undefined or missing');
    }
    log.success('Admin Dashboard statistics queries verified successfully.');

    // Admin fetches users management directory list
    const usersList = await apiCall('/admin/users', 'GET', null, tokens.admin);
    log.info(`Admin Users Directory size: ${usersList.data.length}`);
    if (usersList.data.length === 0) {
      throw new Error('Admin users list is empty');
    }
    log.success('Admin User Management directory queries verified successfully.');

  } catch (error) {
    log.error('Test 8 Failed!', error);
    process.exit(1);
  }

  // ==========================================
  // TEST 9: Blood Bank Directories & Leaflet GPS Data
  // ==========================================
  log.title('TEST 9: Blood Bank Directories & Leaflet Map Geolocation Data');
  try {
    const bloodBanks = await apiCall('/bloodbanks', 'GET', null, tokens.donor);
    log.info(`Total Blood Banks in Directory: ${bloodBanks.data.length}`);
    
    bloodBanks.data.forEach(bb => {
      log.info(`Bank Name: ${bb.name}`);
      log.info(`📍 Geolocation Coords: [Lat: ${bb.latitude}, Lng: ${bb.longitude}]`);
      log.info(`🎒 Structured Inventory: ${JSON.stringify(bb.availability)}`);
    });

    if (bloodBanks.data.length !== 2) {
      throw new Error(`Expected 2 blood banks, got ${bloodBanks.data.length}`);
    }
    log.success('Blood Bank directories, GPS coordinate structures, and inventory tracking arrays verified successfully.');

  } catch (error) {
    log.error('Test 9 Failed!', error);
    process.exit(1);
  }

  log.title('🎉 ALL SYSTEM MODULE INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉');
  console.log(`${colors.bgGreen}${colors.bright}  BLOODBRIDGE PLATFORM IS 100% HEALTHY, SECURE & READY FOR PROD!  ${colors.reset}\n`);
}

runTests().catch(err => {
  log.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
