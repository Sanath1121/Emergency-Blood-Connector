const API_BASE_URL = 'https://emergency-blood-connector-backend-abxa.onrender.com/api';

async function loginAdmin() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@bloodbridge.com',
        password: 'Admin@123'
      })
    });
    const json = await res.json();
    if (res.ok) {
      console.log('Admin logged in successfully!');
      return json.data.token;
    } else {
      console.error('Failed to log in as Admin:', json.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error logging in as Admin:', error.message);
    process.exit(1);
  }
}

async function verifyDonors(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Failed to fetch users:', json.message);
      return;
    }

    const donors = json.data.filter(u => u.role === 'donor');
    console.log(`Found ${donors.length} donors in the database.`);

    for (const donor of donors) {
      if (!donor.isVerified) {
        const vRes = await fetch(`${API_BASE_URL}/admin/users/${donor._id}/verify`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (vRes.ok) {
          console.log(`Verified Donor: ${donor.name} (${donor.email})`);
        } else {
          const vJson = await vRes.json();
          console.error(`Failed to verify ${donor.name}:`, vJson.message);
        }
        await new Promise(r => setTimeout(r, 500));
      } else {
        console.log(`Donor already verified: ${donor.name} (${donor.email})`);
      }
    }
  } catch (error) {
    console.error('Error verifying donors:', error.message);
  }
}

const bloodBanks = [
  {
    name: 'Mumbai Blood Trust Bank',
    city: 'Mumbai',
    address: 'Bandra West, Mumbai',
    phone: '022-26401234',
    latitude: 19.0596,
    longitude: 72.8295,
    availability: { 'A+': 15, 'A-': 5, 'B+': 20, 'B-': 3, 'AB+': 8, 'AB-': 2, 'O+': 25, 'O-': 6 }
  },
  {
    name: 'Delhi Red Cross Blood Center',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi',
    phone: '011-23351234',
    latitude: 28.6304,
    longitude: 77.2177,
    availability: { 'A+': 10, 'A-': 2, 'B+': 12, 'B-': 1, 'AB+': 5, 'AB-': 1, 'O+': 18, 'O-': 4 }
  },
  {
    name: 'Chennai Lifeline Blood Bank',
    city: 'Chennai',
    address: 'T. Nagar, Chennai',
    phone: '044-24351234',
    latitude: 13.0418,
    longitude: 80.2341,
    availability: { 'A+': 8, 'A-': 1, 'B+': 10, 'B-': 2, 'AB+': 4, 'AB-': 0, 'O+': 15, 'O-': 2 }
  }
];

async function seedBloodBanks(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/bloodbanks`);
    const json = await res.json();
    const existingBanks = json.ok || json.success ? json.data : [];

    console.log(`Found ${existingBanks.length} existing blood banks.`);

    for (const bank of bloodBanks) {
      const exists = existingBanks.some(b => b.name.toLowerCase() === bank.name.toLowerCase());
      if (!exists) {
        const cRes = await fetch(`${API_BASE_URL}/bloodbanks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bank)
        });
        if (cRes.ok) {
          console.log(`Created Blood Bank: ${bank.name}`);
        } else {
          const cJson = await cRes.json();
          console.error(`Failed to create Blood Bank ${bank.name}:`, cJson.message);
        }
        await new Promise(r => setTimeout(r, 500));
      } else {
        console.log(`Blood bank already exists: ${bank.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding blood banks:', error.message);
  }
}

async function run() {
  const token = await loginAdmin();
  await verifyDonors(token);
  await seedBloodBanks(token);
  console.log('Verification and Blood Bank seeding complete!');
}

run();
