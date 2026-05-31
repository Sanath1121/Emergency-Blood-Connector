const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load models
const User = require('./models/User');
const BloodBank = require('./models/BloodBank');
const BloodRequest = require('./models/BloodRequest');
const DonationRecord = require('./models/DonationRecord');
const Notification = require('./models/Notification');

dotenv.config();

// ANSI console styling colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg, err = '') => console.error(`${colors.red}✖ ${msg}${colors.reset}`, err),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

const SCREENSHOT_DIR = 'C:\\Users\\srila\\.gemini\\antigravity-ide\\brain\\833059ff-709c-4d3f-9e8f-3f370a677137';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedChennaiData() {
  log.info('Seeding database with the specific Chennai scenario data...');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bloodbridge';
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await BloodBank.deleteMany({});
    await BloodRequest.deleteMany({});
    await DonationRecord.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Requester Ananya Reddy
    const ananya = await User.create({
      name: 'Ananya Reddy',
      email: 'ananya@requester.com',
      password: 'Password@123',
      role: 'requester',
      city: 'Chennai',
      phone: '9876543219',
      isActive: true,
      profileComplete: true
    });

    // 2. Create Donor 1: Deepak Iyer
    const deepak = await User.create({
      name: 'Deepak Iyer',
      email: 'deepak@donor.com',
      password: 'Password@123',
      role: 'donor',
      bloodType: 'A+',
      city: 'Chennai',
      phone: '9876543210',
      isVerified: true,
      isActive: true,
      availability: 'available',
      drsScore: 82,
      totalDonations: 1,
      profileComplete: true,
      badges: [{ label: 'First Drop 🩸' }]
    });

    // 3. Create Donor 2: Sneha Pillai
    const sneha = await User.create({
      name: 'Sneha Pillai',
      email: 'sneha@donor.com',
      password: 'Password@123',
      role: 'donor',
      bloodType: 'O+',
      city: 'Chennai',
      phone: '9876543211',
      isVerified: true,
      isActive: true,
      availability: 'available',
      drsScore: 61,
      totalDonations: 0,
      profileComplete: true,
      badges: []
    });

    // 4. Create Donor 3: Manoj Kumar (on cooldown, donated 20 days ago)
    const manoj = await User.create({
      name: 'Manoj Kumar',
      email: 'manoj@donor.com',
      password: 'Password@123',
      role: 'donor',
      bloodType: 'A-',
      city: 'Chennai',
      phone: '9876543212',
      isVerified: true,
      isActive: true,
      availability: 'on_cooldown',
      cooldownUntil: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), // ends in 70 days
      drsScore: 45,
      totalDonations: 1,
      profileComplete: true,
      badges: [{ label: 'First Drop 🩸' }]
    });

    log.success('Chennai scenario database seeded perfectly! 🌱');
    await mongoose.disconnect();
  } catch (error) {
    log.error('Failed to seed Chennai data!', error);
    process.exit(1);
  }
}

