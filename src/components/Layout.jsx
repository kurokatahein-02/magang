import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import myLogo from '../assets/logo-tif.png'; 

// 1. IMPORT COMPONENT DEFAULT (Superadmin / Manager)
import Dashboard from '../pages/Dashboard';
import ControlKegiatanDefault from '../pages/ControlKegiatan';
import ControlPihakKetigaDefault from '../pages/ControlPihakKetiga';
import ControlSitacDefault from '../pages/ControlSitac';
import InventoryDefault from '../pages/Inventory';


// 2. IMPORT COMPONENT KHUSUS DIVISI ISP
import ControlKegiatanISP from '../pages/isp/ControlKegiatanISP';
import InventoryISP from '../pages/isp/Inventory';
import ControlSitacISP from '../pages/isp/ControlSitacISP';
import DashboardISP from '../pages/isp/DashboardISP';

// IMPORT COMPONENT KHUSUS DIVISI OSP
import ControlKegiatanOSP from '../pages/osp/ControlKegiatanOSP';
import ControlPihakKetigaOSP from '../pages/osp/ControlPihakKetigaOSP';
import InventoryOSP from '../pages/osp/InventoryOSP';
import DashboardOSP from '../pages/osp/DashboardOSP';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const location = useLocation();
  const navigate = useNavigate();

  // --- CEK ROLE & USER DATA ---
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

  // --- PEMETAAN JUDUL & MENU ---
  const pageTitles = {
    '/dashboard': 'DASHBOARD',
    '/control-kegiatan': 'CONTROL KEGIATAN',
    '/control-pihak-ketiga': 'CONTROL PIHAK KE TIGA',
    '/control-sitac': 'CONTROL SITAC',
    '/inventory': 'INVENTORY',
  };

  const currentTitle = pageTitles[location.pathname] || 'DASHBOARD';

  // --- BUAT MENU DINAMIS BERDASARKAN ROLE ---
  let menuItems =[];

  if (role === 'isp') {
    // MENU KHUSUS ISP (Tanpa Pihak Ketiga)
    menuItems =[
      { name: 'DASHBOARD', path: '/dashboard' },
      { name: 'CONTROL KEGIATAN', path: '/control-kegiatan' },
      { name: 'CONTROL LAPORAN SITAC', path: '/control-sitac' },
      { name: 'INVENTORY', path: '/inventory' },
    ];
  } if (role === 'osp') {
    // MENU KHUSUS OSP (Tanpa Pihak Ketiga & Sitac)
    menuItems =[  
      { name: 'DASHBOARD', path: '/dashboard' },
      { name: 'CONTROL KEGIATAN', path: '/control-kegiatan' },
      { name: 'CONTROL PIHAK KETIGA', path: '/control-pihak-ketiga' },
      { name: 'INVENTORY', path: '/inventory' },
    ];
    }else {
    // MENU DEFAULT UNTUK SUPERADMIN / MANAGER
    menuItems =[
      { name: 'DASHBOARD', path: '/dashboard' },
      { name: 'CONTROL KEGIATAN', path: '/control-kegiatan' },
      { name: 'CONTROL PIHAK KETIGA', path: '/control-pihak-ketiga' },
      { name: 'CONTROL LAPORAN SITAC', path: '/control-sitac' },
      { name: 'INVENTORY', path: '/inventory' },
    ];
  }

  // --- 3. FUNGSI SAKTI PERENDER HALAMAN BERDASARKAN ROLE ---
  const renderPageContent = () => {
    switch (location.pathname) {
      case '/dashboard':
        if (role === 'isp') return <DashboardISP />;
        if (role === 'osp') return <DashboardOSP />;
        // Nanti kalau ada OSP tinggal tambah: if (role === 'osp') return <ControlKegiatanOSP />;
        return <Dashboard />;
        
        
      case '/control-kegiatan':
        if (role === 'isp') return <ControlKegiatanISP />;
        if (role === 'osp') return <ControlKegiatanOSP />;
        // Nanti kalau ada OSP tinggal tambah: if (role === 'osp') return <ControlKegiatanOSP />;
        return <ControlKegiatanDefault />;
        
      case '/control-pihak-ketiga':
        if (role === 'osp') return <ControlPihakKetigaOSP />;
        // Belum ada versi ISP, jadi kembalikan yang default
        return <ControlPihakKetigaDefault />;
        
      case '/control-sitac':
        if (role === 'isp') return <ControlSitacISP />;
        return <ControlSitacDefault />;
        
      case '/inventory':
        if (role === 'isp') return <InventoryISP />;
        if (role === 'osp') return <InventoryOSP />;
        return <InventoryDefault />;
        
      default:
        // Fallback kalau path ga ada di atas (misal halaman kosong)
        return children || <div className="text-center mt-20 font-bold text-gray-500">Halaman tidak ditemukan</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#e5e7eb] font-sans overflow-hidden relative">
      
      {/* --- SIDEBAR --- */}
      <div className={`bg-[#56a8c7] flex flex-col border-r border-black transition-all duration-500 ease-in-out relative ${isSidebarOpen ? 'w-1/5 opacity-100' : 'w-0 opacity-0 invisible'}`}>
        {isSidebarOpen && (
          <>
            <div className="p-5 flex justify-center items-center"> 
              <img src={myLogo} alt="Logo" className="w-[65%] h-auto object-contain max-h-24 transition-all" />
            </div>

            <nav className="flex-1 px-4 py-2 space-y-4 overflow-hidden">
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
            <div className="flex flex-col text-right select-none">
                <span className="text-black font-bold text-lg uppercase tracking-tight leading-tight">
                    {roleLabel}
                </span>
                <span className="text-white text-xs font-medium mt-0.5">
                    {userData?.name || 'Username'}
                </span>
            </div>

            <div className="shrink-0 w-14 h-14 bg-white rounded-full border border-black shadow-inner overflow-hidden">
                <img src={myLogo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* 4. TAMPILKAN HASIL RENDER PAGE CONTENT DI SINI */}
        <main className="flex-1 overflow-auto p-8 relative bg-[#f1f5f9]">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;