import React, { useState, useEffect } from "react";
import {
  FileText,
  MapPin,
  AlertTriangle,
  Package,
  LayoutDashboard,
  DoorOpen,
  DoorClosed,
  Timer,
} from "lucide-react";
import axios from "axios";
// Tambahkan Tooltip pada import
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
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

const API_URL = "http://127.0.0.1:8000/api/dashboard";

const Dashboard = () => {
  const [expanded, setExpanded] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filePage, setFilePage] = useState(1);
  const filesPerPage = 3; // Batasan 3 file per halaman
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Logika tahun dinamis (sama seperti di Control Kegiatan)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y.toString());
  }
  // 1. Ambil data user dari localStorage
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  // Buat variabel bantuan (Flag) agar nulis kodenya pendek
  const isManager = userData?.role === "manager";
  const isSuperAdmin = userData?.role === "superadmin";

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard error:", error);
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

  // Menghitung indeks file yang akan ditampilkan
  const indexOfLastFile = filePage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;

  // Mengambil 3 file untuk halaman saat ini
  const currentFiles = data?.recentDocs
    ? data.recentDocs.slice(indexOfFirstFile, indexOfLastFile)
    : [];

  // Menghitung total halaman yang tersedia
  const totalPages = Math.ceil((data?.recentDocs?.length || 0) / filesPerPage);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center font-bold animate-pulse">
        MEMUAT DASHBOARD...
      </div>
    );

  // Ubah bagian ini di dalam Dashboard.jsx
  if (expanded) {
    const isSitac = expanded === "detail-alert-sitac";
    const isKegiatan = expanded === "detail-alert-kegiatan"; // Ubah dari isP3
    const alertData = isSitac
      ? data.alerts.sitac
      : isKegiatan
        ? data.alerts.kegiatan
        : [];

    return (
      <div className="absolute inset-0 z-50 bg-[#f8f9fa] p-8 animate-fadeIn flex flex-col overflow-hidden">
        <HeaderZoom title={expanded.replace(/-/g, " ")} />

        <div className="flex-1 bg-white border border-black rounded-[30px] p-8 shadow-2xl overflow-hidden flex flex-col">
          {isSitac || isKegiatan ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-6 flex items-center gap-4">
                <div className="bg-red-500 text-white p-2 rounded-lg animate-pulse">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg uppercase">
                    {isKegiatan
                      ? "Daftar Kegiatan Belum Close (Tunggakan)"
                      : "Daftar Dokumen SITAC Mendekati Deadline"}
                  </h4>
                  <p className="text-xs text-gray-500 italic">
                    {isKegiatan
                      ? "* Menampilkan kegiatan bulan-bulan sebelumnya yang belum diselesaikan."
                      : "* Menampilkan data dengan sisa masa aktif < 3 bulan."}
                  </p>
                </div>
              </div>

              <div className="overflow-auto border border-black rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#56a8c7] text-white sticky top-0">
                    <tr>
                      <th className="p-4 border-b border-black text-xs font-bold uppercase w-16 text-center">
                        No
                      </th>
                      {/* Header Kolom Berubah Sesuai Jenis Alert */}
                      <th className="p-4 border-b border-black text-xs font-bold uppercase">
                        {isKegiatan ? "Nama Kegiatan" : "Nama Vendor / Lahan"}
                      </th>
                      <th className="p-4 border-b border-black text-xs font-bold uppercase">
                        {isKegiatan ? "Unit" : "Lokasi"}
                      </th>
                      <th className="p-4 border-b border-black text-xs font-bold uppercase text-center">
                        {isKegiatan ? "Tanggal Mulai" : "Tanggal Berakhir"}
                      </th>
                      <th className="p-4 border-b border-black text-xs font-bold uppercase text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertData.length > 0 ? (
                      alertData.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-red-50 transition-colors border-b border-gray-100"
                        >
                          <td className="p-4 text-xs font-bold text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 text-xs font-bold uppercase">
                            {isKegiatan ? item.nama_kegiatan : item.nama_vendor}
                          </td>
                          <td className="p-4 text-xs uppercase">
                            {isKegiatan ? item.unit : item.lokasi}
                          </td>
                          <td className="p-4 text-xs text-center font-mono text-red-600 font-bold">
                            {isKegiatan
                              ? item.tanggal_mulai
                              : item.tanggal_berakhir}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold border border-red-200">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-10 text-center text-gray-400 italic"
                        >
                          Tidak ada tunggakan kegiatan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* JIKA VIEW ADALAH MAP (LOKASI SITAC/P3) */
            <div className="flex-1 rounded-2xl overflow-hidden border border-black/10">
              <MapContainer
                center={[-7.566, 110.831]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                key={expanded ? "expanded-map" : "mini-map"}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {(expanded === "lokasi-sitac"
                  ? data?.markers?.sitac || []
                  : data?.markers?.p3 || []
                ).map(
                  (m) =>
                    m.latitude &&
                    m.longitude && (
                      <Marker key={m.id} position={[m.latitude, m.longitude]}>
                        <Popup>
                          <div className="font-bold text-xs uppercase">
                            {m.nama_vendor}
                          </div>
                          <div className="text-[10px] leading-tight">
                            {m.lokasi}
                          </div>
                        </Popup>
                        <Tooltip
                          permanent
                          direction="top"
                          offset={[0, -10]}
                          className="shadow-lg border-black rounded-md p-2 bg-white"
                        >
                          <div className="flex flex-col items-center text-center leading-tight">
                            <span className="font-bold text-[10px] uppercase text-[#1a536e] border-b border-gray-200 mb-1 w-full pb-1">
                              {m.nama_vendor}
                            </span>
                            <span className="text-[9px] text-gray-600 italic normal-case mb-1">
                              {m.lokasi}
                            </span>
                            <span className="text-[8px] text-gray-400 font-mono bg-gray-50 px-1 rounded">
                              {m.latitude}, {m.longitude}
                            </span>
                          </div>
                        </Tooltip>
                      </Marker>
                    ),
                )}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="bg-[#1a536e] text-white px-4 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-black">
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

      {/* --- 1. TOP STATS BAR --- */}
      <div className="flex gap-4 shrink-0">
        <StatCard
          title="Total Data"
          value={data.stats.total}
          icon={LayoutDashboard}
          color="bg-gray-100"
          iconColor="text-black"
        />

        {/* Status Open sekarang Merah */}
        <StatCard
          title="Open"
          value={data.stats.open_count}
          icon={DoorOpen}
          color="bg-red-100"
          iconColor="text-red-500"
        />

        {/* Status Close sekarang Hijau */}
        <StatCard
          title="Close"
          value={data.stats.close_count}
          icon={DoorClosed}
          color="bg-green-100"
          iconColor="text-green-500"
        />

        <StatCard
          title="Progres"
          value={data.stats.progress}
          icon={Timer}
          color="bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: 4 DONUT CHARTS */}
        <div className="col-span-4 space-y-6">
          {["OSP", "ISP", "ASO", "HAI"].map((name) => (
            <DonutBox
              key={name}
              title={`Progres Kegiatan ${name}`}
              stats={
                data.unitStats[name] || { open_percent: 0, close_percent: 0 }
              }
            />
          ))}
        </div>

        <div className="col-span-8 flex flex-col gap-6">
          {/* ROW 1: FILES & ALERTS */}
          <div className="grid grid-cols-2 gap-6 items-stretch">
            {/* Kotak File Terkini */}
            <div className="bg-white border border-black rounded-[25px] p-5 flex flex-col justify-between shadow-sm min-h-[280px]">
              <div>
                <div className="text-base font-bold uppercase mb-4 tracking-widest">
                  File Terkini
                </div>

                {/* Daftar File (Hanya 3 per halaman) */}
                <div className="space-y-2 min-h-[150px]">
                  {currentFiles.length > 0 ? (
                    currentFiles.map((doc, i) => (
                      <div
                        key={i}
                        onClick={() => window.open(doc.file, "_blank")}
                        className="bg-[#56a8c7] border border-black/20 p-3 rounded-xl flex items-center gap-4 text-white shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
                      >
                        <FileText size={18} fill="black" />
                        <span className="text-[9px] font-bold tracking-widest uppercase truncate">
                          {doc.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-400 italic text-center pt-10">
                      Tidak ada file.
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Navigasi Angka Kecil */}
              <div className="flex justify-center gap-1.5 mt-4">
                {/* Tombol Previous (<) */}
                <button
                  disabled={filePage === 1}
                  onClick={() => setFilePage((prev) => prev - 1)}
                  className={`w-7 h-7 border border-black rounded text-[8px] transition-all ${filePage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  {"<"}
                </button>

                {/* Looping Angka Halaman */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setFilePage(i + 1)}
                    className={`w-7 h-7 border border-black rounded text-[8px] font-bold transition-all ${
                      filePage === i + 1
                        ? "bg-[#56a8c7] text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                {/* Tombol Next (>) */}
                <button
                  disabled={filePage === totalPages}
                  onClick={() => setFilePage((prev) => prev + 1)}
                  className={`w-7 h-7 border border-black rounded text-[8px] transition-all ${filePage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100"}`}
                >
                  {">"}
                </button>
              </div>
            </div>

            {/* Alerts Container */}
            <div className="flex flex-col gap-4">
              {/* Alert SITAC */}
              <AlertBox
                title="Alert Laporan SITAC"
                count={data?.alerts?.sitac?.length || 0}
                msg="EXPIRING IN < 3 MONTHS"
                onClick={() => setExpanded("detail-alert-sitac")}
              />
              {/* Alert Kegiatan Baru (Pengganti Pihak Ketiga) */}
              <AlertBox
                title="Alert Kegiatan Belum Close"
                count={data?.alerts?.kegiatan?.length || 0}
                msg="BELUM DISELESAIKAN DARI BULAN LALU"
                onClick={() => setExpanded("detail-alert-kegiatan")}
              />
            </div>
          </div>

          {/* ROW 2: BIG MAP SITAC */}
          {/* MINIMAP SITAC */}
          <div
            onClick={() => setExpanded("lokasi-sitac")}
            className="flex-1 min-h-[400px] bg-white border border-black rounded-[25px] p-6 cursor-pointer hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={24} className="bg-black text-white p-1 rounded" />
              <div className="text-b font-bold uppercase tracking-widest">
                Lokasi SITAC
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-black/5 relative overflow-hidden">
              <MapContainer
                center={[-7.566, 110.831]}
                zoom={11}
                zoomControl={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {(data?.markers?.sitac || []).map(
                  (m) =>
                    m.latitude &&
                    m.longitude && (
                      <Marker key={m.id} position={[m.latitude, m.longitude]}>
                        <Tooltip
                          permanent
                          direction="top"
                          offset={[0, -5]}
                          className="shadow-md border-black rounded p-1 bg-white"
                        >
                          <div className="flex flex-col items-center text-[7px] leading-tight">
                            <span className="font-bold uppercase text-[#1a536e]">
                              {m.nama_vendor}
                            </span>
                            <span className="text-gray-600 italic">
                              {m.lokasi}
                            </span>
                            <span className="text-gray-400 font-mono">
                              {m.latitude}, {m.longitude}
                            </span>
                          </div>
                        </Tooltip>
                      </Marker>
                    ),
                )}
              </MapContainer>
            </div>
          </div>

          {/* ROW 3: INVENTORY & LOKASI P3 */}
          <div className="grid grid-cols-2 gap-6 h-[300px]">
            <div
              onClick={() => (window.location.href = "/inventory")}
              className="bg-white border border-black rounded-[25px] p-6 flex flex-col cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-2 mb-4 text-[#1a536e]">
                <Package size={20} />
                <div className="text-base font-bold uppercase">Inventory</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-5xl font-black mb-2">
                  {data.inventoryCount}
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-400">
                  Total Jenis Barang
                </div>
              </div>
            </div>

            {/* MINIMAP PIHAK KETIGA */}
            <div
              onClick={() => setExpanded("lokasi-p3")}
              className="bg-white border border-black rounded-[25px] p-6 flex flex-col cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={24} className="bg-black text-white p-1 rounded" />
                <div className="text-base font-bold uppercase">
                  Lokasi Pihak Ketiga
                </div>
              </div>
              <div className="flex-1 rounded-2xl border border-black/5 overflow-hidden">
                <MapContainer
                  center={[-7.566, 110.831]}
                  zoom={11}
                  zoomControl={false}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {(data?.markers?.p3 || []).map(
                    (m) =>
                      m.latitude &&
                      m.longitude && (
                        <Marker key={m.id} position={[m.latitude, m.longitude]}>
                          <Tooltip
                            permanent
                            direction="top"
                            offset={[0, -5]}
                            className="shadow-md border-black rounded p-1 bg-white"
                          >
                            <div className="flex flex-col items-center text-[7px] leading-tight">
                              <span className="font-bold uppercase text-[#1a536e]">
                                {m.nama_vendor}
                              </span>
                              <span className="text-gray-600 italic">
                                {m.lokasi}
                              </span>
                              <span className="text-gray-400 font-mono">
                                {m.latitude}, {m.longitude}
                              </span>
                            </div>
                          </Tooltip>
                        </Marker>
                      ),
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
  <div className="bg-white border border-black rounded-xl p-4 flex items-center gap-5 shadow-sm flex-1">
    <div className={`p-3 ${color} rounded-xl border border-black/5`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      <div className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-1">
        {title}
      </div>
      <div className="text-2xl font-black leading-none">{value}</div>
    </div>
  </div>
);

const DonutBox = ({ title, stats }) => {
  // Logik Baru: Warna Hijau untuk Close, Merah untuk Open
  const donutStyle = {
    background: `conic-gradient(
      #4ade80 ${stats.close_percent}%, 
      #f87171 0 ${stats.close_percent + stats.open_percent}%
    )`,
  };

  return (
    <div className="bg-white border border-black rounded-[25px] p-6 h-64 flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-5 left-8 text-xs font-bold uppercase text-gray-500 tracking-widest">
        {title}
      </div>

      <div className="flex items-center gap-10 mt-6">
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

        {/* Keterangan Status (Dibalik) */}
        <div className="space-y-3">
          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
            Close{" "}
            <span className="text-gray-400 ml-1">{stats.close_count}</span>
          </div>

          <div className="text-sm font-bold flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#f87171]"></div>
            Open <span className="text-gray-400 ml-1">{stats.open_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertBox = ({ title, count, msg, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-black rounded-[25px] p-4 cursor-pointer hover:shadow-lg transition-all flex flex-col flex-1 group"
  >
    <div className="flex items-center gap-2 mb-3 text-red-500">
      <AlertTriangle size={18} fill="currentColor" className="text-white" />
      <div className="text-base font-bold uppercase tracking-widest">
        {title}
      </div>
    </div>

    <div className="space-y-1.5 flex-1 flex flex-col justify-center">
      {/* Jika ada data (count > 0), tampilkan peringatan merah */}
      {count > 0 ? (
        <div className="bg-red-500 border border-black/5 p-3 rounded-xl text-white flex gap-3 shadow-md animate-pulse">
          <AlertTriangle size={16} className="shrink-0" />
          <div className="text-[10px] font-bold leading-tight">
            ACTION REQUIRED: {count} DATA {msg}
          </div>
        </div>
      ) : (
        // Jika tidak ada data yang hampir expired
        <div className="text-[10px] text-gray-400 italic text-center py-2">
          Tidak ada dokumen yang akan berakhir dalam waktu dekat.
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;
