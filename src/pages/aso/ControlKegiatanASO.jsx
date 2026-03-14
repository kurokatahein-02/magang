import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, Download } from 'lucide-react';
import axios from 'axios';

// Konfigurasi Base URL Laravel
const API_URL = 'http://127.0.0.1:8000/api/activities';

const ControlKegiatanASO = () => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('table'); 
  const [isExpanded, setIsExpanded] = useState(false);
  const [activities, setActivities] = useState([]);
  
  // Perhatikan: unit otomatis diset ke 'ASO'
  const [formData, setFormData] = useState({ id: null, name: '', unit: 'aso', startDate: '', status: 'Open' });
  const[searchTerm, setSearchTerm] = useState('');

  const handleExportExcel = () => {
    // Memaksa ekspor hanya untuk data ASO
    const queryParams = new URLSearchParams({
      unit: 'aso',
      search: searchTerm
    }).toString();

    window.open(`${API_URL}/export?${queryParams}`, '_blank');
  };

  // --- FETCH DATA DARI BACKEND KHUSUS ASO ---
  const fetchActivities = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          unit: 'aso', // <--- MEMAKSA HANYA AMBIL DATA ASO
          search: searchTerm
        }
      });

      const mappedData = response.data.data.map(item => ({
        id: item.id,
        name: item.nama_kegiatan,
        unit: item.unit,
        startDate: item.tanggal_mulai,
        endDate: item.tanggal_berakhir || '-',
        status: item.status
      }));
      setActivities(mappedData);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const getRealtimeDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months =["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // --- LOGIKA ACTIONS ---

  // Simpan Data Baru (Otomatis ASO)
  const handleSaveNew = async () => {
    if(!formData.name || !formData.startDate) return alert("Isi data terlebih dahulu!");
    
    try {
      await axios.post(API_URL, {
        nama_kegiatan: formData.name,
        unit: 'aso', // Pastikan tersimpan sebagai ASO
        tanggal_mulai: formData.startDate,
        status: 'Open'
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
        unit: 'aso', // Pastikan tersimpan sebagai ASO
        tanggal_mulai: formData.startDate,
        status: formData.status,
        tanggal_berakhir: formData.status === 'Close' ? getRealtimeDate() : null
      };
      
      await axios.put(`${API_URL}/${formData.id}`, payload);
      fetchActivities();
      resetForm();
    } catch (error) {
      alert("Gagal memperbarui data");
    }
  };

  // Ubah Status Langsung
  const toggleStatus = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`);
      if (response.data.success) {
        fetchActivities(); 
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Hapus data ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', unit: 'aso', startDate: '', status: 'Open' });
    setView('table');
  };

  const startEdit = (item) => {
    setFormData(item);
    setView('edit');
  };

  // --- RENDER FORM (INPUT & EDIT) ---
  if (view === 'form' || view === 'edit') {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-8 font-bold text-sm uppercase tracking-widest text-center">MONITORING KEGIATAN (DIVISI ASO)</h3>
        
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-4xl shadow-sm flex flex-col gap-6">
          <div className="space-y-6">
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Masukan Nama Kegiatan ...." 
              className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
            />
            
            {/* Input Unit Dihilangkan Karena Sudah Pasti ASO */}

            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
                />
              </div>

              {/* Status hanya muncul saat mode edit, ASO diizinkan merubah ini */}
              {view === 'edit' && (
                <div className="relative flex-1">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button onClick={resetForm} className="px-16 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase">KEMBALI</button>
            <button onClick={view === 'edit' ? handleUpdate : handleSaveNew} className="px-16 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase">SIMPAN</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER TABEL ---
  return (
    <div className={`h-full flex flex-col gap-4 select-none transition-all duration-500 ${isExpanded ? 'absolute inset-0 z-50 bg-[#f8f9fa] p-8' : 'relative'}`}>
      
      {!isExpanded && (
        <>
          <div className="flex justify-center mb-6">
            <h3 className="font-bold text-xl uppercase tracking-widest">MONITORING KEGIATAN (DIVISI ASO)</h3>
          </div>

          <div className="flex gap-4 mb-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CARI KEGIATAN ATAU STATUS ...." 
              className="flex-1 p-2.5 rounded-full border border-black bg-white italic px-8 focus:outline-none shadow-sm text-xs tracking-widest" 
            />
          </div>

          <div className="flex justify-between items-end mb-4">
            {/* Filter OSP/ASO/ALL dihilangkan sebagai spacer kosong */}
            <div></div>

            <div className="flex gap-3">
              <button 
                onClick={handleExportExcel}
                className="bg-[#1a536e] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm hover:bg-black transition-all"><Download size={14} 
                /> Download Excel
              </button>

              <button 
                onClick={() => setView('form')} 
                className="bg-[#56a8c7] border border-black rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[9px] shadow-sm hover:bg-[#4a97b5] active:scale-95 transition-all"
              >
                <span className="text-base">+</span> Tambah Kegiatan
              </button>
            </div>
          </div>
        </>
      )}

      {isExpanded && (
        <div className="relative mb-6">
          <button onClick={() => setIsExpanded(false)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold text-xl">←</button>
          <h3 className="text-center font-bold text-xl uppercase tracking-widest">MONITORING KEGIATAN (DIVISI ASO)</h3>
        </div>
      )}

      <div onClick={() => !isExpanded && setIsExpanded(true)} className={`overflow-hidden rounded-[20px] border border-black bg-white shadow-xl transition-all ${!isExpanded ? 'cursor-pointer hover:scale-[1.002]' : ''}`}>
        <table className="w-full text-center border-collapse table-fixed">
          <thead className="bg-[#56a8c7] text-black">
            <tr>
              <th className="w-12 p-3 border-r border-b border-black text-[11px] font-bold">NO</th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">Nama Kegiatan</th>
              {/* Kolom Nama Unit dihapus karena sudah pasti ASO */}
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">Tanggal Mulai</th>
              <th className="p-3 border-r border-b border-black text-[11px] font-bold">Tanggal Berakhir</th>
              <th className="w-24 p-3 border-r border-b border-black text-[11px] font-bold">Status</th>
              <th className="w-48 p-3 border-b border-black text-[11px] font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item, index) => (
              <tr key={item.id} className="h-12 border-b border-black hover:bg-gray-50 transition-colors">
                <td className="border-r border-black font-bold text-xs">{index + 1}</td>
                <td className="border-r border-black text-xs px-2 text-left">{item.name}</td>
                <td className="border-r border-black text-xs">{item.startDate}</td>
                <td className="border-r border-black text-xs">{item.endDate}</td>
                <td className="border-r border-black p-2">
                  {/* Status Togle untuk ASO, bebas diklik dengan efek hover */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleStatus(item.id); 
                    }}
                    className={`w-full py-1 px-3 rounded-full text-[10px] font-bold text-white transition-all shadow-md cursor-pointer active:scale-90
                    ${item.status === 'Open' ? 'bg-[#4ade80] hover:bg-[#22c55e]' : 'bg-[#f87171] hover:bg-[#ef4444]'}`}
                  >
                    {item.status}
                  </button>
                </td>
                <td className="px-4">
                  {/* Edit & Delete bebas digunakan oleh ASO */}
                  <div className="flex justify-center gap-4 h-full items-center">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} className="bg-[#56a8c7] border border-black rounded-md px-4 py-0.5 text-[9px] font-bold hover:bg-white transition-all">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="bg-[#56a8c7] border border-black rounded-md px-4 py-0.5 text-[9px] font-bold hover:bg-white transition-all">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {/* Empty Rows Padding */}
            {[...Array(Math.max(0, (isExpanded ? 15 : 10) - activities.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="h-12 border-b border-black">
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

export default ControlKegiatanASO;