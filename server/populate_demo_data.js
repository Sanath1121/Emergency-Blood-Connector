const API_BASE_URL = 'https://emergency-blood-connector-backend-abxa.onrender.com/api';

const users = [
  // Admin
  {
    name: 'Super Admin',
    email: 'admin@bloodbridge.com',
    password: 'Admin@123',
    role: 'admin',
    city: 'Delhi',
    phone: '9999999999'
  },
  // Donors
  {
    name: 'Rahul Sharma',
    email: 'rahul@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'O-',
    city: 'Mumbai',
    phone: '9876543210'
  },
  {
    name: 'Amit Patel',
    email: 'amit@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'A+',
    city: 'Mumbai',
    phone: '9876543211'
  },
  {
    name: 'Priya Nair',
    email: 'priya@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'B+',
    city: 'Delhi',
    phone: '9876543212'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'AB+',
    city: 'Delhi',
    phone: '9876543213'
  },
  {
    name: 'Karthik Rao',
    email: 'karthik@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'O+',
    city: 'Bangalore',
    phone: '9876543214'
  },
  {
    name: 'Raj Patel',
    email: 'raj@donor.com',
    password: 'Password@123',
    role: 'donor',
    bloodType: 'B-',
    city: 'Chennai',
    phone: '9876543215'
  },
  // Requesters
  {
    name: 'Sunita Roy',
    email: 'sunita@requester.com',
    password: 'Password@123',
    role: 'requester',
    city: 'Mumbai',
    phone: '9123456780'
  },
  {
    name: 'Anil Gupta',
    email: 'anil@requester.com',
    password: 'Password@123',
    role: 'requester',
    city: 'Delhi',
    phone: '9123456781'
  },
  {
    name: 'Suresh Kumar',
    email: 'suresh@requester.com',
    password: 'Password@123',
    role: 'requester',
    city: 'Chennai',
    phone: '9123456782'
  },
  // Hospital
  {
    name: 'City Hospital',
    email: 'hospital@bloodbridge.com',
    password: 'Password@123',
    role: 'hospital',
    city: 'Mumbai',
    phone: '9123456783'
  }
];

async function registerUser(user) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    const json = await res.json();
    if (res.ok) {
      console.log(`Success: Registered ${user.name} (${user.role}) - ${user.email}`);
    } else {
      console.log(`Info/Warn: Failed to register ${user.name}: ${json.message}`);
    }
  } catch (error) {
    console.error(`Error registering ${user.name}:`, error.message);
  }
}

async function run() {
  console.log('Starting user registration seeding on production...');
  for (const user of users) {
    await registerUser(user);
    // Add small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('User registration seeding complete!');
}

run();
