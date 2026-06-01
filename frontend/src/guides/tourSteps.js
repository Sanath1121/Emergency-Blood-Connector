// Role-specific guided tour steps for BloodBridge
// Used with driver.js to highlight key UI elements on first login.

export const tourSteps = {

  donor: [
    {
      element: '#guide-welcome',
      popover: {
        title: '🩸 Welcome to BloodBridge!',
        description: "You're registered as a <strong>Blood Donor</strong>. This quick tour will show you everything you need to get started. Click <strong>Next</strong> to continue.",
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#guide-drs',
      popover: {
        title: '🏆 Your Donor Reliability Score',
        description: "This is your <strong>DRS Score</strong> — it reflects how reliable you are as a donor. It starts at 50. Accepting requests quickly, showing up, and completing donations increases it. No-shows decrease it.",
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#guide-stats',
      popover: {
        title: '📊 Your Activity',
        description: "Track your <strong>total donations</strong>, <strong>availability status</strong>, and your earned <strong>milestone badges</strong> here at a glance.",
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-requests',
      popover: {
        title: '🚨 Open Requests',
        description: "Click <strong>Requests</strong> in the sidebar to see compatible emergency blood requests in your city. You can accept requests and optionally help coordinate them.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-profile',
      popover: {
        title: '👤 Your Profile',
        description: "Keep your <strong>Profile</strong> updated — your city, phone, and availability. Requesters use this to contact you after you're confirmed.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-bloodbanks',
      popover: {
        title: '🏦 Blood Banks',
        description: "View <strong>Blood Bank</strong> inventory near you. Useful when a patient needs stored blood instead of a live donor.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-notification-bell',
      popover: {
        title: '🔔 Real-Time Alerts',
        description: "This bell lights up the moment a <strong>compatible blood request</strong> is posted in your city. You'll get a live notification instantly — no refresh needed.",
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#guide-tour-button',
      popover: {
        title: '🔁 Replay This Tour Anytime',
        description: "You can always restart this guide by clicking <strong>Take a Tour</strong> here in the sidebar. That's it — you're ready to save lives! 🩸",
        side: 'top',
        align: 'start'
      }
    }
  ],

  requester: [
    {
      element: '#guide-welcome',
      popover: {
        title: '🙋 Welcome to BloodBridge!',
        description: "You're registered as a <strong>Patient / Requester</strong>. This tour will walk you through how to find blood donors quickly in an emergency.",
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-post',
      popover: {
        title: '📋 Post a Blood Request',
        description: "In an emergency, click <strong>Post Request</strong> to submit your patient's blood type, hospital name, and urgency level. Compatible donors in your city will be notified instantly.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-active-requests',
      popover: {
        title: '📌 Track Your Requests',
        description: "Your active blood requests appear here with their current <strong>status</strong> — Open, Matched, Fulfilled, or Cancelled.",
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#guide-notification-bell',
      popover: {
        title: '🔔 Donor Alerts',
        description: "When a donor accepts your request, you'll get a <strong>real-time notification</strong> here. You can then view matched donors and confirm one.",
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#guide-nav-bloodbanks',
      popover: {
        title: '🏦 Blood Banks',
        description: "If no live donor is available, check the <strong>Blood Bank Directory</strong> to find stored blood near your hospital.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-tour-button',
      popover: {
        title: '🔁 Replay This Tour Anytime',
        description: "Click <strong>Take a Tour</strong> here anytime to revisit this guide. You're all set — post your first request when ready!",
        side: 'top',
        align: 'start'
      }
    }
  ],

  hospital: [
    {
      element: '#guide-welcome',
      popover: {
        title: '🏥 Welcome to BloodBridge!',
        description: "You're registered as a <strong>Hospital Coordinator</strong>. You can post blood requests, manage them, and trigger city-wide SOS alerts in critical emergencies.",
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-post',
      popover: {
        title: '📋 Post a Blood Request',
        description: "Use <strong>Post Request</strong> to submit an urgent blood need. Donors in your city matching the blood type will be notified immediately.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-sos',
      popover: {
        title: '🚨 SOS Alert',
        description: "In a <strong>critical emergency</strong>, use the SOS button to broadcast an alert to <strong>all eligible donors</strong> in your city simultaneously — not just compatible ones.",
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#guide-notification-bell',
      popover: {
        title: '🔔 Live Notifications',
        description: "Donor responses, confirmations, and fulfillment updates will appear here in <strong>real time</strong>.",
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#guide-tour-button',
      popover: {
        title: '🔁 Replay This Tour Anytime',
        description: "You can restart this guide anytime by clicking <strong>Take a Tour</strong>. You're ready to coordinate blood requests!",
        side: 'top',
        align: 'start'
      }
    }
  ],

  admin: [
    {
      element: '#guide-welcome',
      popover: {
        title: '🔴 Welcome, Admin!',
        description: "You have <strong>full platform oversight</strong>. This tour covers your key responsibilities — managing users, requests, and blood bank data.",
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#guide-stats',
      popover: {
        title: '📊 Platform Stats',
        description: "Monitor <strong>total users, donations, active requests</strong>, and top cities from these summary cards.",
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-users',
      popover: {
        title: '👥 Manage Users',
        description: "Use <strong>Manage Users</strong> to <strong>verify donor accounts</strong> (required before they appear in donor search results) and suspend or reactivate any user.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-admin-requests',
      popover: {
        title: '📋 All Requests',
        description: "View and manage <strong>every blood request</strong> across the platform — fulfill, cancel, or mark no-shows from here.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-nav-admin-banks',
      popover: {
        title: '🏦 Manage Blood Banks',
        description: "Add, edit, or remove <strong>blood bank listings</strong> and update their per-blood-type inventory levels.",
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#guide-notification-bell',
      popover: {
        title: '🔔 Platform Alerts',
        description: "Critical events like SOS alerts and fulfillments are broadcast here in <strong>real time</strong>.",
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#guide-tour-button',
      popover: {
        title: '🔁 Replay This Tour Anytime',
        description: "Click <strong>Take a Tour</strong> anytime to revisit this guide. You're ready to manage BloodBridge!",
        side: 'top',
        align: 'start'
      }
    }
  ]
};
