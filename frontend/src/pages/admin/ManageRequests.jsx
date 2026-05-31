import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuFileText, LuX, LuMapPin } from 'react-icons/lu';

const ManageRequests = () => {
  const { addToast } = useContext(NotificationContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.put(`/requests/${requestId}/cancel`);
      if (res.data.success) {
        addToast('🛑 Request Cancelled', 'The blood request was cancelled successfully.', 'general');
        fetchRequests();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Failed to cancel', 'sos_alert');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuFileText /> Platform Blood Requests Logs
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Audit all posted blood queries and execute cancellation overrides.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                Loading all requests logs...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No blood requests found on the platform yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4">Patient</th>
                      <th className="p-4">Blood Required</th>
                      <th className="p-4">Urgency</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-bold text-secondary">
                          {r.patientName}
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                            Posted by: {r.postedBy?.name || 'N/A'} ({r.postedBy?.email})
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-extrabold text-primary text-sm">
                          {r.bloodType}
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">
                            Units: {r.unitsRequired}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold uppercase tracking-wider">
                          <span
                            className={
                              r.urgency === 'critical' ? 'text-primary' : 'text-secondary'
                            }
                          >
                            {r.urgency}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-medium text-gray-500">
                          <span className="flex items-center gap-1">
                            <LuMapPin className="text-gray-400" />
                            {r.hospitalName}, {r.city}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                              r.status === 'open'
                                ? 'bg-blue-100 text-blue-800'
                                : r.status === 'matched'
                                ? 'bg-orange-100 text-orange-800'
                                : r.status === 'fulfilled'
                                ? 'bg-green-100 text-success'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-right">
                          {r.status !== 'fulfilled' && r.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(r._id)}
                              className="bg-primary text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-primary-light transition-all flex items-center gap-0.5 ml-auto"
                            >
                              <LuX /> Cancel
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

export default ManageRequests;
