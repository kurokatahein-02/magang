import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import myLogo from "../assets/logo-tif.png";
import {
  LayoutDashboard,
  LaptopMinimalCheck,
  Users,
  MapPinned,
  Box,
  Database,
} from "lucide-react"; // Contoh icon, bisa diganti sesuai kebutuhan
import { Outlet } from "react-router-dom";
import api from '../api';

// 1. IMPORT COMPONENT DEFAULT (Superadmin / Manager)
import Dashboard from "../pages/Dashboard";
import ControlKegiatanDefault from "../pages/ControlKegiatan";
import ControlPihakKetigaDefault from "../pages/ControlPihakKetiga";
import ControlSitacDefault from "../pages/ControlSitac";
import MiniOltDefault from "../pages/MiniOlt";
import InventoryDefault from "../pages/Inventory";
import KelolaAkun from "../pages/KelolaAkun";
import PotensiData from "../pages/PotensiData";

// 2. IMPORT COMPONENT KHUSUS DIVISI ISP
import ControlKegiatanISP from "../pages/isp/ControlKegiatanISP";
import InventoryISP from "../pages/isp/InventoryISP";
import MapPersebaranOLT from "../pages/isp/MapPersebaranOLT";
import DashboardISP from "../pages/isp/DashboardISP";

// IMPORT COMPONENT KHUSUS DIVISI OSP
import ControlKegiatanOSP from "../pages/osp/ControlKegiatanOSP";
import ControlPihakKetigaOSP from "../pages/osp/ControlPihakKetigaOSP";
import InventoryOSP from "../pages/osp/InventoryOSP";
import DashboardOSP from "../pages/osp/DashboardOSP";

// IMPORT COMPONENT KHUSUS DIVISI ASO
import ControlKegiatanASO from "../pages/aso/ControlKegiatanASO";
import InventoryASO from "../pages/aso/InventoryASO";
import DashboardASO from "../pages/aso/DashboardASO";

