import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuUsers, LuCheck, LuSlash } from 'react-icons/lu';

const ManageUsers = () => {
  const { addToast } = useContext(NotificationContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users?role=${roleFilter}&city=${cityFilter}&search=${searchQuery}`
      );
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, cityFilter, searchQuery]);

  const handleVerify = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/verify`);
      if (res.data.success) {
        addToast('✅ Donor Verified', 'The donor account has been verified successfully.', 'general');
        fetchUsers();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Verification failed', 'sos_alert');
    }
  };

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      if (res.data.success) {
        addToast(
          '⚙️ Status Updated',
          'Account status has been successfully updated.',
          'general'
        );
        fetchUsers();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Suspension failed', 'sos_alert');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuUsers /> Manage Platform Users
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Audit accounts, toggle suspension filters, and verify blood donor credentials.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-gray-50 border border-border px-3 py-2 text-xs font-semibold rounded-xl outline-none"
              >
                <option value="">All Roles</option>
                <option value="donor">Donors</option>
                <option value="requester">Requesters</option>
                <option value="hospital">Hospitals</option>
              </select>

              {/* City filter */}
              <input
                type="text"
                placeholder="Filter by city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-gray-50 border border-border px-3 py-2 text-xs font-semibold rounded-xl outline-none"
              />
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name / email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-gray-50 border border-border px-3 py-2 text-xs font-semibold rounded-xl outline-none"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                Loading users directory...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No users found matching query
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Details</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-bold text-secondary">
                          {u.name}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-semibold">
                          {u.email}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 border border-red-100 bg-red-50 text-primary text-[9px] font-extrabold rounded uppercase tracking-wider">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-400 font-semibold text-[10px]">
                          City: <strong className="text-secondary capitalize">{u.city}</strong>
                          {u.role === 'donor' && (
                            <>
                              <span className="mx-1">•</span>
                              Group: <strong className="text-secondary">{u.bloodType}</strong>
                              <span className="mx-1">•</span>
                              DRS: <strong className="text-primary">{u.drsScore}</strong>
                            </>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                              u.isActive ? 'bg-green-100 text-success' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-right flex justify-end gap-2">
                          {u.role === 'donor' && !u.isVerified && (
                            <button
                              onClick={() => handleVerify(u._id)}
                              className="bg-success text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-success/90 transition-all flex items-center gap-0.5"
                            >
                              <LuCheck /> Verify
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleSuspend(u._id)}
                              className={`px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm transition-all flex items-center gap-0.5 ${
                                u.isActive
                                  ? 'bg-primary text-white hover:bg-primary-light'
                                  : 'bg-secondary text-white hover:bg-secondary/90'
                              }`}
                            >
                              <LuSlash />
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;
