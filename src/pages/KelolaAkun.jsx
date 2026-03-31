import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown, Plus } from "lucide-react";
import api from '../api';

const API_URL = "http://127.0.0.1:8000/api/users";

const KelolaAkun = () => {
  const [view, setView] = useState("table");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const isSuperAdmin = userData?.role === "superadmin";


  // Tambahkan field email untuk kebutuhan login Laravel
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    username: "",
    password: "",
    role: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get(API_URL);
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      if (view === "edit") {
        await api.put(`${API_URL}/${formData.id}`, formData);
      } else {
        await api.post(API_URL, formData);
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan simpan data");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Hapus akun user ini?")) {
      try {
        await api.delete(`${API_URL}/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    }
  };

  const resetForm = () => {
    setView("table");
    setFormData({ id: null, name: "", email: "", password: "", role: "" });
  };

  const startEdit = (user, e) => {
    e.stopPropagation();
    // Isi email secara otomatis jika sebelumnya menggunakan format tertentu
    setFormData({ ...user, password: "" });
    setView("edit");
  };

  if (view === "form" || view === "edit") {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none animate-fadeIn">
        <h3 className="mb-8 font-bold text-2xl uppercase tracking-widest text-center">
          KELOLA AKUN
        </h3>
        <div className="bg-[#f3f4f6] border border-black rounded-[40px] p-12 w-full max-w-5xl shadow-sm flex flex-col gap-8">
          <div className="space-y-6">
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukan Nama Lengkap ...."
              className="w-full p-4 rounded-lg border border-black bg-[#d9d9d9] italic px-8 focus:outline-none text-lg"
            />

            <input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Masukan Username (untuk login) ...."
              className="w-full p-4 rounded-lg border border-black bg-[#d9d9d9] italic px-8 focus:outline-none text-lg"
            />

            <div className="relative w-1/2">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  view === "edit"
                    ? "Kosongkan jika tidak ubah password"
                    : "Masukan Password ...."
                }
                className="w-full p-4 rounded-lg border border-black bg-[#d9d9d9] italic px-8 focus:outline-none text-lg"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>

            <div className="relative w-1/2">
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-4 rounded-lg border border-black bg-[#d9d9d9] italic px-8 focus:outline-none appearance-none cursor-pointer text-lg uppercase"
              >
                <option value="">Pilih Role/Unit ....</option>
                <option value="superadmin">Superadmin</option>
                <option value="manager">Manager</option>
                <option value="isp">ISP</option>
                <option value="osp">OSP</option>
                <option value="aso">ASO</option>
                <option value="hai">HAI</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex justify-center gap-10 mt-10 font-bold">
            <button
              onClick={resetForm}
              className="px-24 py-4 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase text-xl"
            >
              KEMBALI
            </button>
            <button
              onClick={handleSave}
              className="px-24 py-4 bg-[#d9d9d9] border border-black rounded-lg hover:bg-white transition-all uppercase text-xl"
            >
              SIMPAN
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpanded = expandedTable === "users";

  return (
    <div
      className={`h-full flex flex-col select-none relative transition-all duration-500 ${isExpanded ? "absolute inset-0 z-50 bg-[#f8f9fa] p-8" : "px-4 gap-6"}`}
    >
      <div
        className={`relative flex items-center justify-center ${isExpanded ? "mb-12" : "min-h-[60px]"}`}
      >
        {isExpanded && (
          <button
            onClick={() => setExpandedTable(null)}
            className="absolute left-0 bg-white border border-black rounded-full w-12 h-12 flex items-center justify-center shadow-md font-bold text-2xl hover:scale-110 transition-all"
          >
            ←
          </button>
        )}
        <h3
          className={`font-bold uppercase tracking-[0.3em] ${isExpanded ? "text-3xl" : "text-2xl"}`}
        >
          KELOLA AKUN
        </h3>
      </div>

      {isSuperAdmin && (
        <div className="flex items-center">
          <button onClick={() => setView("form")} className="bg-[#386097] border text-white rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[10px] shadow-sm active:scale-95 transition-all hover:bg-white hover:text-black"
          >
            <span className="text-base">+</span> Tambah Akun
          </button>
        </div>
      )}

      <div
        onClick={() => !isExpanded && setExpandedTable("users")}
        className={`flex flex-col ${!isExpanded ? "cursor-pointer hover:scale-[1.002]" : "flex-1 overflow-auto"}`}
      >
        <div className="overflow-hidden rounded-t-[20px] border-x border-t border-black bg-white shadow-xl">
          <table className="w-full text-center border-collapse table-fixed">
            <thead className="bg-[#386097]">
              <tr className="text-sm font-bold">
                <th className="w-12 p-3 border-r border-b text-white text-[11px] font-bold">NO</th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Nama & Email
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Role / Unit
                </th>
                <th className="p-3 border-r border-b text-white text-[11px] font-bold">
                  Dibuat Pada
                </th>
                <th className="w-48 p-3 border-b text-white text-[11px] font-bold">Opsi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="h-16 border-b border-black hover:bg-gray-50 transition-colors"
                >
                  <td className="border-r border-black font-bold">
                    {index + 1}
                  </td>
                  <td className="border-r border-black text-sm px-4 text-left">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-gray-500 text-xs italic">
                      User: {user.username}
                    </div>
                  </td>
                  <td className="border-r border-black text-sm font-bold uppercase">
                    {user.role}
                  </td>
                  <td className="border-r border-black text-sm">
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4">
                    {isSuperAdmin ? (
                      <div className="flex justify-center gap-6">
                        <button
                          onClick={(e) => startEdit(user, e)}
                          className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm  transition-all whitespace-nowrap hover:bg-white hover:text-black"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(user.id, e)}
                          className="bg-[#386097] border text-white rounded-md px-5 py-1 text-[10px] font-bold shadow-sm  transition-all whitespace-nowrap hover:bg-white hover:text-black"
                        >
                          Delete
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
            </tbody>
          </table>
        </div>
        <div className="h-8 bg-white border-x border-b border-black rounded-b-[25px] shadow-sm mb-4"></div>
      </div>
    </div>
  );
};

export default KelolaAkun;
