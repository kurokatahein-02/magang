import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CalendarDays, FileText, Eye, Download, Map as MapIcon, ChevronDown, Plus } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://127.0.0.1:8000/api/laporan-sitacs';

const LocationPicker = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData(prev => ({
        ...prev,
        lat: lat.toFixed(8),
        lng: lng.toFixed(8)
      }));
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const ControlSitac = () => {
  const [view, setView] = useState('table'); 
  const [expandedView, setExpandedView] = useState(null); 
  const [showNotification, setShowNotification] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const userRaw = localStorage.getItem('user');
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const role = userData?.role || '';

// Variabel Sakti
const isReadOnly = role === 'manager';
const isSuperAdmin = role === 'superadmin';
  
  const [formData, setFormData] = useState({ 
    id: null, name: '', location: '', startDate: '', endDate: '', status: 'Open', lat: '', lng: '' 
  });
  // State untuk menyimpan daftar saran lokasi dari API
  const [searchTerm, setSearchTerm] = useState(''); // State baru untuk menampung ketikan
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(API_URL);
      const mappedData = response.data.data.map(v => ({
        id: v.id,
        name: v.nama_vendor,
        location: v.lokasi,
        startDate: v.tanggal_mulai,
        endDate: v.tanggal_berakhir || '-',
        docUrl: v.dokumen_url,
        docName: v.dokumen ? v.dokumen.split('/').pop() : 'Tidak ada dokumen',
        status: v.status,
        lat: parseFloat(v.latitude),
        lng: parseFloat(v.longitude)
      }));
      setVendors(mappedData);
    } catch (error) {
      console.error("Gagal memuat data vendor:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDownload = (item, e) => {
    e?.stopPropagation(); 
    if (!item?.docUrl) return alert("Dokumen tidak tersedia");
    window.open(item.docUrl, '_blank');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const toggleStatus = async (id, e) => {
  if (e && e.stopPropagation) e.stopPropagation();

  try {
    // 1. Kirim permintaan perubahan status ke Laravel
    const response = await axios.patch(`${API_URL}/${id}/status`);
    
    if (response.data && response.data.success) {
      // 2. Sangat Penting: Panggil fetchVendors() agar React menarik data terbaru 
      // yang sudah berisi "tanggal_berakhir" dari database.
      await fetchVendors(); 
      
      console.log("Update Berhasil:", response.data.data.status, "Tanggal:", response.data.data.tanggal_berakhir);
    }
  } catch (error) {
    console.error("Gagal mengubah status:", error);
    alert("Terjadi kesalahan sistem saat memperbarui status.");
  }
};

  const openDocViewer = (item, e) => {
    e.stopPropagation(); 
    setSelectedDoc(item);
    setExpandedView('doc');
  };

  const startEdit = (item, e) => {
    e.stopPropagation(); 
    setFormData({
      id: item.id,
      name: item.name,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate === '-' ? '' : item.endDate,
      status: item.status,
      lat: item.lat || '',
      lng: item.lng || ''
    });
    setSelectedFile(null);
    setView('edit');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.startDate) {
      return alert("Mohon lengkapi data utama!");
    }

    const data = new FormData();
    data.append('nama_vendor', formData.name);
    data.append('lokasi', formData.location);
    data.append('tanggal_mulai', formData.startDate);
    if (formData.endDate) data.append('tanggal_berakhir', formData.endDate);
    if (formData.lat) data.append('latitude', formData.lat);
    if (formData.lng) data.append('longitude', formData.lng);
    if (selectedFile) data.append('dokumen', selectedFile);
    data.append('status', formData.status);

    try {
      if (view === 'edit') {
        data.append('_method', 'PUT');
        await axios.post(`${API_URL}/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(API_URL, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchVendors();
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan data vendor.");
    }
  };

  const resetForm = () => {
    setView('table');
    setFormData({ id: null, name: '', location: '', startDate: '', endDate: '', status: 'Open', lat: '', lng: '' });
    setSelectedFile(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(window.confirm("Hapus data vendor ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchVendors();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };
  
  // Fungsi ini hanya sekadar mengupdate text input
  const handleLocationInput = (query) => {
    setSearchTerm(query);
    setFormData({ ...formData, location: query });
  };

  // Logika Debouncing: Tunggu 800ms setelah berhenti mengetik baru panggil API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchLocation(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 800); // Jeda 800 milidetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fungsi asli yang memanggil API
  const searchLocation = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TIF-Dashboard-App' // Menambahkan User-Agent agar tidak diblokir
          }
        }
      );
      if (response.status === 429) {
        alert("Terlalu banyak permintaan. Tunggu sebentar ya pak...");
        return;
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (item) => {
    setFormData({
      ...formData,
      location: item.display_name,
      lat: parseFloat(item.lat).toFixed(8),
      lng: parseFloat(item.lon).toFixed(8),
    });
    setSuggestions([]); // Tutup dropdown setelah memilih
  };

  if (view === 'form' || view === 'edit') {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn py-10 px-4">
        <h3 className="mb-8 font-bold text-xl uppercase tracking-widest text-center">MONITORING PIHAK KE TIGA</h3>
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-10 w-full max-w-2xl shadow-sm flex flex-col gap-6 relative">
          <div className="space-y-4">
            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukan Nama Vendor ...." className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none placeholder-gray-500" />

            {/* Input Lokasi dengan Fitur Autocomplete */}
            <div className="relative">
              <input 
                value={formData.location} 
                onChange={(e) => handleLocationInput(e.target.value)} // Ganti ke fungsi input baru
                placeholder="Masukan Lokasi ...."
                className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none placeholder-gray-500" 
              />
              <MapPin size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" />
              
              {/* Dropdown Saran Lokasi */}
              {suggestions.length > 0 && (
                <ul className="absolute z-[1000] w-full bg-white border border-black rounded-xl mt-1 shadow-2xl max-h-60 overflow-y-auto">
                  {suggestions.map((item, index) => (
                    <li 
                      key={index}
                      onClick={() => selectLocation(item)}
                      className="p-3 text-[11px] hover:bg-[#56a8c7] hover:text-white cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {isSearching && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] italic text-gray-500">
                  Mencari...
                </div>
              )}
            </div>

            <div className="h-48 w-full border border-black rounded-xl overflow-hidden">
               <MapContainer center={formData.lat ? [formData.lat, formData.lng] : [-7.566, 110.831]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker setFormData={setFormData} />
                  {formData.lat && <Marker position={[formData.lat, formData.lng]} />}
                  <RecenterMap lat={formData.lat} lng={formData.lng} />
               </MapContainer>
            </div>
            <p className="text-[10px] text-gray-500 italic">*Klik peta untuk koordinat: {formData.lat || '0'}, {formData.lng || '0'}</p>
            <div className="relative">
              <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} placeholder="Tanggal Mulai ...." className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none" />
              
            </div>
            <div className="relative">
              <input type="text" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} placeholder="Tanggal Berakhir ...." className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none" />
              
            </div>
            <div className="relative">
              <input type="text" readOnly value={selectedFile ? selectedFile.name : (formData.docName || "Masukan Dokumen ....")} onClick={() => fileInputRef.current.click()} className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none cursor-pointer" />
              <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" accept=".pdf" />
              <FileText size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" />
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 font-bold">
            <button onClick={resetForm} className="px-12 py-3 bg-[#d9d9d9] border border-black rounded-xl hover:bg-white transition-all uppercase shadow-sm">KEMBALI</button>
            <button onClick={handleSave} className="px-12 py-3 bg-[#d9d9d9] border border-black rounded-xl hover:bg-white transition-all uppercase shadow-sm">SIMPAN</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 select-none relative px-4 overflow-hidden">
      {expandedView === 'doc' && (
        <div className="absolute inset-0 z-[60] bg-[#f8f9fa] p-8 animate-fadeIn flex flex-col">
          <button onClick={() => setExpandedView(null)} className="mb-4 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md">←</button>
          <iframe src={selectedDoc?.docUrl} className="flex-1 w-full rounded-xl border border-black shadow-2xl" title="PDF Viewer" />
        </div>
      )}

      {expandedView !== 'doc' && (
        <div className={`flex flex-col h-full transition-all duration-500 ${expandedView ? 'absolute inset-0 z-50 bg-[#f8f9fa] p-8' : 'gap-6'}`}>
          <div className="relative flex items-center justify-center min-h-[40px]">
             {expandedView && <button onClick={() => setExpandedView(null)} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center">←</button>}
             <h3 className="font-bold text-xl uppercase tracking-widest">MONITORING PIHAK KE TIGA</h3>
          </div>

          {/* --- MAP SECTION UTAMA --- */}
          {expandedView !== 'table' && (
            <div className={`${expandedView === 'map' ? 'flex-1' : 'h-72'} bg-white border border-black rounded-[30px] overflow-hidden transition-all duration-500 shadow-inner relative z-10`}>
              {!expandedView && (
                <div onClick={() => setExpandedView('map')} className="absolute top-4 right-4 z-[1000] bg-white/80 p-2 rounded-lg border border-black cursor-pointer hover:bg-white font-bold text-[10px] shadow-md uppercase">Perbesar Map</div>
              )}
              <MapContainer center={[-7.566, 110.831]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {vendors.map(v => v.lat && v.lng && (
                  <Marker key={v.id} position={[v.lat, v.lng]}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold text-xs mb-1">{v.name}</h4>
                        <p className="text-[10px]">{v.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {!expandedView && (
            <div className="flex items-center gap-4">
              {!isReadOnly && (
              <button onClick={() => setView('form')} className="bg-[#56a8c7] border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-xs shadow-sm hover:bg-[#4a97b5] transition-all"><Plus size={18} /> Tambah Pihak Ke SITAC</button>
              )}
              </div>
          )}

          {expandedView !== 'map' && (
            <div onClick={() => !expandedView && setExpandedView('table')} className={`${expandedView === 'table' ? 'flex-1 overflow-auto' : 'transition-all cursor-pointer hover:scale-[1.002]'}`}>
              <div className="overflow-hidden rounded-t-[20px] border-x border-t border-black bg-white shadow-xl">
                <table className="w-full text-center border-collapse table-fixed">
                  <thead className="bg-[#56a8c7]">
                    <tr className="text-[11px] font-bold">
                      <th className="w-12 p-3 border-r border-b border-black text-[11px] font-bold">NO</th>
                      <th className="p-3 border-r border-b border-black text-[11px] font-bold">Nama Vendor</th>
                      <th className="p-3 border-r border-b border-black text-[11px] font-bold">Lokasi</th>
                      <th className="p-3 border-r border-b border-black text-[11px] font-bold">Tanggal Mulai</th>
                      <th className="p-3 border-r border-b border-black text-[11px] font-bold">Tanggal Berakhir</th>
                      <th className="p-3 border-r border-b border-black text-[11px] font-bold">Dokumen</th>
                      <th className="w-24 p-3 border-r border-b border-black text-[11px] font-bold">Status</th>
                      <th className="w-48 p-3 border-b border-black text-[11px] font-bold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr key={v.id} className="h-14 border-b border-black hover:bg-gray-50 transition-colors">
                        <td className="border-r border-black font-bold text-xs">{i + 1}</td>
                        <td className="border-r border-black text-[10px] px-3 text-left leading-tight">{v.name}</td>
                        <td className="border-r border-black text-[9px] px-3 text-left leading-tight">{v.location}</td>
                        <td className="border-r border-black text-[10px]">{v.startDate}</td>
                        <td className="border-r border-black text-[10px]">{v.endDate}</td>
                        <td className="border-r border-black text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={(e) => openDocViewer(v, e)} className="p-1.5 bg-[#56a8c7] border border-black rounded hover:bg-white transition-all"><Eye size={14} /></button>
                            <button onClick={(e) => handleDownload(v, e)} className="p-1.5 bg-[#56a8c7] border border-black rounded hover:bg-white transition-all"><Download size={14} /></button>
                          </div>
                        </td>
                        <td className="border-r border-black px-2">
                          <button onClick={(e) => { 
                            e.stopPropagation(); // Mencegah klik menembus ke baris tabel
                            if (isSuperAdmin) {
                              toggleStatus(v.id, e); // Hanya panggil fungsi jika Super Admin
                            }
                          }} 
                          className={`w-full py-1 rounded-full text-[10px] font-bold text-white shadow-md transition-all 
                            ${isSuperAdmin ? 'cursor-pointer active:scale-90' : 'cursor-default'}
                            ${v.status === 'Open' 
                              ? `bg-[#4ade80] ${isSuperAdmin ? 'hover:bg-[#22c55e]' : ''}` 
                              : `bg-[#f87171] ${isSuperAdmin ? 'hover:bg-[#ef4444]' : ''}`
                            }`}>{v.status}
                            </button>
                        </td>
                        <td className="px-4">
                          <div className="flex justify-center gap-3">
                            {!isReadOnly && (
                              <>
                            <button onClick={(e) => startEdit(v, e)} className="bg-[#56a8c7] border border-black rounded px-3 py-1 text-[10px] font-bold hover:bg-white transition-all">Edit</button>
                            <button onClick={(e) => handleDelete(v.id, e)} className="bg-[#56a8c7] border border-black rounded px-3 py-1 text-[10px] font-bold hover:bg-white transition-all">Delete</button>
                            </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-6 bg-white border-x border-b border-black rounded-b-[20px] shadow-sm mb-4"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlSitac;