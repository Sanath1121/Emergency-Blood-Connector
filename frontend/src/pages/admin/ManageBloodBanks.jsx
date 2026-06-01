import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuDatabase, LuPlus, LuTrash, LuSave, LuX } from 'react-icons/lu';

const ManageBloodBanks = () => {
  const { t } = useTranslation();
  const { addToast } = useContext(NotificationContext);

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',
    availability: {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    }
  });

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bloodbanks');
      if (res.data.success) {
        setBanks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStockChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [type]: parseInt(value) || 0
      }
    }));
  };

  const handleEdit = (bank) => {
    setEditingId(bank._id);
    setFormData({
      name: bank.name,
      city: bank.city,
      address: bank.address || '',
      phone: bank.phone || '',
      latitude: bank.latitude || '',
      longitude: bank.longitude || '',
      availability: { ...bank.availability }
    });
    setShowForm(true);
  };

  const handleReset = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      city: '',
      address: '',
      phone: '',
      latitude: '',
      longitude: '',
      availability: {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/bloodbanks/${editingId}`, formData);
        if (res.data.success) {
          addToast(t('admin.bloodBankUpdated'), t('admin.bloodBankUpdated'), 'general');
        }
      } else {
        const res = await api.post('/bloodbanks', formData);
        if (res.data.success) {
          addToast(t('admin.bloodBankCreated'), t('admin.bloodBankCreated'), 'general');
        }
      }
      handleReset();
      fetchBanks();
    } catch (error) {
      addToast(t('common.errorRetry'), error.response?.data?.message || t('common.errorRetry'), 'sos_alert');
    }
  };

  const handleDelete = async (bankId) => {
    if (!window.confirm(t('admin.cancelRequestConfirm', 'Are you sure you want to remove this blood bank?'))) return;
    try {
      const res = await api.delete(`/bloodbanks/${bankId}`);
      if (res.data.success) {
        addToast(t('admin.bloodBankRemoved'), t('admin.bloodBankRemoved'), 'general');
        fetchBanks();
      }
    } catch (error) {
      addToast(t('common.errorRetry'), error.response?.data?.message || t('admin.deleteFailed', 'Deletion failed'), 'sos_alert');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuDatabase /> {t('admin.manageBanksTitle')}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.manageBanksSubtitle')}
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <LuPlus /> {t('admin.addBank')}
              </button>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 max-w-2xl"
            >
              <h3 className="font-extrabold text-secondary text-sm">
                {editingId ? t('admin.editBank') : t('admin.registerBank')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.bankName')}</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('common.city')}</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.tableLocation', 'Address')}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.tableContact')}</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.latitude')}</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">{t('admin.longitude')}</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Stock quantities inputs */}
              <div className="border-t border-border pt-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                  {t('admin.inventoryStock')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.keys(formData.availability).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-secondary w-8 text-right">
                        {type}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.availability[type]}
                        onChange={(e) => handleStockChange(type, e.target.value)}
                        className="bg-gray-50 border border-border rounded-lg p-1.5 text-xs font-semibold w-16 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-1"
                >
                  <LuX /> {t('admin.cancelForm')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-light flex items-center gap-1 shadow-md"
                >
                  <LuSave /> {t('admin.saveRegistry')}
                </button>
              </div>
            </form>
          )}

          {/* Blood Banks List */}
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col min-h-60 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                {t('admin.loadingBanks')}
              </div>
            ) : banks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                {t('admin.noBanks')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4">{t('admin.tableName')}</th>
                      <th className="p-4">{t('admin.tableLocation')}</th>
                      <th className="p-4">{t('admin.tableContact')}</th>
                      <th className="p-4">{t('admin.tableGPS')}</th>
                      <th className="p-4 text-right">{t('admin.tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => (
                      <tr key={bank._id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-bold text-secondary">
                          {bank.name}
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase mt-0.5">
                            {t('common.city')}: {bank.city}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-semibold">
                          {bank.address || 'N/A'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-semibold">
                          {bank.phone || 'N/A'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-400 font-semibold text-[10px]">
                          {t('admin.latitude')}: <strong className="text-secondary">{bank.latitude || 'N/A'}</strong> • {t('admin.longitude')}: <strong className="text-secondary">{bank.longitude || 'N/A'}</strong>
                        </td>
                        <td className="p-4 whitespace-nowrap text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(bank)}
                            className="bg-secondary text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-secondary/90 transition-all flex items-center gap-0.5"
                          >
                            <LuSave /> {t('admin.editBank')}
                          </button>
                          <button
                            onClick={() => handleDelete(bank._id)}
                            className="bg-primary text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-primary-light transition-all flex items-center gap-0.5"
                          >
                            <LuTrash /> {t('admin.remove')}
                          </button>
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

export default ManageBloodBanks;
