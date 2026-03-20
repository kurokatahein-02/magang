import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; // Import komponen proteksi

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes: Jika sudah login, akses ke /login akan diredirect ke dashboard */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes: Semua yang di dalam sini butuh token */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<div />} /> {/* div diganti komponen asli nantinya */}
            <Route path="/control-kegiatan" element={<div />} />
            <Route path="/control-pihak-ketiga" element={<div />} />
            <Route path="/control-sitac" element={<div />} />
            <Route path="/inventory" element={<div />} />
            <Route path="/kelola-akun" element={<div />} />
          </Route>
        </Route>

        {/* Fallback: Jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;