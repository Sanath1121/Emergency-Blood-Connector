import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../services/api';
import { LuSearch, LuHeart, LuPhone, LuMapPin } from 'react-icons/lu';

const BloodBankDirectory = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bloodbanks?city=${cityFilter}`);
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
  }, [cityFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuHeart className="text-primary animate-pulse" /> Blood Banks Directory Index
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Search and explore public blood stock volumes.
              </p>
            </div>

            {/* City Search Filter */}
            <div className="relative flex items-center w-full sm:w-64">
              <LuSearch className="absolute left-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city (e.g. Mumbai)"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2 text-xs font-semibold outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              Loading inventory directory index...
            </div>
          ) : banks.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted bg-white border border-border rounded-2xl shadow-sm min-h-60 flex flex-col items-center justify-center">
              <span>📋</span>
              <p className="mt-1">No blood banks indexed matching this query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banks.map((bank) => (
                <div
                  key={bank._id}
                  className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between gap-4 relative border-t-4 border-t-primary"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-extrabold text-secondary text-base">{bank.name}</h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 font-semibold mt-1">
                      <span className="flex items-center gap-1.5">
                        <LuMapPin className="text-gray-400" />
                        📍 {bank.address}, {bank.city}
                      </span>
                      {bank.phone && (
                        <span className="flex items-center gap-1.5">
                          <LuPhone className="text-gray-400" />
                          📞 {bank.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock inventory values */}
                  <div className="border-t border-border pt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Available Stock Inventories
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(bank.availability).map(([type, units]) => (
                        <div
                          key={type}
                          className={`p-2 rounded-lg border text-center flex flex-col gap-0.5 ${
                            units > 0
                              ? 'bg-green-50/20 border-green-100 text-success'
                              : 'bg-red-50/10 border-red-100 text-primary'
                          }`}
                        >
                          <span className="text-xs font-black block">{type}</span>
                          <span className="text-[10px] font-bold block">{units}u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BloodBankDirectory;
