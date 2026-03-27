import React, { useState, useEffect } from 'react';
import { MapPin, Download } from 'lucide-react';
import api from '../../api';

const API_URL = 'http://127.0.0.1:8000/api/inventories';

const InventoryISP = () => {
  const [view, setView] = useState('table'); 
  const[expandedTable, setExpandedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const[showNotification, setShowNotification] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  
  // State form tanpa 'unit' karena akan di-hardcode ke 'isp'
  const[formData, setFormData] = useState({ id: null, name: '', amount: '', location: '' });

  const isExpanded = expandedTable === 'inventory';

  // --- EXPORT EXCEL KHUSUS ISP ---
  const handleExportExcel = async () => {
    try {
      const response = await api.get("/inventories/export", {
        params: {
          unit: "ISP", // Pastikan export hanya untuk OSP
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
      const fileName = `Inventory_ISP ${formattedDate}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Gagal export inventory:", error);
      alert("Gagal mengunduh laporan Inventori.");
    }
  };

  // --- FETCH DATA KHUSUS ISP ---
  const fetchInventory = async () => {
    try {
      const response = await api.get(API_URL, {
        params: {
          unit: 'isp', // Paksa hanya narik data ISP
          search: searchTerm
        }
      });
      
      const mappedData = response.data.data.map(item => ({
        id: item.id,
        name: item.nama_barang,
        amount: item.jumlah_barang,
        location: item.lokasi
      }));
      
      setInventoryList(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // --- LOGIC ---
  const resetForm = () => {
    setView('table');
    setFormData({ id: null, name: '', amount: '', location: '' });
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setFormData(item);
    setView('edit');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount) return alert("Nama barang dan jumlah wajib diisi!");

    try {
      const payload = {
        nama_barang: formData.name,
        jumlah_barang: formData.amount,
        unit: 'ISP', // Paksa simpan sebagai ISP
        lokasi: formData.location
      };

      if (view === 'edit') {
        await api.put(`${API_URL}/${formData.id}`, payload);
      } else {
        await api.post(API_URL, payload);
      }
      
      fetchInventory();
      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleAction = async (e, type, id) => {
    e.stopPropagation();
    if (type === 'delete') {
      if (window.confirm("Hapus barang dari inventory?")) {
        try {
          await api.delete(`${API_URL}/${id}`);
          fetchInventory();
        } catch (error) {
          console.error("Gagal menghapus data:", error);
        }
      }
    }
  };

  // --- VIEW: FORM ---
  if (view === 'form' || view === 'edit') {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-6 font-bold text-sm uppercase tracking-widest text-center">INVENTORY CONTROL (DIVISI ISP)</h3>
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-5xl shadow-sm flex flex-col gap-6">
          <div className="space-y-6">
            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukan Nama Barang ...." className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none" />
            
            <div className="flex gap-4">
              <input value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="Jumlah Barang ...." className="w-1/2 p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none" />
              
              {/* Dropdown Unit Dihapus Karena Pasti ISP */}

              <div className="relative w-1/2">
                <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Lokasi ...." className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none" />
                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button onClick={resetForm} className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase shadow-sm">KEMBALI</button>
            <button onClick={handleSave} className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase shadow-sm">SIMPAN</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: MAIN TABLE ---
  return (
    <div className={`h-full flex flex-col select-none relative transition-all duration-500 ${isExpanded ? 'absolute inset-0 z-50 bg-[#f8f9fa] p-8' : 'px-4 gap-6'}`}>
      
      <div className={`relative flex items-center justify-center ${isExpanded ? 'mb-8' : 'min-h-[40px]'}`}>
        {isExpanded && (
          <button onClick={() => setExpandedTable(null)} className="absolute left-0 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold text-2xl hover:scale-110 transition-all">←</button>
        )}
        <h3 className={`font-bold uppercase tracking-[0.2em] ${isExpanded ? 'text-xl' : 'text-sm'}`}>INVENTORY - DIVISI ISP</h3>
      </div>

      {!isExpanded && (
        <>
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CARI NAMA BARANG ATAU LOKASI ...." 
              className="flex-1 p-2.5 rounded-full border border-black bg-white italic px-8 focus:outline-none shadow-sm text-xs tracking-widest" 
            />
          </div>

          {/* Baris Tombol Aksi */}
          <div className="flex justify-between items-end mb-4">
            {/* Ruang Kosong (Bekas Filter Unit) */}
            <div></div>

            {/* Group Tombol Aksi di Kanan */}
            <div className="flex gap-3">
              <button 
                onClick={handleExportExcel}
                className="bg-[#386097] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all">
                <Download size={14} /> Download Excel
              </button>

              {/* ISP Bebas Tambah Inventory */}
              <button 
                onClick={() => setView('form')} 
                className="bg-[#51A0D2] border text-white rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[9px] shadow-sm active:scale-95 transition-all hover:bg-white hover:text-black"
              >
                <span className="text-base">+</span> Tambah Inventori
              </button>
            </div>
          </div>
        </>
      )}

      <div 
        onClick={() => !isExpanded && setExpandedTable('inventory')}
        className={`flex flex-col transition-all duration-300 ${!isExpanded ? 'cursor-pointer hover:scale-[1.002]' : 'flex-1'}`}
      >
        <div className="overflow-hidden rounded-t-[20px] border-x border-t border-black bg-white shadow-xl">
          <table className="w-full text-center border-collapse table-fixed">
            <thead className="bg-[#386097]">
              <tr>
                <th className="w-12 p-3 border-r border-b text-white text-[11px] font-bold">NO</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Nama Barang</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Jumlah Barang</th>
                {/* Kolom Unit Dihapus Karena Semuanya Pasti ISP */}
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">Lokasi</th>
                <th className="w-48 p-3 border-b text-white text-[11px] font-bold">Opsi</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item, index) => (
                <tr key={item.id} className="h-12 border-b border-black hover:bg-gray-50 transition-colors">
                  <td className="border-r border-black font-bold text-xs">{index + 1}</td>
                  <td className="border-r border-black text-xs px-2 text-left">{item.name}</td>
                  <td className="border-r border-black text-xs px-2 text-left">{item.amount}</td>
                  <td className="border-r border-black text-xs px-2 text-left">{item.location}</td>
                  <td className="px-4">
                    {/* ISP Bebas Edit dan Delete */}
                    <div className="flex justify-center items-center gap-6">
                      <button onClick={(e) => startEdit(item, e)} className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm  transition-all hover:bg-white hover:text-black">Edit</button>
                      <button onClick={(e) => handleAction(e, 'delete', item.id)} className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm  transition-all hover:bg-white hover:text-black">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty Rows Padding (Disesuaikan jadi 5 Kolom) */}
              {[...Array(Math.max(0, (isExpanded ? 10 : 5) - inventoryList.length))].map((_, i) => (
                <tr key={`empty-${i}`} className="h-14 border-b border-black">
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

export default InventoryISP;