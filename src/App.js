import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import Layout Pintar
import Login from './pages/Login'; // Import Login

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login (Tanpa Sidebar/Header) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* 
          Semua route di bawah ini CUKUP memanggil <Layout /> saja.
          Isi halamannya (apakah punya ISP atau punya Superadmin) 
          akan diatur secara otomatis oleh file Layout.jsx 
        */}
        <Route path="/dashboard" element={<Layout />} />
        <Route path="/control-kegiatan" element={<Layout />} />
        <Route path="/control-pihak-ketiga" element={<Layout />} />
        <Route path="/control-sitac" element={<Layout />} />
        <Route path="/inventory" element={<Layout />} />
        <Route path="/kelola-akun" element={<Layout />} />
      </Routes> 
    </Router>
  );
}

export default App;