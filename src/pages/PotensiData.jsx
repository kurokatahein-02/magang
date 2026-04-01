import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

const PotensiData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nama_alpro: '',
    lokasi: '',
    tahun_pembuatan: '',
    tahun_operasi: '',
    jumlah: '',
    kapasitas_total: '',
    kapasitas_terpakai: '',
    status: 'idle',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/potensi-data');
      setData(response.data);
    } catch (error) {
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  const userRaw = localStorage.getItem("user");
  const role = userRaw ? JSON.parse(userRaw)?.role : "";

  const isReadOnly = role === "manager";

  const handleOpenModal = (item = null) => {
    if (isReadOnly) return;
    if (item) {
      setEditId(item.id);
      setFormData(item);
    } else {
      setEditId(null);
      setFormData({
        nama_alpro: '',
        lokasi: '',
        tahun_pembuatan: '',
        tahun_operasi: '',
        jumlah: '',
        kapasitas_total: '',
        kapasitas_terpakai: '',
        status: 'idle',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/potensi-data/${editId}`, formData);
      } else {
        await api.post('/potensi-data', formData);
      }
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data potensi telah disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data. Periksa kembali inputan Anda.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
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
        await api.delete(`/potensi-data/${id}`);
        Swal.fire("Dihapus!", "Data telah berhasil dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  const toggleStatus = async (item) => {
    if (isReadOnly) {
      return Swal.fire({
        icon: "info",
        title: "Akses Terbatas",
        text: "Manager hanya diperbolehkan melihat data.",
        confirmButtonColor: "#386097",
      });
    }
    const newStatus = item.status === 'idle' ? 'terpakai' : 'idle';
    const result = await Swal.fire({
      title: "Ubah Status?",
      text: `Apakah yakin ingin mengubah status menjadi ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#386097",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/potensi-data/${item.id}`, { ...item, status: newStatus });
        fetchData();
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Status telah diperbarui.",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire("Error", "Gagal memperbarui status", "error");
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 select-none">
      {!showForm ? (
        <>
          {/* Header Judul */}
          <div className="flex justify-center mb-6">
            <h3 className="font-bold text-xl uppercase tracking-widest">
              DATA POTENSI ALPRO
            </h3>
          </div>

          {/* Baris Aksi */}
          {!isReadOnly && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleOpenModal()}
                className="bg-[#386097] border border-black text-white rounded-full px-6 py-2 flex items-center gap-2 font-bold text-[10px] shadow-sm active:scale-95 transition-all hover:bg-white hover:text-black"
              >
                <span className="text-base">+</span> TAMBAH DATA POTENSI
              </button>
            </div>
          )}

          {/* Kontainer Tabel */}
          <div className="overflow-hidden rounded-[20px] border border-black bg-white shadow-xl">
            <table className="w-full text-center border-collapse table-fixed">
              <thead className="bg-[#386097] text-white">
                <tr>
                  <th className="w-12 p-3 border-r border-b border-black text-[11px] font-bold">NO</th>
                  <th className="p-3 border-r border-b border-black text-[11px] font-bold">NAMA ALPRO</th>
                  <th className="p-3 border-r border-b border-black text-[11px] font-bold">LOKASI</th>
                  <th className="p-3 border-r border-b border-black text-[11px] font-bold">THN BUAT/OPS</th>
                  <th className="w-20 p-3 border-r border-b border-black text-[11px] font-bold text-center">JUMLAH</th>
                  <th className="p-3 border-r border-b border-black text-[11px] font-bold">KAPASITAS (Terpakai/Total)</th>
                  <th className="w-24 p-3 border-r border-b border-black text-[11px] font-bold">STATUS</th>
                  <th className="w-48 p-3 border-b border-black text-[11px] font-bold">OPSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex justify-center items-center gap-2 font-bold text-xs">
                        <Loader2 className="animate-spin" size={16} /> MEMUAT DATA...
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {data.map((item, index) => (
                      <tr key={item.id} className="h-12 border-b border-black hover:bg-gray-50 transition-colors">
                        <td className="border-r border-black font-bold text-xs">{index + 1}</td>
                        <td className="border-r border-black text-xs px-2 text-left uppercase font-medium">{item.nama_alpro}</td>
                        <td className="border-r border-black text-xs px-2 text-left">{item.lokasi}</td>
                        <td className="border-r border-black text-xs">
                          {item.tahun_pembuatan} / {item.tahun_operasi}
                        </td>
                        <td className="border-r border-black text-xs font-bold text-center">{item.jumlah}</td>
                        <td className="border-r border-black text-xs">
                          {item.kapasitas_terpakai} / {item.kapasitas_total}
                        </td>
                        <td className="border-r border-black p-2">
                          <button
                            onClick={() => toggleStatus(item)}
                            className={`block w-full py-1 px-1 rounded-full text-[9px] font-black text-white shadow-sm uppercase transition-all ${isReadOnly ? 'cursor-default' : 'active:scale-95 hover:brightness-90'}
                              ${item.status === 'terpakai' ? 'bg-[#4ade80]' : 'bg-[#f87171]'}
                            `}
                          >
                            {item.status}
                          </button>
                        </td>
                        <td className="px-4">
                          {!isReadOnly ? (
                            <div className="flex justify-center gap-4 items-center">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="bg-[#386097] border border-black text-white rounded-md px-4 py-0.5 text-[9px] font-bold transition-all hover:bg-white hover:text-black"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-[#386097] border border-black text-white rounded-md px-4 py-0.5 text-[9px] font-bold transition-all hover:bg-white hover:text-black"
                              >
                                DELETE
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-gray-400">
                              View Only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {[...Array(Math.max(0, 10 - data.length))].map((_, i) => (
                      <tr key={`empty-${i}`} className="h-12 border-b border-black">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Form Data Potensi */
        <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
          <h3 className="mb-6 font-bold text-sm uppercase tracking-widest text-center">
            {editId ? 'EDIT DATA POTENSI' : 'TAMBAH DATA POTENSI'}
          </h3>
          <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-5xl shadow-sm flex flex-col gap-6 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <input
                    required
                    type="text"
                    placeholder="Nama Alpro ...."
                    className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
                    value={formData.nama_alpro}
                    onChange={(e) => setFormData({...formData, nama_alpro: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    required
                    type="text"
                    placeholder="Lokasi ...."
                    className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                  />
                </div>
                {[
                  { placeholder: 'Thn Pembuatan', key: 'tahun_pembuatan' },
                  { placeholder: 'Thn Operasi', key: 'tahun_operasi' },
                  { placeholder: 'Jumlah', key: 'jumlah' },
                  { placeholder: 'Kap. Total', key: 'kapasitas_total' },
                  { placeholder: 'Kap. Terpakai', key: 'kapasitas_terpakai' },
                ].map((field) => (
                  <div key={field.key}>
                    <input
                      required
                      type="number"
                      placeholder={field.placeholder + " ...."}
                      className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none"
                      value={formData[field.key]}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    />
                  </div>
                ))}
                <div className="relative">
                  <select
                    className="w-full p-3 rounded-lg border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="idle">STATUS: IDLE</option>
                    <option value="terpakai">STATUS: TERPAKAI</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-center gap-10 mt-10 font-bold">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
                >
                  KEMBALI
                </button>
                <button
                  type="submit"
                  className="px-20 py-3 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotensiData;