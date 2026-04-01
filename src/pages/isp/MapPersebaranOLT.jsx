import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ChevronDown,
  Download,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import api from '../../api';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Swal from "sweetalert2";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = "http://127.0.0.1:8000/api/olt-devices";

const LocationPicker = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(8),
        lng: lng.toFixed(8),
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

const MapPersebaranOLT = () => {
  const [view, setView] = useState("table");
  const [expandedView, setExpandedView] = useState(null);
  const [devices, setDevices] = useState([]);
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const role = userData?.role || "";

  const isReadOnly = role === "manager";

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    location: "",
    status_battery: "Good",
    lat: "",
    lng: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDevices = async () => {
    try {
      const response = await api.get(API_URL);
      const mappedData = response.data.data.map((d) => ({
        id: d.id,
        name: d.nama_perangkat,
        location: d.lokasi,
        battery: d.status_baterai,
        lat: parseFloat(d.latitude),
        lng: parseFloat(d.longitude),
      }));
      setDevices(mappedData);
    } catch (error) {
      console.error("Gagal memuat data OLT:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleExportExcel = () => {
    window.open(`${API_URL}/export`, "_blank");
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setFormData({
      id: item.id,
      name: item.name,
      location: item.location,
      status_battery: item.battery,
      lat: item.lat || "",
      lng: item.lng || "",
    });
    setView("edit");
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.lat) {
      return Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Mohon lengkapi Nama Perangkat, Lokasi, dan Koordinat!",
        confirmButtonText: "OK",
      });
    }

    const payload = {
      nama_perangkat: formData.name,
      lokasi: formData.location,
      latitude: formData.lat,
      longitude: formData.lng,
      status_baterai: formData.status_battery,
    };

    try {
      if (view === "edit") {
      await api.put(`${API_URL}/${formData.id}`, payload);
      } else {
      await api.post(API_URL, payload);
      }
      fetchDevices();
      resetForm();
      Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Data OLT berhasil disimpan!",
      confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat menyimpan data.",
      confirmButtonText: "OK",
      });
    }
  };

  const resetForm = () => {
    setView("table");
    setFormData({
      id: null,
      name: "",
      location: "",
      status_battery: "Good",
      lat: "",
      lng: "",
    });
    setSearchTerm("");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus Data",
      text: "Apakah Anda yakin ingin menghapus data perangkat OLT ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#386097",
    
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`${API_URL}/${id}`);
        fetchDevices();
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data OLT berhasil dihapus!",
          confirmButtonText: "OK",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan saat menghapus data.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleLocationInput = (query) => {
    setSearchTerm(query);
    setFormData({ ...formData, location: query });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchLocation(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchLocation = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1`,
        { headers: { "User-Agent": "TIF-Dashboard-App" } },
      );
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
    setSuggestions([]);
  };

  const updateBatteryStatus = async (id, newStatus) => {
    // 1. Validasi Konfirmasi
    const result = await Swal.fire({
      icon: "question",
      title: "Ubah Status Baterai",
      text: `Apakah Anda yakin ingin mengubah status baterai menjadi ${newStatus.toUpperCase()}?`,
      showCancelButton: true,
      confirmButtonText: "Ubah",
      cancelButtonText: "Batal",
      confirmButtonColor: "#386097",
      cancelButtonColor: "#d9d9d9",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.patch(`${API_URL}/${id}/status-battery`, {
        status_baterai: newStatus,
      });

      if (response.data.success) {
        // 2. Refresh data tabel
        fetchDevices();
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Status baterai berhasil diperbarui!",
          confirmButtonText: "OK",
        });
        console.log("Status baterai diperbarui ke:", newStatus);
      }
    } catch (error) {
      console.error("Gagal memperbarui status baterai:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat memperbarui status baterai.",
        confirmButtonText: "OK",
      });
    }
  };

  if (view === "form" || view === "edit") {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn py-10 px-4">
        {/* Header Style Sesuai SITAC */}
        <h3 className="mb-8 font-bold text-xl uppercase tracking-widest text-center">
          MAP PERSEBARAN OLT (ISP)
        </h3>
        {/* Kontainer Style Sesuai SITAC */}
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-10 w-full max-w-2xl shadow-sm flex flex-col gap-6 relative">
          <div className="space-y-4">
            {/* Input Nama Perangkat */}
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukan Nama Perangkat ...."
              className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none placeholder-gray-500"
            />

            {/* Input Lokasi dengan Dropdown Autocomplete */}
            <div className="relative">
              <input
                value={formData.location}
                onChange={(e) => handleLocationInput(e.target.value)}
                placeholder="Masukan Lokasi ...."
                className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none placeholder-gray-500"
              />
              <MapPin
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
              />

              {suggestions.length > 0 && (
                <ul className="absolute z-[1000] w-full bg-white border border-black rounded-xl mt-1 shadow-2xl max-h-60 overflow-y-auto">
                  {suggestions.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => selectLocation(item)}
                      className="p-3 text-[11px] hover:bg-[#386097] hover:text-white cursor-pointer border-b border-gray-100 last:border-none transition-colors"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Map Container Style Sesuai SITAC */}
            <div className="h-48 w-full border border-black rounded-xl overflow-hidden">
              <MapContainer
                center={
                  formData.lat
                    ? [formData.lat, formData.lng]
                    : [-7.566, 110.831]
                }
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker setFormData={setFormData} />
                {formData.lat && (
                  <Marker position={[formData.lat, formData.lng]} />
                )}
                <RecenterMap lat={formData.lat} lng={formData.lng} />
              </MapContainer>
            </div>

            <p className="text-[10px] text-gray-500 italic">
              *Klik peta untuk koordinat: {formData.lat || "0"},{" "}
              {formData.lng || "0"}
            </p>

            {/* Input Status Baterai - Mengikuti pola input SITAC namun menggunakan select */}
            <div className="relative">
              <select
                value={formData.status_battery}
                onChange={(e) =>
                  setFormData({ ...formData, status_battery: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-black bg-[#d9d9d9] italic px-6 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="Good">STATUS BATERAI: GOOD</option>
                <option value="Average">STATUS BATERAI: AVERAGE</option>
                <option value="Bad">STATUS BATERAI: BAD</option>
              </select>
              <ChevronDown
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
              />
            </div>
          </div>

          {/* Tombol Aksi Style Sesuai SITAC */}
          <div className="flex justify-center gap-6 mt-4 font-bold">
            <button
              onClick={resetForm}
              className="px-12 py-3 bg-[#d9d9d9] border border-black rounded-xl hover:bg-white transition-all uppercase shadow-sm"
            >
              KEMBALI
            </button>
            <button
              onClick={handleSave}
              className="px-12 py-3 bg-[#d9d9d9] border border-black rounded-xl hover:bg-white transition-all uppercase shadow-sm"
            >
              SIMPAN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 select-none relative px-4 overflow-hidden">
      <div
        className={`flex flex-col h-full transition-all duration-500 ${expandedView ? "absolute inset-0 z-50 bg-[#f8f9fa] p-8" : "gap-6"}`}
      >
        <div className="relative flex items-center justify-center min-h-[40px]">
          {expandedView && (
            <button
              onClick={() => setExpandedView(null)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            >
              ←
            </button>
          )}
          <h3 className="font-bold text-xl uppercase tracking-widest">
            MAP PERSEBARAN OLT
          </h3>
        </div>

        {expandedView !== "table" && (
          <div
            className={`${expandedView === "map" ? "flex-1" : "h-72"} bg-white border border-black rounded-[30px] overflow-hidden shadow-inner relative z-10`}
          >
            {!expandedView && (
              <div
                onClick={() => setExpandedView("map")}
                className="absolute top-4 right-4 z-[1000] bg-white/80 p-2 rounded-lg border border-black cursor-pointer hover:bg-white font-bold text-[10px] shadow-md uppercase"
              >
                Perbesar Map
              </div>
            )}
            <MapContainer
              center={[-7.566, 110.831]}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {devices.map(
                (v) =>
                  v.lat &&
                  v.lng && (
                    <Marker key={v.id} position={[v.lat, v.lng]}>
                      <Tooltip
                        permanent
                        direction="top"
                        offset={[0, -10]}
                        className="shadow-lg border-black rounded-md p-2 bg-white"
                      >
                        <div className="flex flex-col items-center text-center leading-tight">
                          <span className="font-bold text-[10px] uppercase text-[#1a536e] border-b border-gray-200 mb-1 w-full pb-1">
                            {v.name}
                          </span>
                          <span className="text-[9px] text-gray-600 italic mb-1">
                            {v.location}
                          </span>
                          <span
                            className={`text-[8px] font-bold px-2 rounded-full border ${v.battery === "Good" ? "bg-green-100 text-green-700 border-green-200" : v.battery === "Average" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-100 text-red-700 border-red-200"}`}
                          >
                            BATERAI: {v.battery.toUpperCase()}
                          </span>
                        </div>
                      </Tooltip>
                    </Marker>
                  ),
              )}
            </MapContainer>
          </div>
        )}

        {!expandedView && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportExcel}
              className="bg-[#51A0D2] text-white border border-black rounded-full px-6 py-2 flex items-center gap-2 font-bold text-xs shadow-sm hover:bg-black transition-all"
            >
              <Download size={18} /> Download Excel
            </button>
            {!isReadOnly && (
              <button
                onClick={() => setView("form")}
                className="bg-[#386097] border text-white rounded-full px-6 py-2 flex items-center gap-2 font-bold text-xs shadow-sm transition-all hover:bg-white hover:text-black"
              >
                <Plus size={18} /> Tambah Perangkat OLT
              </button>
            )}
          </div>
        )}

        {expandedView !== "map" && (
          <div
            onClick={() => !expandedView && setExpandedView("table")}
            className={`${expandedView === "table" ? "flex-1 overflow-auto" : "transition-all cursor-pointer hover:scale-[1.002]"}`}
          >
            <div className="overflow-hidden rounded-t-[20px] border-x border-t border-black bg-white shadow-xl">
              <table className="w-full text-center border-collapse table-fixed">
                <thead className="bg-[#386097]">
                  <tr className="text-[11px] font-bold">
                    <th className="w-12 p-3 border-r border-b text-white">
                      NO
                    </th>
                    <th className="p-3 border-r border-b text-white">
                      Nama Perangkat
                    </th>
                    <th className="p-3 border-r border-b text-white">
                      Lokasi
                    </th>
                    <th className="p-3 border-r border-b text-white">
                      Koordinat
                    </th>
                    <th className="w-32 p-3 border-r border-b text-white">
                      Status Baterai
                    </th>
                    <th className="w-40 p-3 border-b text-white">
                      Opsi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((v, i) => (
                    <tr
                      key={v.id}
                      className="h-14 border-b border-black hover:bg-gray-50 transition-colors"
                    >
                      <td className="border-r border-black font-bold text-xs">
                        {i + 1}
                      </td>
                      <td className="border-r border-black text-[10px] px-3 text-left font-bold">
                        {v.name}
                      </td>
                      <td className="border-r border-black text-[9px] px-3 text-left italic leading-tight">
                        {v.location}
                      </td>
                      <td className="border-r border-black text-[9px] font-mono">
                        {v.lat}, {v.lng}
                      </td>
                      <td className="border-r border-black px-2">
                        <div className="relative group">
                          <select
                            disabled={isReadOnly}
                            value={v.battery}
                            onMouseDown={(e) => {
                              if (isReadOnly) e.preventDefault();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateBatteryStatus(v.id, e.target.value)}
                            className={`w-full py-1 rounded-full text-[9px] font-bold border text-center appearance-none transition-all shadow-sm
                              ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}
                              ${v.battery === 'Good' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 
                                v.battery === 'Average' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100' : 
                                'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                          >
                            <option value="Good">GOOD</option>
                            <option value="Average">AVERAGE</option>
                            <option value="Bad">BAD</option>
                          </select>
                          {!isReadOnly && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100">
                              <ChevronDown size={8} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex justify-center gap-2">
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={(e) => startEdit(v, e)}
                                className="bg-[#386097] border text-white rounded px-3 py-1 text-[10px] font-bold transition-all hover:bg-white hover:text-black "
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDelete(v.id, e)}
                                className="bg-[#386097] border text-white rounded px-3 py-1 text-[10px] font-bold transition-all hover:bg-white hover:text-black"
                              >
                                Delete
                              </button>
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
    </div>
  );
};

export default MapPersebaranOLT;
