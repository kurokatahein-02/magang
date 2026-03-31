import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  DoorOpen,
  DoorClosed,
  Timer,
  Package,
  MapPin,
} from "lucide-react";
import api from '../../api';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet"; //
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

const DashboardISP = () => {
  const [data, setData] = useState(null);
  const [ISPInventoryCount, setISPInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Buat daftar tahun dari tahun ini mundur ke 2020
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y.toString());
  }
  const fetchData = async () => {
    try {
      const response = await api.get(DASHBOARD_API, {
        params: {
          unit: "ISP",
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setData(response.data.data);
      // 2. Ambil data KHUSUS inventory ISP untuk dihitung jumlah barangnya
      const responseInv = await api.get(INVENTORY_API, {
        params: { unit: "ISP" },
      });
      setISPInventoryCount(responseInv.data.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard ISP error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh tiap 1 menit
    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center font-bold animate-pulse text-[#56a8c7] tracking-widest uppercase">
        Memuat Dashboard ISP...
      </div>
    );

  // --- LOGIKA MENGAMBIL DATA KHUSUS ISP ---
  const ISPStats = data?.unitStats?.ISP || {
    open_percent: 0,
    close_percent: 0,
    open_count: 0,
    close_count: 0,
  };

  // Total kegiatan ISP adalah jumlah dari Open + Close milik ISP
  const totalKegiatanISP =
    (ISPStats.open_count || 0) + (ISPStats.close_count || 0);
  // Progres diasumsikan sejajar dengan persentase kegiatan yang sudah 'Close'
  const progressISP = ISPStats.close_percent || 0;

  return (
    <div className="h-full flex flex-col gap-6 select-none relative p-2 overflow-y-auto no-scrollbar pb-20">
      {/* Penambahan Keterangan Tanggal/Periode Terkini */}
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={24} className="text-[#386097]" />
          <h2 className="text-xl font-bold uppercase tracking-widest">
            Dashboard Overview
          </h2>
        </div>

        {/* Tampilan Periode dari Backend */}
        <div className="bg-[#386097] text-white px-4 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-black">
          <Timer size={14} className="mr-1" />
          <span className="text-[10px] font-bold uppercase tracking-tighter mr-1">
            Periode:
          </span>

          {/* Filter Bulan */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase focus:outline-none cursor-pointer hover:text-orange-300 transition-colors"
          >
            {[
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ].map((m, i) => (
              <option key={i} value={i + 1} className="text-black">
                {m}
              </option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase focus:outline-none cursor-pointer hover:text-orange-300 transition-colors"
          >
            {years.map((y) => (
              <option key={y} value={y} className="text-black">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- 1. BARIS ATAS: 4 KOTAK STATISTIK (KHUSUS ISP) --- */}
      <div className="flex gap-4 shrink-0">
        <StatCard
          title="Total Kegiatan"
          value={totalKegiatanISP}
          icon={LayoutDashboard}
          color="bg-gray-100"
          iconColor="text-black"
        />
        <StatCard
          title="Open"
          value={`${ISPStats.open_count}`}
          icon={DoorOpen}
          color="bg-red-100"
          iconColor="text-red-500"
        />
        <StatCard
          title="Close"
          value={`${ISPStats.close_count}`}
          icon={DoorClosed}
          color="bg-green-100"
          iconColor="text-green-500"
        />
        <StatCard
          title="Progres"
          value={`${progressISP}%`}
          icon={Timer}
          color="bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      {/* --- 2. GRID UTAMA (KIRI & KANAN) --- */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* KIRI: DONUT CHART & INVENTORY (Span 5) */}
        <div className="col-span-5 flex flex-col gap-6 h-full">
          <DonutBox title="Progres Kegiatan ISP" stats={ISPStats} />

          {/* KOTAK INVENTORY */}
          <div
            onClick={() => (window.location.href = "/inventory")}
            className="bg-white border border-black rounded-[20px] p-6 h-[35%] flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[#1a536e]">
              <Package size={20} />
              <div className="text-base font-bold uppercase">Inventory</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-5xl font-black mb-1 text-black">
                {ISPInventoryCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                Total Jenis Barang
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: MAP LOKASI SITAC (Span 7) */}
        <div className="col-span-7 bg-white border border-black rounded-[20px] p-6 flex flex-col shadow-sm h-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin
              size={24}
              className="text-black"
              fill="black"
              stroke="white"
            />
            <div className="text-sm font-black uppercase tracking-[0.2em]">
              Map Persebaran OLT
            </div>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-black/10">
            <MapContainer
              center={[-7.566, 110.831]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Render Marker OLT khusus ISP */}
              {(data?.markers?.olt || []).map(
                (m) =>
                  m.latitude &&
                  m.longitude && (
                    <Marker key={m.id} position={[m.latitude, m.longitude]}>
                      <Popup>
                        <div className="font-bold text-xs uppercase">
                          {m.nama_perangkat}
                        </div>
                        <div className="text-[10px] leading-tight mb-1">
                          {m.lokasi}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-bold text-white ${
                            m.status_baterai === "Good"
                              ? "bg-green-500"
                              : m.status_baterai === "Average"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        >
                          BATERAI: {m.status_baterai?.toUpperCase()}
                        </span>
                      </Popup>
                    </Marker>
                  ),
              )}
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
  // Logik Baru: Warna Hijau untuk Close, Merah untuk Open
  const donutStyle = {
    background: `conic-gradient(
      #4ade80 ${stats.close_percent}%, 
      #f87171 0 ${stats.close_percent + stats.open_percent}%
    )`,
  };

  return (
    <div className="bg-white border border-black rounded-[20px] p-6 flex-1 flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-5 left-6 text-xs font-bold uppercase tracking-widest text-black">
        {title}
      </div>

      <div className="flex items-center gap-12 mt-4">
        {/* Lingkaran Donut Dinamis */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center relative shadow-inner"
          style={donutStyle}
        >
          {/* Lubang Putih di Tengah - Sekarang Menampilkan Progres 'Close' */}
          <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
            <span className="text-xl font-black">{stats.close_percent}%</span>
            <span className="text-[8px] uppercase font-bold text-gray-400 tracking-tighter">
              Close Rate
            </span>
          </div>
        </div>


        <div className="space-y-4">
          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f87171] shadow-sm"></div>
            Open{" "}
            <span className="text-gray-600 ml-1">{stats.open_percent}%</span>
          </div>

          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-4 h-4 rounded-full  bg-[#4ade80] shadow-sm"></div>
            Close{" "}
            <span className="text-gray-600 ml-1">{stats.close_percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardISP;
