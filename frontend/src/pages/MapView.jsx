import React, { useContext, useEffect, useState } from 'react';
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
  const [donors, setDonors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bloodFilter, setBloodFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available verified active donors
      // We pass bloodType filter directly if selected
      const donorRes = await api.get(`/donors?bloodType=${bloodFilter}`);
      if (donorRes.data.success) {
        // Map slight random coordinates around their city so they don't stack
        const mappedDonors = donorRes.data.data.map((d) => {
          const cleanCity = d.city.toLowerCase().trim();
          const baseCoords = cityCoordinates[cleanCity] || cityCoordinates.default;
          // Apply slight random offset (0.015 degree max ~ 1.5km)
          const latOffset = (Math.random() - 0.5) * 0.03;
          const lngOffset = (Math.random() - 0.5) * 0.03;
          return {
            ...d,
            coordinates: [baseCoords[0] + latOffset, baseCoords[1] + lngOffset]
          };
        });
        setDonors(mappedDonors);
      }

      // 2. Fetch blood banks
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
                <LuMap className="text-primary animate-pulse" /> Live Emergency Blood Map
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Pin distribution mapping. Verified donors coordinates are masked anonymously.
              </p>
            </div>

            {/* Blood type compatibility filter */}
            <div className="flex items-center gap-2 bg-white border border-border px-3 py-1.5 rounded-xl shadow-sm self-start sm:self-center">
              <LuFilter className="text-gray-400 text-xs" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Group:</span>
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-secondary outline-none cursor-pointer"
              >
                <option value="">All Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              Loading geospatial mapping indices...
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm overflow-hidden relative">
              {/* Map Legend Floating Banner */}
              <div className="absolute top-6 right-6 z-10 bg-white/95 backdrop-blur-sm border border-border p-3 rounded-xl shadow-lg flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 bg-red-500 rounded border border-red-400 inline-block shadow-sm"></span>
                  <span>🔴 Anonymous Donor Pin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 bg-blue-500 rounded border border-blue-400 inline-block shadow-sm"></span>
                  <span>🔵 Blood Bank Pin</span>
                </div>
              </div>

              {/* Leaflet MapContainer */}
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
                      <div className="p-1 flex flex-col text-xs font-semibold gap-1 min-w-32">
                        <h4 className="font-extrabold text-primary text-sm uppercase">Verified Donor 🩸</h4>
                        <span className="text-secondary mt-1">Group: <strong className="font-bold">{donor.bloodType}</strong></span>
                        <span className="text-gray-500">Jurisdiction: <strong className="capitalize">{donor.city}</strong></span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">DRS: {donor.drsScore} (Badge: gold)</span>
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
                        <div className="p-2 flex flex-col text-xs font-semibold gap-1.5 min-w-56">
                          <h4 className="font-extrabold text-secondary text-sm border-b border-border pb-1">{bank.name}</h4>
                          <span className="text-gray-500">📍 {bank.address}, {bank.city}</span>
                          {bank.phone && <span className="text-gray-500">📞 {bank.phone}</span>}
                          
                          <div className="border-t border-border pt-1.5 mt-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Stock Availability</span>
                            <div className="grid grid-cols-4 gap-1">
                              {Object.entries(bank.availability).map(([type, units]) => (
                                <span
                                  key={type}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-center ${
                                    units > 0 ? 'bg-green-50 text-success' : 'bg-red-50 text-primary'
                                  }`}
                                >
                                  {type}: {units}u
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
          )}
        </main>
      </div>
    </div>
  );
};

export default MapView;
