import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Jika token atau data user tidak ada, arahkan ke halaman login (/)
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Jika ada, izinkan akses ke halaman yang diminta
  return <Outlet />;
};

export default ProtectedRoute;