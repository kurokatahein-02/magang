import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  DoorOpen,
  DoorClosed,
  Timer,
  Package,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import api from '../../api';
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

const DashboardHAI = () => {
  const [data, setData] = useState(null);
  const [HAIInventoryCount, setHAIInventoryCount] = useState(0);
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
          unit: "HAI",
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setData(response.data.data);
      // 2. Ambil data KHUSUS inventory HAI untuk dihitung jumlah barangnya
      const responseInv = await api.get(INVENTORY_API, {
        params: { unit: "HAI" },
      });
      setHAIInventoryCount(responseInv.data.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard HAI error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh tiap 1 menit
    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  const HeaderZoom = ({ title }) => (
    <div className="relative mb-8 flex items-center justify-center min-h-[40px] w-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(null);
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-[70]"
      >
        <span className="text-2xl font-bold">←</span>
      </button>
      <h3 className="font-bold text-xl uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );

  if (expanded) {
    const isKegiatan = expanded === "detail-alert-kegiatan";
    const isSitac = expanded === "detail-alert-sitac";
    const alertData = isKegiatan
      ? (data.alerts?.kegiatan || []).filter((item) => item.unit.toLowerCase() === "hai")
      : isSitac
      ? data.alerts?.sitac || []
      : [];

    return (
      <div className="absolute inset-0 z-50 bg-[#f8f9fa] p-8 animate-fadeIn flex flex-col overflow-hidden">
        <HeaderZoom title={isKegiatan ? "Detail Notifikasi Kegiatan HAI" : "Detail Notifikasi SITAC"} />

        <div className="flex-1 bg-white border border-black rounded-[30px] p-8 shadow-2xl overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-red-500 text-white p-2 rounded-lg animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg uppercase">
                  {isKegiatan ? "Daftar Kegiatan HAI Belum Close (Tunggakan)" : "Daftar Dokumen SITAC Mendekati Deadline"}
                </h4>
                <p className="text-xs text-gray-500 italic">
                  {isKegiatan
                    ? "* Menampilkan kegiatan HAI bulan-bulan sebelumnya yang belum diselesaikan."
                    : "* Menampilkan data dengan sisa masa aktif < 3 bulan."}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto border border-black rounded-xl min-h-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#386097] text-white sticky top-0">
                  <tr>
                    <th className="p-4 border-b border-black text-xs font-bold uppercase w-16 text-center">No</th>
                    <th className="p-4 border-b border-black text-xs font-bold uppercase">{isKegiatan ? "Nama Kegiatan" : "Nama Vendor / Lahan"}</th>
                    <th className="p-4 border-b border-black text-xs font-bold uppercase">{isKegiatan ? "Unit" : "Lokasi / Alamat"}</th>
                    <th className="p-4 border-b border-black text-xs font-bold uppercase text-center">{isKegiatan ? "Tanggal Mulai" : "Tanggal Berakhir"}</th>
                    <th className="p-4 border-b border-black text-xs font-bold uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alertData.length > 0 ? (
                    alertData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-red-50 transition-colors border-b border-gray-100">
                        <td className="p-4 text-xs font-bold text-center">{index + 1}</td>
                        <td className="p-4 text-xs font-bold uppercase">{isKegiatan ? item.nama_kegiatan : item.nama_vendor}</td>
                        <td className="p-4 text-xs uppercase">{isKegiatan ? item.unit : item.lokasi}</td>
                        <td className="p-4 text-xs text-center font-mono text-red-600 font-bold">{isKegiatan ? item.tanggal_mulai : item.tanggal_berakhir}</td>
                        <td className="p-4 text-center">
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold border border-red-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400 italic">Tidak ada data notifikasi saat ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="h-full flex items-center justify-center font-bold animate-pulse text-[#56a8c7] tracking-widest uppercase">
        Memuat Dashboard HAI...
      </div>
    );

  // --- LOGIKA MENGAMBIL DATA KHUSUS HAI ---
  const HAIStats = data?.unitStats?.HAI || {
    open_percent: 0,
    close_percent: 0,
    open_count: 0,
    close_count: 0,
  };

  // Total kegiatan HAI adalah jumlah dari Open + Close milik HAI
  const totalKegiatanHAI =
    (HAIStats.open_count || 0) + (HAIStats.close_count || 0);
  // Progres diasumsikan sejajar dengan persentase kegiatan yang sudah 'Close'
  const progressHAI = HAIStats.close_percent || 0;

  // Filter Alert khusus HAI
  const haiAlertCount = (data?.alerts?.kegiatan || []).filter(
    (item) => item.unit.toLowerCase() === "hai"
  ).length;
  const sitacAlertCount = data?.alerts?.sitac?.length || 0;

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
      <div className="flex gap-6 shrink-0 h-24">
        <StatCard
          title="Total Kegiatan"
          value={totalKegiatanHAI}
          icon={LayoutDashboard}
          color="bg-white"
          iconColor="text-black"
        />
        <StatCard
          title="Open"
          value={`${HAIStats.open_count}`}
          icon={DoorOpen}
          color="bg-red-100"
          iconColor="text-red-500"
        />
        <StatCard
          title="Close"
          value={`${HAIStats.close_count}`}
          icon={DoorClosed}
          color="bg-green-100"
          iconColor="text-green-500"
        />
        <StatCard
          title="Progres"
          value={`${progressHAI}%`}
          icon={Timer}
          color="bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      {/* --- 2. GRID UTAMA (KIRI & KANAN) --- */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* KIRI: DONUT CHART & INVENTORY (Span 5) */}
        <div className="col-span-5 flex flex-col gap-6 h-full">
          <AlertBox
            title="Notifikasi SITAC"
            count={sitacAlertCount}
            msg="EXPIRING IN < 3 MONTHS"
            onClick={() => setExpanded("detail-alert-sitac")}
          />
          <AlertBox
            title="Notifikasi Kegiatan Open"
            count={haiAlertCount}
            msg="HAI BELUM DISELESAIKAN"
            onClick={() => setExpanded("detail-alert-kegiatan")}
          />

          <DonutBox title="Progres Kegiatan HAI" stats={HAIStats} />

          {/* KOTAK INVENTORY */}
          <div
            onClick={() => (window.location.href = "/inventory")}
            className="bg-white border border-black rounded-[20px] p-6 h-[45%] flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[#1a536e]">
              <Package size={20} />
              <div className="text-base font-bold uppercase tracking-widest">Histori Pengambilan</div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {data?.inventoryHistory?.length > 0 ? (
                data.inventoryHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-black/5 pb-2 hover:bg-gray-50 transition-colors px-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-black truncate w-32">
                        {item.nama_barang}
                      </span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <div className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[10px] font-black">
                      -{item.jumlah}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                  Belum ada riwayat pengambilan.
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-black/5 flex justify-between items-end">
              <div className="text-[9px] uppercase font-bold text-gray-400">
                {HAIInventoryCount} Jenis Barang
              </div>
              <div className="text-[9px] font-black text-[#386097] underline">Kelola</div>
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
              Lokasi SITAC
            </div>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-black/10">
            <MapContainer
              center={[-7.566, 110.831]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              key={expanded ? "expanded-map" : "mini-map"}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Map SITAC */}
              {(expanded === "lokasi-sitac"
                ? data?.markers?.sitac
                : data?.markers?.sitac || []
              ).map(
                (m) =>
                  m.latitude && (
                    <Marker key={m.id} position={[m.latitude, m.longitude]}>
                      <Popup>
                        <span className="font-bold text-xs">
                          {m.nama_vendor}
                        </span>
                        <br />
                        <span className="text-[10px]">{m.lokasi}</span>
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

const AlertBox = ({ title, count, msg, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-black rounded-[20px] p-4 cursor-pointer hover:shadow-lg transition-all flex flex-col group"
  >
    <div className="flex items-center gap-2 mb-3 text-red-500">
      <AlertTriangle size={18} fill="currentColor" className="text-white" />
      <div className="text-base font-bold uppercase tracking-widest">
        {title}
      </div>
    </div>

    <div className="space-y-1.5 flex-1 flex flex-col justify-center">
      {count > 0 ? (
        <div className="bg-red-500 border border-black/5 p-3 rounded-xl text-white flex gap-3 shadow-md animate-pulse">
          <AlertTriangle size={16} className="shrink-0" />
          <div className="text-[10px] font-bold leading-tight">
            ACTION REQUIRED: {count} DATA {msg}
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-gray-400 italic text-center py-2">
          Tidak ada kegiatan HAI yang menunggak.
        </div>
      )}
    </div>
  </div>
);

export default DashboardHAI;
