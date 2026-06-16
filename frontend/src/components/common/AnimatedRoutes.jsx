import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Context
import { AuthContext } from '../../context/AuthContext';
import ProtectedRoute from '../../routes/ProtectedRoute';

// Public Pages
import Home from '../../pages/Home';
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';

// Dashboard decider pages
import DonorDashboard from '../../pages/donor/DonorDashboard';
import DonorProfile from '../../pages/donor/DonorProfile';
import OpenRequests from '../../pages/donor/OpenRequests';

import RequesterDashboard from '../../pages/requester/RequesterDashboard';
import PostRequest from '../../pages/requester/PostRequest';
import MatchedDonors from '../../pages/requester/MatchedDonors';

import HospitalDashboard from '../../pages/hospital/HospitalDashboard';

import AdminDashboard from '../../pages/admin/AdminDashboard';
import ManageUsers from '../../pages/admin/ManageUsers';
import ManageRequests from '../../pages/admin/ManageRequests';
import ManageBloodBanks from '../../pages/admin/ManageBloodBanks';

// Shared Directory Pages
import BloodBankDirectory from '../../pages/BloodBankDirectory';
import MapView from '../../pages/MapView';
import AccountManagementPage from '../../pages/AccountManagementPage';

// Page Transition Wrapper Component
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        {/* Dashboard Decider */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper><DashboardDecider /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Donor specific */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <PageWrapper><DonorProfile /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <PageWrapper><OpenRequests /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Requester / Hospital specific */}
        <Route
          path="/requests/post"
          element={
            <ProtectedRoute allowedRoles={['requester', 'hospital']}>
              <PageWrapper><PostRequest /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id/matches"
          element={
            <ProtectedRoute allowedRoles={['requester', 'hospital', 'admin']}>
              <PageWrapper><MatchedDonors /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Shared Directory Paths */}
        <Route
          path="/bloodbanks"
          element={
            <ProtectedRoute>
              <PageWrapper><BloodBankDirectory /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <PageWrapper><MapView /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <PageWrapper><AccountManagementPage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Admin specific */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageWrapper><ManageUsers /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageWrapper><ManageRequests /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bloodbanks"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageWrapper><ManageBloodBanks /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
