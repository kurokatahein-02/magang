import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  DoorOpen,
  DoorClosed,
  Timer,
  Package,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet Icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// API Constants
const DASHBOARD_API = "http://127.0.0.1:8000/api/dashboard";
const INVENTORY_API = "http://127.0.0.1:8000/api/inventories";

const DashboardASO = () => {
  const [data, setData] = useState(null);
  const [ASOInventoryCount, setASOInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Ambil data utama dashboard
      const responseDash = await axios.get(DASHBOARD_API);
      setData(responseDash.data.data);

      // 2. Ambil data KHUSUS inventory ASO untuk dihitung jumlah barangnya
      const responseInv = await axios.get(INVENTORY_API, {
        params: { unit: "ASO" },
      });
      setASOInventoryCount(responseInv.data.data.length);

      setLoading(false);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh tiap 1 menit
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center font-bold animate-pulse text-[#56a8c7] tracking-widest uppercase">
        Memuat Dashboard ASO...
      </div>
    );

  // --- LOGIKA MENGAMBIL DATA KHUSUS ASO ---
  const ASOStats = data?.unitStats?.ASO || {
    open_percent: 0,
    close_percent: 0,
    open_count: 0,
    close_count: 0,
  };

  // Total kegiatan ASO adalah jumlah dari Open + Close milik ASO
  const totalKegiatanASO =
    (ASOStats.open_count || 0) + (ASOStats.close_count || 0);
  // Progres diasumsikan sejajar dengan persentase kegiatan yang sudah 'Close'
  const progressASO = ASOStats.close_percent || 0;

  return (
    <div className="h-full flex flex-col gap-6 select-none relative p-2 overflow-y-auto no-scrollbar pb-20">
      {/* Penambahan Keterangan Tanggal/Periode Terkini */}
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={24} className="text-[#56a8c7]" />
          <h2 className="text-xl font-bold uppercase tracking-widest">
            Dashboard Overview
          </h2>
        </div>

        {/* Tampilan Periode dari Backend */}
        <div className="bg-[#1a536e] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-black">
          <Timer size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Periode Data: {data?.stats?.periode || "Memuat..."}
          </span>
        </div>
      </div>

      {/* --- 1. BARIS ATAS: 4 KOTAK STATISTIK (KHUSUS ASO) --- */}
      <div className="flex gap-6 shrink-0 h-24">
        <StatCard
          title="Total Kegiatan"
          value={totalKegiatanASO}
          icon={LayoutDashboard}
          color="bg-white"
          iconColor="text-black"
        />
        <StatCard
          title="Open"
          value={`${ASOStats.open_count}`}
          icon={DoorOpen}
          color="bg-green-500"
          iconColor="text-white"
        />
        <StatCard
          title="Close"
          value={`${ASOStats.close_count}`}
          icon={DoorClosed}
          color="bg-red-500"
          iconColor="text-white"
        />
        <StatCard
          title="Progres"
          value={`${progressASO}%`}
          icon={Timer}
          color="bg-orange-400"
          iconColor="text-white"
        />
      </div>

      {/* --- 2. GRID UTAMA (KIRI & KANAN) --- */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* KIRI: DONUT CHART & INVENTORY (Disesuaikan agar bersebelahan) */}
        <div className="col-span-12 flex gap-6 h-full">
          <DonutBox title="Progres Kegiatan ASO" stats={ASOStats} />

          {/* KOTAK INVENTORY (Sekarang di samping DonutBox) */}
          <div
            onClick={() => (window.location.href = "/inventory")}
            className="bg-white border border-black rounded-[20px] p-6 flex-1 flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[#1a536e]">
              <Package size={20} />
              <div className="text-base font-bold uppercase">Inventory</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-5xl font-black mb-2 text-black">
                {ASOInventoryCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                Total Jenis Barang
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN KOTAK STATISTIK ---
const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
  <div className="bg-white border border-black rounded-[20px] p-4 flex items-center justify-center gap-4 shadow-sm flex-1 hover:-translate-y-1 transition-transform">
    <div
      className={`w-12 h-12 ${color} rounded-xl border border-black flex items-center justify-center shrink-0 shadow-inner`}
    >
      <Icon size={24} className={iconColor} />
    </div>
    <div className="flex flex-col">
      <div className="text-[10px] font-bold uppercase text-gray-800 tracking-wider mb-0.5">
        {title}
      </div>
      <div className="text-2xl font-black leading-none">{value}</div>
    </div>
  </div>
);

// --- KOMPONEN DONUT CHART ---
const DonutBox = ({ title, stats }) => {
  // Logic untuk diagram Donut
  const donutStyle = {
    background: `conic-gradient( #4ade80 ${stats.open_percent}%, #f87171 0 ${stats.open_percent + stats.close_percent}% )`,
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
            <span className="text-2xl font-black text-gray-800">
              {stats.open_percent}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#4ade80] shadow-sm"></div>
            Open{" "}
            <span className="text-gray-600 ml-1">{stats.open_percent}%</span>
          </div>

          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f87171] shadow-sm"></div>
            Close{" "}
            <span className="text-gray-600 ml-1">{stats.close_percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardASO;
