import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import api from '../services/api';
import { LuMap, LuFilter } from 'react-icons/lu';

// Resolve Leaflet Vite assets packaging issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

// Custom Icons for different pins
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bankIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Standard coordinates map
const cityCoordinates = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
  default: [20.5937, 78.9629] // Center of India
};

const MapView = () => {
  const { t } = useTranslation();
  const [donors, setDonors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bloodFilter, setBloodFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const donorRes = await api.get(`/donors?bloodType=${bloodFilter}`);
      if (donorRes.data.success) {
        const mappedDonors = donorRes.data.data.map((d) => {
          const cleanCity = d.city.toLowerCase().trim();
          const baseCoords = cityCoordinates[cleanCity] || cityCoordinates.default;
          const latOffset = (Math.random() - 0.5) * 0.03;
          const lngOffset = (Math.random() - 0.5) * 0.03;
          return {
            ...d,
            coordinates: [baseCoords[0] + latOffset, baseCoords[1] + lngOffset]
          };
        });
        setDonors(mappedDonors);
      }

      const bankRes = await api.get('/bloodbanks');
      if (bankRes.data.success) {
        setBanks(bankRes.data.data);
      }
    } catch (error) {
      console.error('Error loading map coordinates:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [bloodFilter]);

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <LuMap className="text-primary animate-pulse" /> {t('map.title')}
              </h2>
              <p className="text-xs text-muted mt-1 font-semibold">
                {t('map.subtitle')}
              </p>
            </div>

            {/* Blood type compatibility filter */}
            <div className="flex items-center gap-2.5 bg-surface/50 border border-white/5 px-4 py-2 rounded-xl shadow-md self-start sm:self-center">
              <LuFilter className="text-muted text-xs" />
              <span className="text-[10px] font-black text-muted uppercase tracking-wider">{t('map.group')}</span>
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                className="bg-transparent text-xs font-black text-white outline-none cursor-pointer"
              >
                <option value="" className="bg-surface text-white">{t('map.allGroups')}</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type} className="bg-surface text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted font-bold animate-pulse">
              {t('map.loading')}
            </div>
          ) : (
            <div className="bg-surface/40 p-4 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative backdrop-blur-md">
              {/* Map Legend Floating Banner */}
              <div className="absolute top-6 right-6 z-[999] bg-surface/90 backdrop-blur-md border border-white/5 p-3 rounded-2xl shadow-xl flex flex-col gap-2 text-[9px] font-black uppercase tracking-wider text-muted pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-red-600 rounded-full inline-block shadow-sm animate-pulse"></span>
                  <span>🔴 {t('map.anonPin')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-blue-600 rounded-full inline-block shadow-sm"></span>
                  <span>🔵 {t('map.bankPin')}</span>
                </div>
              </div>

              {/* Leaflet MapContainer */}
              <div className="relative z-10 rounded-2xl overflow-hidden">
                <MapContainer
                  center={[19.0760, 72.8777]} // Center around Mumbai initially
                  zoom={12}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Render Anonymous Donors Pins (No Names/Phones!) */}
                  {donors.map((donor) => (
                    <Marker
                      key={donor._id}
                      position={donor.coordinates}
                      icon={donorIcon}
                    >
                      <Popup>
                        <div className="p-2 flex flex-col text-[11px] font-semibold gap-1 min-w-[150px] bg-surface text-white rounded-lg">
                          <h4 className="font-black text-primary-light text-xs uppercase tracking-wider">{t('map.verifiedDonor')}</h4>
                          <span className="text-white mt-1.5">{t('map.donorGroup')}: <strong className="font-black text-white">{donor.bloodType}</strong></span>
                          <span className="text-muted mt-0.5">{t('map.jurisdiction')}: <strong className="capitalize text-white">{donor.city}</strong></span>
                          <span className="text-[9px] text-muted font-black uppercase tracking-widest mt-1.5 border-t border-white/5 pt-1.5">DRS: {donor.drsScore}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Render Blood Banks Pins */}
                  {banks.map((bank) => {
                    if (!bank.latitude || !bank.longitude) return null;
                    return (
                      <Marker
                        key={bank._id}
                        position={[bank.latitude, bank.longitude]}
                        icon={bankIcon}
                      >
                        <Popup>
                          <div className="p-2 flex flex-col text-[11px] font-semibold gap-1 min-w-[200px] bg-surface text-white rounded-lg">
                            <h4 className="font-black text-white text-xs border-b border-white/5 pb-1 uppercase tracking-wider">{bank.name}</h4>
                            <span className="text-muted mt-1">📍 {bank.address}, {bank.city}</span>
                            {bank.phone && <span className="text-muted mt-0.5">📞 {bank.phone}</span>}
                            
                            <div className="border-t border-white/5 pt-2 mt-2">
                              <span className="text-[9px] font-black text-muted uppercase tracking-widest block mb-1.5">{t('map.stockAvailability')}</span>
                              <div className="grid grid-cols-4 gap-1">
                                {Object.entries(bank.availability).map(([type, units]) => (
                                  <span
                                    key={type}
                                    className={`px-1 py-0.5 rounded text-[9px] font-black text-center border ${
                                      units > 0 
                                        ? 'bg-success/15 border-success/25 text-success' 
                                        : 'bg-primary/10 border-primary/25 text-primary-light'
                                    }`}
                                  >
                                    {type}:{units}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MapView;
