import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// PASTIKAN FILE logo-tif.png SUDAH ADA DI FOLDER src/assets/
import myLogo from '../assets/logo-tif.png'; 

const Layout = ({ children }) => {
  // 1. STATE UNTUK SIDEBAR (Jangan sampai terhapus)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const location = useLocation();
  const navigate = useNavigate();

  // Letakkan ini di dalam fungsi komponen, sebelum return
const userRaw = localStorage.getItem('user');
const userData = userRaw ? JSON.parse(userRaw) : null;
const role = userData?.role || '';

let roleLabel = '';
if (role === 'manager') {
  roleLabel = 'MANAGER';
} else if (['isp', 'osp', 'aso', 'hai'].includes(role)) {
  roleLabel = `UNIT ${role.toUpperCase()}`;
} else if (role === 'superadmin') {
  roleLabel = 'SUPERADMIN';
} else {
  roleLabel = 'ADMIN';
}

  // 2. PEMETAAN JUDUL (Jangan sampai terhapus)
  const pageTitles = {
    '/dashboard': 'DASHBOARD',
    '/control-kegiatan': 'CONTROL KEGIATAN',
    '/control-pihak-ketiga': 'CONTROL PIHAK KE TIGA',
    '/control-sitac': 'CONTROL SITAC',
    '/inventory': 'INVENTORY',
  };

  // 3. VARIABEL JUDUL SAAT INI
  const currentTitle = pageTitles[location.pathname] || 'DASHBOARD';

  const menuItems = [
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'CONTROL KEGIATAN', path: '/control-kegiatan' },
    { name: 'CONTROL PIHAK KETIGA', path: '/control-pihak-ketiga' },
    { name: 'CONTROL LAPORAN SITAC', path: '/control-sitac' },
    { name: 'INVENTORY', path: '/inventory' },
  ];

  return (
    <div className="flex h-screen bg-[#e5e7eb] font-sans overflow-hidden relative">
      
      {/* --- SIDEBAR --- */}
<div 
  className={`bg-[#56a8c7] flex flex-col border-r border-black transition-all duration-500 ease-in-out relative
  ${isSidebarOpen ? 'w-1/5 opacity-100' : 'w-0 opacity-0 invisible'}`}
>
  {isSidebarOpen && (
    <>
      {/* BAGIAN LOGO (Teks & Garis dihapus) */}
      <div className="p-5 flex justify-center items-center"> 
        {/* w-full agar mengikuti lebar sidebar, h-auto agar tidak gepeng */}
        <img 
          src={myLogo} 
          alt="Logo" 
          className="w-[65%] h-auto object-contain max-h-24 transition-all" 
        />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-4 overflow-hidden">
        {/* Garis pemisah antara logo dan menu (opsional, bisa kamu hapus juga) */}
        <div className="h-[3px] bg-white/30 w-full mb-6"></div>
        
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left p-3 rounded-lg text-[11px] font-bold transition-all border whitespace-nowrap select-none ${
              location.pathname === item.path 
              ? 'bg-[#76c7e6] text-white border-white shadow-md' 
              : 'text-white border-transparent hover:bg-[#4a97b5]'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

            <div className="p-4 border-t border-white/30">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white font-bold text-sm whitespace-nowrap select-none">
                <span className="border-2 border-white rounded p-1">←</span> LOG OUT
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- TOMBOL BOLA ANIMASI --- */}
      <div 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute select-none top-1/2 -translate-y-1/2 z-[100] cursor-pointer transition-all duration-500 ease-in-out
          ${isSidebarOpen ? 'left-[20%] rotate-0' : 'left-0 rotate-[360deg]'} -ml-6`} 
      >
        <div className="w-12 h-12 bg-white rounded-full border-2 border-[#1a536e] shadow-lg flex items-center justify-center group hover:scale-110 active:scale-95 transition-transform">
          <div className="grid grid-cols-2 gap-1 p-2">
             <div className="w-2 h-2 bg-[#56a8c7] rounded-full"></div>
             <div className="w-2 h-2 bg-[#56a8c7] rounded-full"></div>
             <div className="w-2 h-2 bg-[#56a8c7] rounded-full"></div>
             <div className="w-2 h-2 bg-[#56a8c7] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTAINER --- */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
        <header className="h-20 bg-[#56a8c7] flex justify-between items-center px-8 border-b border-black text-white shrink-0">
          <div className="flex items-center gap-8">
            <div className="w-[2px] h-12 bg-white/50"></div>
            <h2 className="text-3xl font-black tracking-[0.2em] text-[#dc2626] uppercase select-none">
                {currentTitle}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Container Teks: Ditambahkan 'flex flex-col' agar tersusun atas-bawah */}
            <div className="flex flex-col text-right select-none">
                <span className="text-black font-bold text-lg uppercase tracking-tight leading-tight">
                    {roleLabel}
                </span>
                {/* Username di Bawah Role */}
                <span className="text-white text-xs font-medium mt-0.5">
                    {userData?.name || 'Username'}
                </span>
            </div>

            {/* Container Gambar: Otomatis di samping karena parent utama menggunakan 'flex' */}
            {/* Ditambahkan 'shrink-0' agar gambar tidak menyusut jika nama terlalu panjang */}
            <div className="shrink-0 w-14 h-14 bg-white rounded-full border border-black shadow-inner overflow-hidden">
                <img src={myLogo} alt="Profile" className="w-full h-full object-cover" />
            </div>
        </div>
        </header>

        <main className="flex-1 overflow-auto p-8 relative bg-[#f1f5f9]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;