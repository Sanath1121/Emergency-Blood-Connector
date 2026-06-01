import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuFileText, LuX, LuMapPin } from 'react-icons/lu';

const ManageRequests = () => {
  const { t } = useTranslation();
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
    if (!window.confirm(t('admin.cancelRequestConfirm', 'Are you sure you want to cancel this request?'))) return;
    try {
      const res = await api.put(`/requests/${requestId}/cancel`);
      if (res.data.success) {
        addToast(t('admin.cancelled', '🛑 Request Cancelled'), t('admin.cancelSuccess', 'The blood request was cancelled successfully.'), 'general');
        fetchRequests();
      }
    } catch (error) {
      addToast(t('common.errorRetry'), error.response?.data?.message || t('admin.cancelFailed', 'Failed to cancel'), 'sos_alert');
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
                <LuFileText /> {t('admin.manageRequestsTitle')}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.manageRequestsSubtitle')}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                {t('admin.loadingRequests')}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                {t('admin.noRequestsFound')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4">{t('admin.tablePatient')}</th>
                      <th className="p-4">{t('admin.tableBloodRequired')}</th>
                      <th className="p-4">{t('admin.tableUrgency')}</th>
                      <th className="p-4">{t('admin.tableLocation')}</th>
                      <th className="p-4">{t('admin.tableStatus')}</th>
                      <th className="p-4 text-right">{t('admin.tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-bold text-secondary">
                          {r.patientName}
                          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                            {t('admin.postedBy')}: {r.postedBy?.name || 'N/A'} ({r.postedBy?.email})
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-extrabold text-primary text-sm">
                          {r.bloodType}
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">
                            {t('admin.units')}: {r.unitsRequired}
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
                              <LuX /> {t('admin.cancel')}
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
