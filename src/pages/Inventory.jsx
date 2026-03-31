import React, { useState, useEffect } from "react";
import { ChevronDown, MapPin, Download, Plus, ArrowRight } from "lucide-react";
import api from "../api";
import Swal from "sweetalert2";

const API_URL = "http://127.0.0.1:8000/api/inventories";

const Inventory = () => {
  const [view, setView] = useState("table");
  const [expandedTable, setExpandedTable] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [takeFormData, setTakeFormData] = useState({
    inventory_id: null,
    name: "",
    amountTaken: "",
    unit: "",
  });
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    amount: "",
    unit: "",
    location: "",
  });
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const role = userData?.role || "";

  // Variabel Sakti
  const isReadOnly = role === "manager";
  const isSuperAdmin = role === "superadmin";
  // Tambahkan fungsi ini di dalam komponen Inventory, sebelum baris return
  const handleExportExcel = async () => {
    try {
      const response = await api.get("/inventories/export", {
        params: {
          // Sesuaikan dengan state filter yang Anda gunakan di Inventory.jsx
          unit: activeFilter,
          search: searchTerm,
        },
        responseType: "blob", // Penting untuk menangani file binary
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Format tanggal YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // → "2026-03-20"

      // atau kalau mau include jam-menit (lebih unik, ga bentrok kalau export berkali-kali)
      const formattedDateTime = today
        .toISOString()
        .replace(/[:.]/g, "-")
        .split("T")
        .join("_")
        .slice(0, 19);
      // → "2026-03-20_16-07-00" (contoh)

      // Pilih salah satu, lalu gabung ke nama file
      const fileName = `Inventory_${activeFilter || "semua"}_${formattedDate}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Gagal export inventory:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengunduh laporan Inventori.",
        confirmButtonColor: "#386097",
      });
    }
  };

  const handleExportHistory = async () => {
    try {
      const response = await api.get("/inventories/history/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      const fileName = `Histori_Pengambilan_${formattedDate}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Gagal export histori:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengunduh histori pengambilan.",
      });
    }
  };

  const isExpanded = expandedTable === "inventory";

  // --- FETCH DATA FROM BACKEND ---
  const fetchInventory = async () => {
    try {
      const response = await api.get(API_URL, {
        params: {
          unit: activeFilter, // Tetap mengirimkan filter unit
          search: searchTerm, // Mengirimkan kata kunci pencarian
        },
      });

      const mappedData = response.data.data.map((item) => ({
        id: item.id,
        name: item.nama_barang,
        amount: item.jumlah_barang,
        unit: item.unit,
        location: item.lokasi,
      }));

      setInventoryList(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data inventory:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`${API_URL}/history`);
      setHistoryList(response.data.data);
      setView("history");
    } catch (error) {
      console.error("Gagal mengambil histori:", error);
      Swal.fire("Error", "Gagal memuat data histori", "error");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeFilter, searchTerm]);

  // --- LOGIC ---
  const resetForm = () => {
    setView("table");
    setFormData({ id: null, name: "", amount: "", unit: "", location: "" });
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setFormData(item);
    setView("edit");
  };

  const startTake = (item, e) => {
    e.stopPropagation();
    setTakeFormData({
      inventory_id: item.id,
      name: item.name,
      amountTaken: "",
      unit: "",
    });
    setView("take");
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount || !formData.unit) {
      return Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Silakan isi nama barang, jumlah, dan unit.",
        confirmButtonColor: "#386097",
      });
    }

    try {
      const payload = {
        nama_barang: formData.name,
        jumlah_barang: formData.amount,
        unit: formData.unit,
        lokasi: formData.location,
      };

      if (view === "edit") {
        await api.put(`${API_URL}/${formData.id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Diperbarui!",
          text: "Data inventori berhasil diubah.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post(API_URL, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Barang baru telah ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      fetchInventory();
      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      Swal.fire("Error", "Gagal menyimpan data", "error");
    }
  };

  const handleTakeSubmit = async () => {
    if (!takeFormData.amountTaken || !takeFormData.unit) {
      return Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Silakan isi jumlah yang diambil dan unit peminjam.",
        confirmButtonColor: "#386097",
      });
    }

    try {
      await api.post(`${API_URL}/${takeFormData.inventory_id}/take`, {
        jumlah: takeFormData.amountTaken,
        unit: takeFormData.unit,
      });

      Swal.fire("Berhasil", "Barang telah berhasil diambil", "success");
      fetchInventory();
      resetForm();
    } catch (error) {
      console.error("Gagal mengambil barang:", error);
      Swal.fire("Error", "Gagal memproses pengambilan barang", "error");
    }
  };

  const handleAction = async (e, type, id) => {
    e.stopPropagation();
    if (type === "delete") {
      const result = await Swal.fire({
        title: "Hapus Barang?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#386097",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`${API_URL}/${id}`);
          Swal.fire({
            icon: "success",
            title: "Dihapus!",
            text: "Barang telah berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchInventory();
        } catch (error) {
          console.error("Gagal menghapus data:", error);
          Swal.fire("Error", "Gagal menghapus data", "error");
        }
      }
    }
  };

  // --- VIEW: FORM ---
  if (view === "form" || view === "edit") {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-6 font-bold text-sm uppercase tracking-widest text-center">
          INVENTORY CONTROL
        </h3>
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-5xl shadow-sm flex flex-col gap-6">
          <div className="space-y-6">
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukan Nama Barang ...."
              className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
            />
            <input
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Jumlah Barang ...."
              className="w-1/2 p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
            />
            <div className="relative w-1/3">
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Unit ....</option>
                <option value="OSP">OSP</option>
                <option value="ISP">ISP</option>
                <option value="ASO">ASO</option>
                <option value="HAI">HAI</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
            <div className="relative w-1/2">
              <input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Lokasi ...."
                className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
              />
              <MapPin
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
          </div>
          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button
              onClick={resetForm}
              className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
            >
              KEMBALI
            </button>
            <button
              onClick={handleSave}
              className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
            >
              SIMPAN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: TAKE ITEM FORM ---
  if (view === "take") {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-6 font-bold text-sm uppercase tracking-widest text-center">
          AMBIL BARANG
        </h3>
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-2xl shadow-sm flex flex-col gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase ml-2 text-gray-500">Nama Barang</label>
              <input
                value={takeFormData.name}
                readOnly
                className="w-full p-3 rounded-lg border border-black bg-gray-200 italic px-6 focus:outline-none cursor-not-allowed opacity-70"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase ml-2 text-gray-500">Jumlah yang diambil</label>
              <input
                type="number"
                value={takeFormData.amountTaken}
                onChange={(e) => setTakeFormData({ ...takeFormData, amountTaken: e.target.value })}
                placeholder="Masukan Jumlah ...."
                className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
              />
            </div>

            <div className="relative space-y-2">
              <label className="text-[10px] font-bold uppercase ml-2 text-gray-500">Unit Pengambil</label>
              <div className="relative">
                <select
                  value={takeFormData.unit}
                  onChange={(e) => setTakeFormData({ ...takeFormData, unit: e.target.value })}
                  className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Pilih Unit ....</option>
                  <option value="OSP">OSP</option>
                  <option value="ISP">ISP</option>
                  <option value="ASO">ASO</option>
                  <option value="HAI">HAI</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button onClick={resetForm} className="px-16 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase">
              BATAL
            </button>
            <button onClick={handleTakeSubmit} className="px-16 py-3 bg-[#386097] text-white border border-black rounded-lg hover:bg-black transition-all uppercase">
              AMBIL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: HISTORY TABLE ---
  if (view === "history") {
    return (
      <div className="h-full flex flex-col gap-6 select-none relative p-4 animate-fadeIn">
        <div className="relative flex items-center justify-center min-h-[40px]">
          <button
            onClick={() => setView("table")}
            className="absolute left-0 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold text-2xl hover:scale-110 transition-all"
          >
            ←
          </button>
          <h3 className="font-bold uppercase tracking-[0.2em] text-xl">
            HISTORI PENGAMBILAN BARANG
          </h3>
          <button
            onClick={handleExportHistory}
            className="absolute right-0 bg-[#51A0D2] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all"
          >
            <Download size={14} /> Export Histori
          </button>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-black bg-white shadow-xl flex-1 overflow-auto">
          <table className="w-full text-center border-collapse table-fixed">
            <thead className="bg-[#386097] sticky top-0 z-10">
              <tr>
                <th className="w-12 p-3 border-r border-b text-white text-[11px] font-bold">NO</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Nama Barang</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Jumlah</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Unit Pengambil</th>
                <th className="p-3 border-b text-white text-[11px] font-bold">Tanggal Ambil</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length > 0 ? (
                historyList.map((item, index) => (
                  <tr key={item.id} className="h-12 border-b border-black hover:bg-gray-50">
                    <td className="border-r border-black font-bold text-xs">{index + 1}</td>
                    <td className="border-r border-black text-xs px-2 text-left uppercase">{item.nama_barang}</td>
                    <td className="border-r border-black text-xs">{item.jumlah}</td>
                    <td className="border-r border-black text-xs font-bold uppercase">{item.unit}</td>
                    <td className="text-xs">
                      {new Date(item.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center italic text-gray-400">
                    Belum ada data histori.
                  </td>
                </tr>
              )}
              {/* Padding empty rows */}
              {[...Array(Math.max(0, 15 - historyList.length))].map((_, i) => (
                <tr key={`empty-hist-${i}`} className="h-12 border-b border-black opacity-20">
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
  }


  // --- VIEW: MAIN TABLE ---
  return (
    <div
      className={`h-full flex flex-col select-none relative transition-all duration-500 ${isExpanded ? "absolute inset-0 z-50 bg-[#f8f9fa] p-8" : "px-4 gap-6"}`}
    >
      <div
        className={`relative flex items-center justify-center ${isExpanded ? "mb-8" : "min-h-[40px]"}`}
      >
        {isExpanded && (
          <button
            onClick={() => setExpandedTable(null)}
            className="absolute left-0 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold text-2xl hover:scale-110 transition-all"
          >
            ←
          </button>
        )}
        <h3
          className={`font-bold uppercase tracking-[0.2em] ${isExpanded ? "text-xl" : "text-sm"}`}
        >
          INVENTORY - {activeFilter}
        </h3>
      </div>

      {!isExpanded && (
        <>
          {/* 2. Search Bar (Full Width) */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CARI INVENTORY, UNIT, ATAU STATUS ...."
              className="flex-1 p-2.5 rounded-full border border-black bg-white italic px-8 focus:outline-none shadow-sm text-xs tracking-widest"
            />
          </div>

          {/* 3. Baris Filter (Kiri) & Tombol Tambah (Kanan) */}
          {/* Baris Filter & Tombol Aksi */}
          <div className="flex justify-between items-end mb-4">
            {/* Group Filter di Kiri */}
            <div className="flex gap-2">
              {["OSP", "ISP", "ASO", "HAI", "ALL"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-1 border border-black rounded-full font-bold text-[10px] shadow-sm transition-all ${
                    activeFilter === f
                      ? "bg-[#386097] text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Group Tombol Aksi di Kanan */}
            <div className="flex gap-3">
              {/* Tombol Histori */}
              <button
                onClick={fetchHistory}
                className="bg-[#386097] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all"
              >
                Lihat Histori
              </button>

              {/* Tombol Download Excel Baru */}
              <button
                onClick={handleExportExcel}
                className="bg-[#51A0D2] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all"
              >
                <Download size={14} />
                Download Excel
              </button>

              {/* Tombol Tambah K=Inventori */}
              {!isReadOnly && (
                <button
                  onClick={() => setView("form")}
                  className="bg-[#386097] border text-white rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[9px] shadow-sm active:scale-95 transition-all hover:bg-white hover:text-black"
                >
                  <span className="text-base">+</span> Tambah Inventori
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <div
        onClick={() => !isExpanded && setExpandedTable("inventory")}
        className={`flex flex-col transition-all duration-300 ${!isExpanded ? "cursor-pointer hover:scale-[1.002]" : "flex-1"}`}
      >
        <div className="overflow-hidden rounded-t-[20px] border-x border-t border-black bg-white shadow-xl">
          <table className="w-full text-center border-collapse table-fixed">
            <thead className="bg-[#386097]">
              <tr>
                <th className="w-12 p-3 border-r border-b text-white text-[11px] font-bold">
                  NO
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Nama Barang
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Jumlah Barang
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Unit
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Lokasi
                </th>
                <th className="w-72 p-3 border-b text-white text-[11px] font-bold">
                  Opsi
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item, index) => (
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
                  <td className="border-r border-black text-xs px-2 text-left">
                    {item.amount}
                  </td>
                  <td className="border-r border-black text-xs uppercase">
                    {item.unit}
                  </td>
                  <td className="border-r border-black text-xs px-2 text-left">
                    {item.location}
                  </td>
                  <td className="px-4">
                    <div className="flex justify-center items-center gap-2">
                      {!isReadOnly ? (
                        <>
                          <button
                            onClick={(e) => startTake(item, e)}
                            className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm transition-all whitespace-nowrap hover:bg-white hover:text-black"
                          >
                            Ambil
                          </button>
                          <button
                            onClick={(e) => startEdit(item, e)}
                            className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm transition-all whitespace-nowrap hover:bg-white hover:text-black"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleAction(e, "delete", item.id)}
                            className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm transition-all whitespace-nowrap hover:bg-white hover:text-black"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] italic text-gray-400">
                          View Only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {[
                ...Array(
                  Math.max(0, (isExpanded ? 10 : 5) - inventoryList.length),
                ),
              ].map((_, i) => (
                <tr key={`empty-${i}`} className="h-14 border-b border-black">
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
        <div className="h-6 bg-white border-x border-b border-black rounded-b-[20px] shadow-sm mb-4"></div>
      </div>
    </div>
  );
};

export default Inventory;
