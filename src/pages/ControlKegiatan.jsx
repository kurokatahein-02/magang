import React, { useState, useEffect } from "react";
import { CalendarDays, ChevronDown, Download } from "lucide-react";
import axios from "axios";

// Konfigurasi Base URL Laravel
const API_URL = "http://127.0.0.1:8000/api/activities";

const ControlKegiatan = () => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState("table");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    unit: "",
    startDate: "",
    status: "Open",
  });
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const role = userData?.role || "";
  // Di dalam komponen ControlKegiatan
  const [selectedMonth, setSelectedMonth] = useState(""); // Default: Semua Bulan
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  ); // Default: Tahun Sekarang

  const currentYear = new Date().getFullYear();
  const startYear = 2020; // Anda bisa mengubah tahun awal sesuai kebutuhan data lama
  const years = [];

  for (let y = currentYear; y >= startYear; y--) {
    years.push(y.toString());
  }

  // Variabel Sakti
  const isReadOnly = role === "manager";
  const isSuperAdmin = role === "superadmin";

  const handleExportExcel = () => {
    const queryParams = new URLSearchParams({
      unit: activeFilter,
      search: searchTerm,
      month: selectedMonth,
      year: selectedYear,
    }).toString();

    // Membuka URL export di tab baru untuk memicu download otomatis
    window.open(`${API_URL}/export?${queryParams}`, "_blank");
  };

  // --- FETCH DATA DARI BACKEND ---
  const fetchActivities = async () => {
    try {
      // Menambahkan params untuk search dan filter
      const response = await axios.get(API_URL, {
        params: {
          unit: activeFilter,
          search: searchTerm,
          month: selectedMonth, // Kirim bulan
          year: selectedYear,
        },
      });

      const mappedData = response.data.data.map((item) => ({
        id: item.id,
        name: item.nama_kegiatan,
        unit: item.unit,
        startDate: item.tanggal_mulai,
        endDate: item.tanggal_berakhir || "-",
        status: item.status,
      }));
      setActivities(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  // Pastikan useEffect memantau activeFilter dan searchTerm
  useEffect(() => {
    fetchActivities();
  }, [activeFilter, searchTerm, selectedMonth, selectedYear]);

  // Fungsi ambil waktu sekarang format: "01 Mar 2026"
  const getRealtimeDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // --- LOGIKA ACTIONS (INTEGRASI API) ---

  // Simpan Data Baru
  const handleSaveNew = async () => {
    if (!formData.name || !formData.unit || !formData.startDate)
      return alert("Isi data terlebih dahulu!");

    try {
      await axios.post(API_URL, {
        nama_kegiatan: formData.name,
        unit: formData.unit,
        tanggal_mulai: formData.startDate,
        status: "Open",
      });
      fetchActivities();
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan data");
    }
  };

  // Update Data (Edit)
  const handleUpdate = async () => {
    try {
      const payload = {
        nama_kegiatan: formData.name,
        unit: formData.unit,
        tanggal_mulai: formData.startDate,
        status: formData.status,
        tanggal_berakhir:
          formData.status === "Close" ? getRealtimeDate() : null,
      };

      await axios.put(`${API_URL}/${formData.id}`, payload);
      fetchActivities();
      resetForm();
    } catch (error) {
      alert("Gagal memperbarui data");
    }
  };

  // Cari fungsi toggleStatus di dalam ControlKegiatan.jsx dan ganti dengan ini:

  const toggleStatus = async (id) => {
    // Konfirmasi akan muncul untuk semua arah perubahan status
    const confirmChange = window.confirm("Apakah anda ingin mengubah status?");

    if (!confirmChange) return; // Jika pilih "Tidak", proses dibatalkan

    try {
      const response = await axios.patch(`${API_URL}/${id}/status`);

      if (response.data.success) {
        fetchActivities();
        console.log("Status berhasil diperbarui");
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  // Delete Data
  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      unit: "",
      startDate: "",
      status: "Open",
    });
    setView("table");
  };

  const startEdit = (item) => {
    setFormData(item);
    setView("edit");
  };

  // --- RENDER FORM (INPUT & EDIT) ---
  if (view === "form" || view === "edit") {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-8 font-bold text-sm uppercase tracking-widest text-center">
          MONITORING KEGIATAN
        </h3>

        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-4xl shadow-sm flex flex-col gap-6">
          <div className="space-y-6">
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukan Nama Kegiatan ...."
              className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
            />

            <div className="relative w-1/2">
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Unit ....</option>
                <option value="osp">OSP</option>
                <option value="isp">ISP</option>
                <option value="aso">ASO</option>
                <option value="hai">HAI</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
              />
            </div>

            <div className="relative w-1/2">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
              />
            </div>

            {view === "edit" && (
              <div className="relative w-1/3">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button
              onClick={resetForm}
              className="px-16 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
            >
              KEMBALI
            </button>
            <button
              onClick={view === "edit" ? handleUpdate : handleSaveNew}
              className="px-16 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
            >
              SIMPAN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER TABEL ---
  return (
    <div
      className={`h-full flex flex-col gap-4 select-none transition-all duration-500 ${isExpanded ? "absolute inset-0 z-50 bg-[#f8f9fa] p-8" : "relative"}`}
    >
      {!isExpanded && (
        <>
          {/* 1. Judul Sekarang Berada di Paling Atas (Center) */}
          <div className="flex justify-center mb-6">
            <h3 className="font-bold text-xl uppercase tracking-widest">
              MONITORING KEGIATAN
            </h3>
          </div>

          {/* 2. Search Bar (Full Width) */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CARI KEGIATAN, UNIT, ATAU STATUS ...."
              className="flex-1 p-2.5 rounded-full border border-black bg-white italic px-8 focus:outline-none shadow-sm text-xs tracking-widest"
            />
          </div>

          {/* 3. Baris Filter (Kiri) & Tombol Tambah (Kanan) */}
          {/* Baris Filter & Tombol Aksi */}
          {/* Baris Filter Baru: Bulan & Tahun */}
          <div className="flex justify-between items-end mb-4">
            {/* GROUP KIRI: Filter Unit */}
            <div className="flex gap-2">
              {["OSP", "ISP", "ASO", "HAI", "ALL"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-1 border border-black rounded-full font-bold text-[10px] shadow-sm transition-all ${
                    activeFilter === f
                      ? "bg-[#56a8c7] text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* GROUP KANAN: Filter Waktu (Bulan/Tahun) + Tombol Aksi */}
            <div className="flex items-center gap-3">
              {/* Filter Bulan & Tahun (Di samping kanan unit, di samping kiri download) */}
              <div className="flex gap-2 mr-10">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border border-black rounded-lg text-[10px] font-bold bg-white focus:outline-none cursor-pointer hover:bg-gray-50"
                >
                  <option value="">SEMUA BULAN</option>
                  <option value="1">JANUARI</option>
                  <option value="2">FEBRUARI</option>
                  <option value="3">MARET</option>
                  <option value="4">APRIL</option>
                  <option value="5">MEI</option>
                  <option value="6">JUNI</option>
                  <option value="7">JULI</option>
                  <option value="8">AGUSTUS</option>
                  <option value="9">SEPTEMBER</option>
                  <option value="10">OKTOBER</option>
                  <option value="11">NOVEMBER</option>
                  <option value="12">DESEMBER</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="p-2 border border-black rounded-lg text-[10px] font-bold bg-white focus:outline-none cursor-pointer hover:bg-gray-50"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Download Excel */}
              <button
                onClick={handleExportExcel}
                className="bg-[#1a536e] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all"
              >
                <Download size={14} />
                Download Excel
              </button>

              {/* Tombol Tambah Kegiatan */}
              {!isReadOnly && (
                <button
                  onClick={() => setView("form")}
                  className="bg-[#56a8c7] border border-black rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[9px] shadow-sm hover:bg-[#4a97b5] active:scale-95 transition-all"
                >
                  <span className="text-base">+</span> Tambah Kegiatan
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isExpanded && (
        <div className="relative mb-6">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold text-xl"
          >
            ←
          </button>
          <h3 className="text-center font-bold text-xl uppercase tracking-widest">
            MONITORING KEGIATAN
          </h3>
        </div>
      )}

      <div
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`overflow-hidden rounded-[20px] border border-black bg-white shadow-xl transition-all ${!isExpanded ? "cursor-pointer hover:scale-[1.002]" : ""}`}
      >
        <table className="w-full text-center border-collapse table-fixed">
          <thead className="bg-[#56a8c7] text-black">
            <tr>
              <th className="w-12 p-3 border-r border-b border-black text-[11px] font-bold">
                NO
              </th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">
                Nama Kegiatan
              </th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">
                Nama Unit
              </th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">
                Tanggal Mulai
              </th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">
                Tanggal Berakhir
              </th>
              <th className="w-24 p-3 border-r border-b border-black text-[11px] font-bold">
                Status
              </th>
              <th className="w-48 p-3 border-b border-black text-[11px] font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item, index) => (
              <tr
                key={item.id}
                className="h-12 border-b border-black hover:bg-gray-50 transition-colors"
              >
                <td className="border-r border-black font-bold text-xs">
                  {index + 1}
                </td>
                <td className="border-r border-black text-xs px-2 text-left">
                  {item.name}
                </td>
                <td className="border-r border-black text-xs uppercase">
                  {item.unit}
                </td>
                <td className="border-r border-black text-xs">
                  {item.startDate}
                </td>
                <td className="border-r border-black text-xs">
                  {item.endDate}
                </td>
                <td className="border-r border-black p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Status hanya bisa ditoggle jika user adalah Super Admin
                      if (isSuperAdmin) {
                        toggleStatus(item.id, item.status);
                      }
                    }}
                    // Hapus efek hover dan klik jika bukan Super Admin agar tidak terlihat bisa diklik
                    className={`w-full py-1 px-3 rounded-full text-[10px] font-bold text-white transition-all shadow-md
                    ${isSuperAdmin ? "cursor-pointer active:scale-90" : "cursor-default"}
                    ${
                      item.status === "Open"
                        ? `bg-[#4ade80] ${isSuperAdmin ? "hover:bg-[#22c55e]" : ""}`
                        : `bg-[#f87171] ${isSuperAdmin ? "hover:bg-[#ef4444]" : ""}`
                    }`}
                  >
                    {item.status}
                  </button>
                </td>
                <td className="px-4">
                  {!isReadOnly && (
                    <>
                      <div className="flex justify-center gap-4 h-full items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(item);
                          }}
                          className="bg-[#56a8c7] border border-black rounded-md px-4 py-0.5 text-[9px] font-bold hover:bg-white transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="bg-[#56a8c7] border border-black rounded-md px-4 py-0.5 text-[9px] font-bold hover:bg-white transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {[
              ...Array(Math.max(0, (isExpanded ? 15 : 10) - activities.length)),
            ].map((_, i) => (
              <tr key={`empty-${i}`} className="h-12 border-b border-black">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlKegiatan;