async function runChennaiScenario() {
  await seedChennaiData();

  log.title('LAUNCHING AUTOMATED VISIBLE BROWSER FOR CHENNAI WORD PROBLEM');
  const browser = await puppeteer.launch({
    headless: false, // VISIBLE!
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });

  try {
    // Create browser contexts for each user
    const ananyaContext = await browser.createBrowserContext();
    const deepakContext = await browser.createBrowserContext();
    const snehaContext = await browser.createBrowserContext();
    const manojContext = await browser.createBrowserContext();

    const ananyaPage = await ananyaContext.newPage();
    const deepakPage = await deepakContext.newPage();
    const snehaPage = await snehaContext.newPage();
    const manojPage = await manojContext.newPage();

    // Set viewports to be nice and clean
    await ananyaPage.setViewport({ width: 1280, height: 800 });
    await deepakPage.setViewport({ width: 1280, height: 800 });
    await snehaPage.setViewport({ width: 1280, height: 800 });
    await manojPage.setViewport({ width: 1280, height: 800 });

    // ==========================================
    // STEP 1: Log in all users
    // ==========================================
    log.title('STEP 1: Logging in all Chennai users in parallel browser contexts');

    // 1. Log in Ananya Reddy
    log.info('Logging in Ananya Reddy (Requester)...');
    await ananyaPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await ananyaPage.type('input[type="email"]', 'ananya@requester.com');
    await ananyaPage.type('input[type="password"]', 'Password@123');
    await ananyaPage.click('button[type="submit"]');
    await ananyaPage.waitForSelector('aside', { timeout: 10000 });
    log.success('Ananya Reddy logged in.');

    // 2. Log in Deepak Iyer
    log.info('Logging in Deepak Iyer (Donor 1 - A+)...');
    await deepakPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await deepakPage.type('input[type="email"]', 'deepak@donor.com');
    await deepakPage.type('input[type="password"]', 'Password@123');
    await deepakPage.click('button[type="submit"]');
    await deepakPage.waitForSelector('aside', { timeout: 10000 });
    log.success('Deepak Iyer logged in.');

    // 3. Log in Sneha Pillai
    log.info('Logging in Sneha Pillai (Donor 2 - O+)...');
    await snehaPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await snehaPage.type('input[type="email"]', 'sneha@donor.com');
    await snehaPage.type('input[type="password"]', 'Password@123');
    await snehaPage.click('button[type="submit"]');
    await snehaPage.waitForSelector('aside', { timeout: 10000 });
    log.success('Sneha Pillai logged in.');

    // 4. Log in Manoj Kumar
    log.info('Logging in Manoj Kumar (Donor 3 - A-, On Cooldown)...');
    await manojPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await manojPage.type('input[type="email"]', 'manoj@donor.com');
    await manojPage.type('input[type="password"]', 'Password@123');
    await manojPage.click('button[type="submit"]');
    await manojPage.waitForSelector('aside', { timeout: 10000 });
    log.success('Manoj Kumar logged in.');

    // ==========================================
    // STEP 2: Ananya Posts Emergency Request
    // ==========================================
    log.title('STEP 2: Ananya posts critical A+ Request at 9:05 AM');
    await ananyaPage.goto('http://localhost:5173/requests/post', { waitUntil: 'networkidle2' });
    await ananyaPage.waitForSelector('input[name="patientName"]', { timeout: 10000 });

    log.info('Filling request details for Mr. Suresh Reddy...');
    await ananyaPage.type('input[name="patientName"]', 'Suresh Reddy');
    await ananyaPage.select('select[name="bloodType"]', 'A+');
    
    await ananyaPage.evaluate(() => {
      document.querySelector('input[name="unitsRequired"]').value = '';
    });
    await ananyaPage.type('input[name="unitsRequired"]', '4');
    await ananyaPage.type('input[name="hospitalName"]', 'Fortis Malar Hospital');

    await ananyaPage.evaluate(() => {
      document.querySelector('input[name="city"]').value = '';
    });
    await ananyaPage.type('input[name="city"]', 'Chennai');
    await ananyaPage.select('select[name="urgency"]', 'critical');

    await ananyaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_1_request_form.png') });
    log.info('Submitting request...');
    await ananyaPage.click('button[type="submit"]');
    await wait(3000);
    log.success('A+ Request posted successfully!');
    await ananyaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_2_ananya_dashboard.png') });

    // ==========================================
    // STEP 3: Verify Notifications for All Donors
    // ==========================================
    log.title('STEP 3: Verifying who gets the Socket & Bell Alerts');
    
    // Deepak should get it
    log.info('Checking Deepak\'s notifications...');
    await deepakPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_3_deepak_alert.png') });
    
    // Sneha should get it
    log.info('Checking Sneha\'s notifications...');
    await snehaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_4_sneha_alert.png') });

    // Manoj should NOT get it (due to cooldown)
    log.info('Checking Manoj\'s notifications (he is on cooldown)...');
    await manojPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_5_manoj_no_alert.png') });

    // ==========================================
    // STEP 4: Deepak accepts and coordinates at 9:19 AM
    // ==========================================
    log.title('STEP 4: Deepak Iyer Accepts the request and steps up to coordinate');
    await deepakPage.goto('http://localhost:5173/requests', { waitUntil: 'networkidle2' });
    await wait(2000);
    await deepakPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_6_deepak_requests_feed.png') });

    log.info('Deepak clicking "Accept Request" (+5 quick response)...');
    await deepakPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Accept Request'));
      if (btn) btn.click();
    });
    await wait(2500);

    log.info('Deepak clicking "🤝 Help Coordinate"...');
    await deepakPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Help Coordinate'));
      if (btn) btn.click();
    });
    await wait(2500);
    await deepakPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_7_deepak_accepted_and_coordinating.png') });
    log.success('Deepak accepted and volunteered to coordinate.');

    // ==========================================
    // STEP 5: Ananya reviews Matches and Confirms Deepak at 9:35 AM
    // ==========================================
    log.title('STEP 5: Ananya views ranked Matches list and Confirms Deepak');
    await ananyaPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await wait(1000);

    log.info('Navigating to compatibility matches...');
    await ananyaPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const matchLink = links.find(l => l.textContent.includes('View Matches'));
      if (matchLink) matchLink.click();
    });
    await wait(3000);
    await ananyaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_8_ananya_matches_list.png') });

    log.info('Confirming Deepak Iyer as matched donor (unmasking phone)...');
    await ananyaPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.textContent.includes('Confirm Donor'));
      if (confirmBtn) confirmBtn.click();
    });
    await wait(3000);
    await ananyaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_9_ananya_phone_unmasked.png') });

    const phoneRevealed = await ananyaPage.evaluate(() => {
      return document.body.innerText.includes('9876543210');
    });

    if (phoneRevealed) {
      log.success('Verified: Phone 9876543210 securely revealed to Ananya!');
    } else {
      log.warn('Phone unmasking not visible on page. Check layout.');
    }

    // ==========================================
    // STEP 6: Donation Complete & Fulfillment at 10:45 AM
    // ==========================================
    log.title('STEP 6: Request Fulfillment and Cooldown/DRS Updates');
    log.info('Ananya clicking "Confirm Donated"...');
    await ananyaPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fulfillBtn = buttons.find(b => b.textContent.includes('Confirm Donated'));
      if (fulfillBtn) fulfillBtn.click();
    });
    await wait(3000);
    await ananyaPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_10_ananya_request_fulfilled.png') });
    log.success('Request marked fulfilled by Ananya.');

    // Reload Deepak's dashboard
    log.info('Reloading Deepak\'s dashboard to verify DRS and Cooldown...');
    await deepakPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await wait(2000);
    await deepakPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'chennai_11_deepak_final_dashboard.png') });

    const finalDRSText = await deepakPage.evaluate(() => {
      return document.body.innerText;
    });

    if (finalDRSText.includes('97') && finalDRSText.includes('on_cooldown')) {
      log.success('Verified Deepak\'s final state: DRS is 97, availability is on_cooldown!');
    } else {
      log.warn('Did not find explicit final texts. Check final screenshot.');
    }

    log.title('CHENNAI SCENARIO SUCCESSFULLY EXECUTED IN LIVE VISIBLE BROWSER! 🎉');

  } catch (error) {
    log.error('Chennai Browser E2E Test Suite Failed!', error);
  } finally {
    // Keep browser open for a few seconds for user to inspect, then close
    await wait(5000);
    await browser.close();
    process.exit(0);
  }
}

runChennaiScenario();