// IMPORT COMPONENT KHUSUS DIVISI HAI
import ControlKegiatanHAI from "../pages/hai/ControlKegiatanHAI";
import DashboardHAI from "../pages/hai/DashboardHAI";
import InventoryHAI from "../pages/hai/InventoryHAI";
import ControlSitacHAI from "../pages/hai/ControlSitacHAI";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // --- CEK ROLE & USER DATA ---
  const userRaw = localStorage.getItem("user");
  const userData = userRaw ? JSON.parse(userRaw) : null;
  const role = userData?.role || "";

  let roleLabel = "";
  if (role === "manager") {
    roleLabel = "MANAGER";
  } else if (["isp", "osp", "aso", "hai"].includes(role)) {
    roleLabel = `UNIT ${role.toUpperCase()}`;
  } else if (role === "superadmin") {
    roleLabel = "SUPERADMIN";
  } else {
    roleLabel = "ADMIN";
  }

  // --- PEMETAAN JUDUL & MENU ---
  const pageTitles = {
    "/dashboard": "DASHBOARD",
    "/control-kegiatan": "CONTROL KEGIATAN",
    "/control-pihak-ketiga": "CONTROL PIHAK KE TIGA",
    "/control-sitac": "CONTROL SITAC",
    "/olt": "OLT DEVICE", // Tambahkan ini
    "/inventory": "INVENTORY",
    "/potensi-data": "DATA POTENSI",
    "/kelola-akun": "KELOLA AKUN",
  };

  const currentTitle = pageTitles[location.pathname] || "DASHBOARD";

  // --- BUAT MENU DINAMIS BERDASARKAN ROLE ---
  let menuItems = [];

  if (role === "isp") {
    // MENU KHUSUS ISP (Tanpa Pihak Ketiga)
    menuItems = [
      { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
      {
        name: "KEGIATAN",
        path: "/control-kegiatan",
        icon: LaptopMinimalCheck,
      },
      { name: "OLT", path: "/olt", icon: MapPinned }, // Path diubah ke /olt
      { name: "INVENTORY", path: "/inventory", icon: Box },
      { name: "DATA POTENSI", path: "/potensi-data", icon: Database },
    ];
  } else if (role === "osp") {
    // MENU KHUSUS OSP (Tanpa Pihak Ketiga & Sitac)
    menuItems = [
      { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
      {
        name: "KEGIATAN",
        path: "/control-kegiatan",
        icon: LaptopMinimalCheck,
      },
      {
        name: "PIHAK KETIGA",
        path: "/control-pihak-ketiga",
        icon: Users,
      },
      { name: "INVENTORY", path: "/inventory", icon: Box },
      { name: "DATA POTENSI", path: "/potensi-data", icon: Database },
    ];
  } else if (role === "aso") {
    // MENU KHUSUS ASO (Hanya Dashboard, Control Kegiatan, dan Inventory)
    menuItems = [
      { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
      {
        name: "CONTROL KEGIATAN",
        path: "/control-kegiatan",
        icon: LaptopMinimalCheck,
      },
      { name: "INVENTORY", path: "/inventory", icon: Box },
      { name: "DATA POTENSI", path: "/potensi-data", icon: Database },
    ];
  } else if (role === "hai") {
    // MENU KHUSUS HAI (Hanya Dashboard, Control Kegiatan, Control Sitac, dan Inventory)
    menuItems = [
      { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
      {
        name: "CONTROL KEGIATAN",
        path: "/control-kegiatan",
        icon: LaptopMinimalCheck,
      },
      { name: "CONTROL SITAC", path: "/control-sitac", icon: MapPinned },
      { name: "INVENTORY", path: "/inventory", icon: Box },
      { name: "DATA POTENSI", path: "/potensi-data", icon: Database },
    ];
  } else {
    // MENU DEFAULT UNTUK SUPERADMIN / MANAGER
    menuItems = [
      { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
      { name: "KEGIATAN", path: "/control-kegiatan", icon: LaptopMinimalCheck },
      { name: "PIHAK KETIGA", path: "/control-pihak-ketiga", icon: Users },
      { name: "LAPORAN/SITAC", path: "/control-sitac", icon: MapPinned },
      { name: "Mini-OLT", path: "/olt", icon: MapPinned },
      { name: "INVENTORY", path: "/inventory", icon: Box },
      { name: "DATA POTENSI", path: "/potensi-data", icon: Database },
      { name: "KELOLA AKUN", path: "/kelola-akun", icon: Users },
    ];
  }

  const handleLogout = async () => {
    try {
      // 1. Panggil API Logout ke Laravel (untuk hapus token di database)
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // 2. Apapun hasilnya, hapus data dari browser
      localStorage.removeItem("token");
      localStorage.setItem("user", null); // atau localStorage.removeItem('user')

      // 3. Tendang user kembali ke halaman login
      navigate("/login", { replace: true });
    }
  };

  // --- 3. FUNGSI SAKTI PERENDER HALAMAN BERDASARKAN ROLE ---
  const renderPageContent = () => {
    switch (location.pathname) {
      case "/dashboard":
        if (role === "isp") return <DashboardISP />;
        if (role === "osp") return <DashboardOSP />;
        if (role === "aso") return <DashboardASO />;
        if (role === "hai") return <DashboardHAI />;
        // Nanti kalau ada OSP tinggal tambah: if (role === 'osp') return <ControlKegiatanOSP />;
        return <Dashboard />;

      case "/control-kegiatan":
        if (role === "isp") return <ControlKegiatanISP />;
        if (role === "osp") return <ControlKegiatanOSP />;
        if (role === "aso") return <ControlKegiatanASO />;
        if (role === "hai") return <ControlKegiatanHAI />;
        // Nanti kalau ada OSP tinggal tambah: if (role === 'osp') return <ControlKegiatanOSP />;
        return <ControlKegiatanDefault />;

      case "/control-pihak-ketiga":
        if (role === "osp") return <ControlPihakKetigaOSP />;
        // Belum ada versi ISP, jadi kembalikan yang default
        return <ControlPihakKetigaDefault />;

      case "/control-sitac":
        if (role === "isp") return <MapPersebaranOLT />;
        if (role === "hai") return <ControlSitacHAI />;
        return <ControlSitacDefault />;

        case "/olt": // Tambahkan case baru khusus OLT
        if (role === "isp") return <MapPersebaranOLT />;
        return <MiniOltDefault />;

      case "/inventory":
        if (role === "isp") return <InventoryISP />;
        if (role === "osp") return <InventoryOSP />;
        if (role === "aso") return <InventoryASO />;
        if (role === "hai") return <InventoryHAI />;
        return <InventoryDefault />;

      case "/potensi-data":
        return <PotensiData />;

      case "/kelola-akun":
        return <KelolaAkun />;

      default:
        // Fallback kalau path ga ada di atas (misal halaman kosong)
        return (
          children || (
            <div className="text-center mt-20 font-bold text-gray-500">
              Halaman tidak ditemukan
            </div>
          )
        );
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden relative">
      {/* --- SIDEBAR --- */}
        <div
          className={`bg-[#386097] flex flex-col border-r border-black transition-all duration-500 ease-in-out relative ${isSidebarOpen ? "w-40 opacity-100" : "w-0 opacity-0 invisible"}`}
        >
          {isSidebarOpen && (
            <>
              {/* Logo Diperkecil paddingnya */}
              <div className="p-4 flex justify-center items-center">
                <img src={myLogo} alt="Logo" className="w-[70%] h-auto object-contain max-h-16 transition-all" />
              </div>

              <nav className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
                <div className="h-[2px] bg-white/30 w-full mb-4"></div>

                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      // Padding dan Font Diperkecil
                      className={`w-full text-left p-2.5 rounded-lg text-[9px] font-bold transition-all border whitespace-nowrap select-none flex items-center gap-3 ${
                        location.pathname === item.path
                          ? "bg-[#76c7e6] text-white border-white shadow-md"
                          : "text-white border-transparent hover:bg-[#4a97b5]"
                      }`}
                    >
                      {Icon && <Icon size={16} strokeWidth={2.5} />}
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-white/30">
                <button onClick={handleLogout} className="flex items-center gap-2 text-white font-bold text-[11px] whitespace-nowrap select-none hover:text-red-200 transition-colors">
                  <span className="border border-white rounded px-1.5 py-0.5">←</span> LOG OUT
                </button>
              </div>
            </>
          )}
        </div>

        {/* --- TOMBOL BOLA ANIMASI (Diperkecil & disesuaikan posisinya) --- */}
        <div
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute select-none top-1/2 -translate-y-1/2 z-[100] cursor-pointer transition-all duration-500 ease-in-out
            ${isSidebarOpen ? "left-40 rotate-0" : "left-0 rotate-[360deg]"} -ml-5`}
        >
          <div className="w-10 h-10 bg-white rounded-full border border-[#1a536e] shadow-md flex items-center justify-center group hover:scale-110 active:scale-95 transition-transform">
            <div className="grid grid-cols-2 gap-1 p-1.5">
              <div className="w-1.5 h-1.5 bg-[#386097] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#386097] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#386097] rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#386097] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTAINER --- */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
          
          {/* HEADER DIPERKECIL (h-14, font lebih kecil) */}
          <header className="h-14 bg-[#386097] flex justify-between items-center px-6 border-b border-black text-white shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-[2px] h-8 "></div>
              
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right select-none">
                <span className="text-black font-bold text-sm uppercase tracking-tight leading-none">
                  {roleLabel}
                </span>
                <span className="text-white text-[10px] font-medium mt-0.5">
                  {userData?.name || "Username"}
                </span>
              </div>

              {/* Profile icon diperkecil (w-10 h-10) */}
              <div className="shrink-0 w-10 h-10 bg-white rounded-full border border-black shadow-inner flex items-center justify-center text-[#386097]">
                <Users size={24} />
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA DIPERKECIL PADDINGNYA (p-5) */}
          <main className="flex-1 overflow-auto p-5 relative bg-[#f1f5f9]">
            {renderPageContent()}
            <Outlet /> 
          </main>

        </div>
    </div>
  );
};

export default Layout;
