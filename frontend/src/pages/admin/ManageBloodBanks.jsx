import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import { LuDatabase, LuPlus, LuTrash, LuSave, LuX } from 'react-icons/lu';

const ManageBloodBanks = () => {
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
          addToast('✅ Success', 'Blood bank updated successfully!', 'general');
        }
      } else {
        const res = await api.post('/bloodbanks', formData);
        if (res.data.success) {
          addToast('✅ Success', 'Blood bank created successfully!', 'general');
        }
      }
      handleReset();
      fetchBanks();
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Action failed', 'sos_alert');
    }
  };

  const handleDelete = async (bankId) => {
    if (!window.confirm('Are you sure you want to remove this blood bank?')) return;
    try {
      const res = await api.delete(`/bloodbanks/${bankId}`);
      if (res.data.success) {
        addToast('🗑️ Removed', 'Blood bank removed successfully!', 'general');
        fetchBanks();
      }
    } catch (error) {
      addToast('❌ Action Failed', error.response?.data?.message || 'Deletion failed', 'sos_alert');
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
                <LuDatabase /> Manage Blood Banks Directory
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Add locations, update stock numbers, and manage coordinates.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <LuPlus /> Add Blood Bank
              </button>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 max-w-2xl"
            >
              <h3 className="font-extrabold text-secondary text-sm">
                {editingId ? 'Edit Blood Bank Registry' : 'Register New Blood Bank'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Bank Name</label>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Latitude</label>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Longitude</label>
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
                  Inventory Stock (Units)
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
                  <LuX /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-light flex items-center gap-1 shadow-md"
                >
                  <LuSave /> Save Registry
                </button>
              </div>
            </form>
          )}

          {/* Blood Banks List */}
          <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col min-h-60 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                Loading database directory...
              </div>
            ) : banks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No blood banks listed yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 font-bold text-gray-400 uppercase tracking-widest text-[9px]">
                      <th className="p-4">Name</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">GPS Coordinates</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => (
                      <tr key={bank._id} className="border-b border-border hover:bg-gray-50">
                        <td className="p-4 whitespace-nowrap font-bold text-secondary">
                          {bank.name}
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase mt-0.5">
                            City: {bank.city}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-semibold">
                          {bank.address || 'N/A'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 font-semibold">
                          {bank.phone || 'N/A'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-400 font-semibold text-[10px]">
                          Lat: <strong className="text-secondary">{bank.latitude || 'N/A'}</strong> • Lon: <strong className="text-secondary">{bank.longitude || 'N/A'}</strong>
                        </td>
                        <td className="p-4 whitespace-nowrap text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(bank)}
                            className="bg-secondary text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-secondary/90 transition-all flex items-center gap-0.5"
                          >
                            <LuSave /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(bank._id)}
                            className="bg-primary text-white px-2 py-1 text-[10px] font-extrabold uppercase rounded shadow-sm hover:bg-primary-light transition-all flex items-center gap-0.5"
                          >
                            <LuTrash /> Delete
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
