import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, DoorOpen, DoorClosed, Timer, Package, MapPin
} from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor:[12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// API Constants
const DASHBOARD_API = 'http://127.0.0.1:8000/api/dashboard';
const INVENTORY_API = 'http://127.0.0.1:8000/api/inventories';

const DashboardHAI = () => {
  const [data, setData] = useState(null);
  const [HAIInventoryCount, setHAIInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Ambil data utama dashboard
      const responseDash = await axios.get(DASHBOARD_API);
      setData(responseDash.data.data);

      // 2. Ambil data KHUSUS inventory HAI untuk dihitung jumlah barangnya
      const responseInv = await axios.get(INVENTORY_API, {
        params: { unit: 'HAI' } 
      });
      setHAIInventoryCount(responseInv.data.data.length);

      setLoading(false);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh tiap 1 menit
    return () => clearInterval(interval);
  },[]);

  if (loading) return <div className="h-full flex items-center justify-center font-bold animate-pulse text-[#56a8c7] tracking-widest uppercase">Memuat Dashboard HAI...</div>;

  // --- LOGIKA MENGAMBIL DATA KHUSUS HAI ---
  const HAIStats = data?.unitStats?.HAI || { open_percent: 0, close_percent: 0, open_count: 0, close_count: 0 };
  
  // Total kegiatan HAI adalah jumlah dari Open + Close milik HAI
  const totalKegiatanHAI = (HAIStats.open_count || 0) + (HAIStats.close_count || 0);
  // Progres diasumsikan sejajar dengan persentase kegiatan yang sudah 'Close'
  const progressHAI = HAIStats.close_percent || 0;

  return (
    <div className="h-full flex flex-col gap-6 select-none relative overflow-hidden pb-4">

      {/* --- 1. BARIS ATAS: 4 KOTAK STATISTIK (KHUSUS HAI) --- */}
      <div className="flex gap-6 shrink-0 h-24">
        <StatCard title="Total Kegiatan" value={totalKegiatanHAI} icon={LayoutDashboard} color="bg-white" iconColor="text-black" />
        <StatCard title="Open" value={`${HAIStats.open_count}`} icon={DoorOpen} color="bg-green-500" iconColor="text-white" />
        <StatCard title="Close" value={`${HAIStats.close_count}`} icon={DoorClosed} color="bg-red-500" iconColor="text-white" />
        <StatCard title="Progres" value={`${progressHAI}%`} icon={Timer} color="bg-orange-400" iconColor="text-white" />
      </div>

      {/* --- 2. GRID UTAMA (KIRI & KANAN) --- */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* KIRI: DONUT CHART & INVENTORY (Span 5) */}
        <div className="col-span-5 flex flex-col gap-6 h-full">
          
          <DonutBox 
            title="Progres Kegiatan HAI" 
            stats={HAIStats} 
          />

          {/* KOTAK INVENTORY */}
          <div 
            onClick={() => window.location.href = '/inventory'} 
            className="bg-white border border-black rounded-[20px] p-6 h-[35%] flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[#1a536e]">
              <Package size={20} />
              <div className="text-base font-bold uppercase">Inventory</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-5xl font-black mb-2 text-black">{HAIInventoryCount}</div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Jenis Barang</div>
            </div>
          </div>
        </div>

        {/* KANAN: MAP LOKASI SITAC (Span 7) */}
        <div className="col-span-7 bg-white border border-black rounded-[20px] p-6 flex flex-col shadow-sm h-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin size={24} className="text-black" fill="black" stroke="white" />
            <div className="text-sm font-black uppercase tracking-[0.2em]">Lokasi SITAC</div>
          </div>
          
          <div className="flex-1 rounded-2xl overflow-hidden border border-black/10">
              <MapContainer center={[-7.566, 110.831]} zoom={12} style={{ height: '100%', width: '100%' }} key={expanded ? 'expanded-map' : 'mini-map'}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Map SITAC */}
                  {(expanded === 'lokasi-sitac' ? data?.markers?.sitac : (data?.markers?.sitac ||[])).map(m => (
                    m.latitude && (
                      <Marker key={m.id} position={[m.latitude, m.longitude]}>
                        <Popup>
                          <span className="font-bold text-xs">{m.nama_vendor}</span><br/>
                          <span className="text-[10px]">{m.lokasi}</span>
                        </Popup>
                      </Marker>
                    )
                  ))}
              </MapContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- KOMPONEN KOTAK STATISTIK ---
const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
  <div className="bg-white border border-black rounded-[20px] p-4 flex items-center justify-center gap-4 shadow-sm flex-1 hover:-translate-y-1 transition-transform">
    <div className={`w-12 h-12 ${color} rounded-xl border border-black flex items-center justify-center shrink-0 shadow-inner`}>
      <Icon size={24} className={iconColor} />
    </div>
    <div className="flex flex-col">
      <div className="text-[10px] font-bold uppercase text-gray-800 tracking-wider mb-0.5">{title}</div>
      <div className="text-2xl font-black leading-none">{value}</div>
    </div>
  </div>
);

// --- KOMPONEN DONUT CHART ---
const DonutBox = ({ title, stats }) => {
  // Logic untuk diagram Donut
  const donutStyle = {
    background: `conic-gradient( #4ade80 ${stats.open_percent}%, #f87171 0 ${stats.open_percent + stats.close_percent}% )`
  };

  return (
    <div className="bg-white border border-black rounded-[20px] p-6 flex-1 flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-5 left-6 text-xs font-bold uppercase tracking-widest text-black">
        {title}
      </div>

      <div className="flex items-center gap-12 mt-4">
        <div 
          className="w-36 h-36 rounded-full flex items-center justify-center relative shadow-inner"
          style={donutStyle}
        >
          <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
             <span className="text-2xl font-black text-gray-800">{stats.open_percent}%</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#4ade80] shadow-sm"></div>
            Open <span className="text-gray-600 ml-1">{stats.open_percent}%</span>
          </div>
          
          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f87171] shadow-sm"></div>
            Close <span className="text-gray-600 ml-1">{stats.close_percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHAI;