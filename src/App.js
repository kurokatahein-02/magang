import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import Layout
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ControlKegiatan from './pages/ControlKegiatan';
import ControlPihakKetiga from './pages/ControlPihakKetiga';
import ControlSitac from './pages/ControlSitac';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login (Tanpa Sidebar/Header) */}
        <Route path="/" element={<Login />} />

        {/* Halaman Dashboard (Dibungkus Layout agar ada Sidebar/Header) */}
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        <Route 
          path="/control-kegiatan" 
          element={
            <Layout>
              <ControlKegiatan />
            </Layout>
          } 
        />
        <Route 
          path="/control-pihak-ketiga" 
          element={
            <Layout>
              <ControlPihakKetiga />
            </Layout>
          } 
        />
        <Route 
          path="/control-sitac" 
          element={
            <Layout>
              <ControlSitac />
            </Layout>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <Layout>
              <Inventory />
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;