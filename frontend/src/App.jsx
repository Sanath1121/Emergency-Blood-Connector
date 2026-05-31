import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard decider pages
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import OpenRequests from './pages/donor/OpenRequests';

import RequesterDashboard from './pages/requester/RequesterDashboard';
import PostRequest from './pages/requester/PostRequest';
import MatchedDonors from './pages/requester/MatchedDonors';

import HospitalDashboard from './pages/hospital/HospitalDashboard';


import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageRequests from './pages/admin/ManageRequests';
import ManageBloodBanks from './pages/admin/ManageBloodBanks';

// Shared Directory Pages
import BloodBankDirectory from './pages/BloodBankDirectory';
import MapView from './pages/MapView';
import AccountManagementPage from './pages/AccountManagementPage';

// Decider Component
const DashboardDecider = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  switch (user.role) {
    case 'donor':
      return <DonorDashboard />;
    case 'requester':
      return <RequesterDashboard />;
    case 'hospital':
      return <HospitalDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div className="p-8 text-center">Unauthorized Role Panel</div>;
  }
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Decider */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardDecider />
                </ProtectedRoute>
              }
            />

            {/* Donor specific */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <OpenRequests />
                </ProtectedRoute>
              }
            />

            {/* Requester / Hospital specific */}
            <Route
              path="/requests/post"
              element={
                <ProtectedRoute allowedRoles={['requester', 'hospital']}>
                  <PostRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/:id/matches"
              element={
                <ProtectedRoute allowedRoles={['requester', 'hospital', 'admin']}>
                  <MatchedDonors />
                </ProtectedRoute>
              }
            />

            {/* Shared Directory Paths */}
            <Route
              path="/bloodbanks"
              element={
                <ProtectedRoute>
                  <BloodBankDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin specific */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bloodbanks"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBloodBanks />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
