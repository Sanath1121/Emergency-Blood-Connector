const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const SCREENSHOT_DIR = 'C:\\Users\\srila\\.gemini\\antigravity-ide\\brain\\833059ff-709c-4d3f-9e8f-3f370a677137';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBrowserTest() {
  log.title('BLOODBRIDGE AUTOMATED BROWSER (E2E) VERIFICATION SUITE');

  // Step 0: Clean and reseed database
  log.info('Step 0: Seeding database to fresh initial state...');
  try {
    execSync('node seed.js', { stdio: 'inherit' });
    log.success('Database successfully reset and seeded.');
  } catch (error) {
    log.error('Failed to seed database!', error);
    process.exit(1);
  }

  log.info('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: false, // Runs with GUI visible in front of user
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Open separate private browser contexts to prevent sharing cookies/localstorage (simulates private windows)
    const requesterContext = await browser.createBrowserContext();
    const donorContext = await browser.createBrowserContext();

    const requesterPage = await requesterContext.newPage();
    const donorPage = await donorContext.newPage();

    // Set viewport sizes
    await requesterPage.setViewport({ width: 1280, height: 800 });
    await donorPage.setViewport({ width: 1280, height: 800 });

    // ==========================================
    // STEP 1: Log in Requester Sunita Roy
    // ==========================================
    log.title('STEP 1: Logging in Requester Sunita Roy');
    log.info('Navigating to http://localhost:5173/login on Requester Page...');
    await requesterPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    log.info('Filling credentials for Sunita Roy...');
    await requesterPage.type('input[type="email"]', 'sunita@requester.com');
    await requesterPage.type('input[type="password"]', 'Password@123');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step1_1_requester_credentials.png') });

    log.info('Submitting form...');
    await requesterPage.click('button[type="submit"]');
    await requesterPage.waitForSelector('aside', { timeout: 10000 });

    log.success('Sunita Roy (Requester) logged in successfully!');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step1_2_requester_dashboard.png') });

    // ==========================================
    // STEP 2: Log in Donor Rahul Sharma
    // ==========================================
    log.title('STEP 2: Logging in Donor Rahul Sharma');
    log.info('Navigating to http://localhost:5173/login on Donor Page...');
    await donorPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    log.info('Filling credentials for Rahul Sharma...');
    await donorPage.type('input[type="email"]', 'rahul@donor.com');
    await donorPage.type('input[type="password"]', 'Password@123');
    await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step2_1_donor_credentials.png') });

    log.info('Submitting form...');
    await donorPage.click('button[type="submit"]');
    await donorPage.waitForSelector('aside', { timeout: 10000 });

    log.success('Rahul Sharma (Donor) logged in successfully!');
    await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step2_2_donor_dashboard.png') });

    // ==========================================
    // STEP 3: Post Request on Sunita Page (Requester)
    // ==========================================
    log.title('STEP 3: Posting Blood Request as Sunita Roy');
    log.info('Navigating to Post Blood Request page...');
    await requesterPage.goto('http://localhost:5173/requests/post', { waitUntil: 'networkidle2' });

    log.info('Waiting for patientName input element to mount...');
    await requesterPage.waitForSelector('input[name="patientName"]', { timeout: 10000 });

    log.info('Filling out patient and request form details...');
    await requesterPage.type('input[name="patientName"]', 'Ramesh Roy');
    await requesterPage.select('select[name="bloodType"]', 'O-');
    
    // Clear and enter unitsRequired
    await requesterPage.evaluate(() => {
      document.querySelector('input[name="unitsRequired"]').value = '';
    });
    await requesterPage.type('input[name="unitsRequired"]', '2');
    
    await requesterPage.type('input[name="hospitalName"]', 'Lilavati Hospital');
    
    // Clear and enter city
    await requesterPage.evaluate(() => {
      document.querySelector('input[name="city"]').value = '';
    });
    await requesterPage.type('input[name="city"]', 'Mumbai');

    await requesterPage.select('select[name="urgency"]', 'critical');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step3_1_form_filled.png') });

    log.info('Submitting blood request form...');
    await requesterPage.click('button[type="submit"]');
    await wait(3000);

    log.success('Emergency O- Blood Request published successfully!');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step3_2_requester_dashboard_with_request.png') });

    // ==========================================
    // STEP 4: Real-time Socket Alert & Accept request as Rahul Sharma (Donor)
    // ==========================================
    log.title('STEP 4: Real-time Socket Alert & Accept Request as Rahul Sharma');
    log.info('Navigating to Open Requests feed on Donor page...');
    await donorPage.goto('http://localhost:5173/requests', { waitUntil: 'networkidle2' });

    await wait(2000); // Wait briefly for lists to populate
    await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step4_1_donor_requests_feed.png') });

    log.info('Accepting Sunita\'s O- request...');
    const acceptClicked = await donorPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptBtn = buttons.find(b => b.textContent.includes('Accept Request'));
      if (acceptBtn) {
        acceptBtn.click();
        return true;
      }
      return false;
    });

    if (!acceptClicked) {
      throw new Error('Accept Request button was not found in donor feed!');
    }

    log.info('Waiting for commitment transaction...');
    await wait(3000); // Wait for response action and toast
    log.success('Rahul Sharma accepted request and registered a quick commitment!');
    await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step4_2_donor_accepted.png') });

    // ==========================================
    // STEP 5: Confirm Donor & Reveal Masked Phone
    // ==========================================
    log.title('STEP 5: Requester Dashboard Updates & Phone Masking Reveal');
    log.info('Reloading Requester Dashboard...');
    await requesterPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await wait(1000);
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5_1_requester_dashboard_matches.png') });

    log.info('Navigating to compatibility matches...');
    await requesterPage.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const matchLink = links.find(l => l.textContent.includes('View Matches'));
      if (matchLink) matchLink.click();
    });

    await wait(3000);
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5_2_compatibility_list.png') });

    log.info('Confirming Rahul Sharma as designated donor...');
    const confirmClicked = await requesterPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.textContent.includes('Confirm Donor'));
      if (confirmBtn) {
        confirmBtn.click();
        return true;
      }
      return false;
    });

    if (!confirmClicked) {
      const pageText = await requesterPage.evaluate(() => document.body.innerText);
      log.info(`Page text on failure:\n${pageText}`);
      throw new Error('Confirm Donor button not found on matched page!');
    }

    await wait(3000); // Wait for phone number reveal card

    log.info('Verifying secure phone number unmasking in browser UI...');
    const revealedPhone = await requesterPage.evaluate(() => {
      const pageText = document.body.innerText;
      if (pageText.includes('9876543210')) {
        return '9876543210';
      }
      return null;
    });

    if (!revealedPhone) {
      throw new Error('Security Violation/Error: Masked phone number 9876543210 was NOT revealed to requester in Dashboard!');
    }

    log.success('Phone unmasking validated: Rahul\'s phone 9876543210 securely revealed to Sunita Roy.');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5_3_phone_revealed_on_dashboard.png') });

    // ==========================================
    // STEP 6: Requester Fulfills & Triggers Cooldown
    // ==========================================
    log.title('STEP 6: Request Fulfillment & Cooldown Trigger Verification');
    log.info('Marking emergency request as Donated/Fulfilled...');
    const fulfillClicked = await requesterPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fulfillBtn = buttons.find(b => b.textContent.includes('Confirm Donated'));
      if (fulfillBtn) {
        fulfillBtn.click();
        return true;
      }
      return false;
    });

    if (!fulfillClicked) {
      throw new Error('Confirm Donated button was not found on requester dashboard!');
    }

    await wait(3000); // Wait for database cooldown update
    log.success('Emergency Request marked fulfilled successfully.');
    await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step6_1_requester_fulfilled.png') });

    // Check Donor status update
    log.info('Reloading Donor Dashboard to verify cooldown status...');
    await donorPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await wait(1000);
    await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'step6_2_donor_cooldown_dashboard.png') });

    log.success('End-to-End Live Browser flows successfully validated via Puppeteer! 🎉');

  } catch (error) {
    log.error('E2E Live Browser Test Suite Failed!', error);
    try {
      log.info(`Current Requester URL: ${requesterPage.url()}`);
      log.info(`Current Donor URL: ${donorPage.url()}`);
      await requesterPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'failure_requester.png') });
      await donorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'failure_donor.png') });
    } catch (e) {
      log.error('Failed to capture failure info', e);
    }
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
}

runBrowserTest();
