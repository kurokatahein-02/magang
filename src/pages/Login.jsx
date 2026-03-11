import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'; // Tambah Loader2 untuk loading state
import axios from 'axios';
import myLogo from '../assets/logo-tif.png'; 

const Login = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIKA LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setLoading(true);
    setError('');

    e.preventDefault();
    console.log("Data yang dikirim:", { username, password });

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        username: username,
        password: password
      });

      if (response.data.success) {
        // 1. Simpan Token dan Data User ke LocalStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // 2. Redirect ke Dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      // Tangani Error (Username/Password salah atau server mati)
      if (err.response) {
        setError(err.response.data.message || 'Login Gagal!');
      } else {
        setError('Koneksi ke Server Gagal!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a536e] flex items-center justify-center p-4 select-none">
      <div className="bg-[#56a8c7] p-10 rounded-[40px] w-full max-w-md border-2 border-black shadow-2xl">
        
        {/* Logo TIF */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-5 flex justify-center items-center"> 
            <img 
              src={myLogo} 
              alt="Logo" 
              className="w-[65%] h-auto object-contain max-h-24 transition-all" 
            />
          </div>
          <div className="w-full flex items-center gap-2 mt-2">
            <div className="h-[2px] bg-red-600 flex-1"></div>
            <div className="h-[2px] bg-red-600 flex-1"></div>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Pesan Error */}
          {error && (
            <div className="bg-red-500 text-white text-[10px] p-2 rounded-lg text-center font-bold animate-shake uppercase tracking-widest border border-black/20">
              {error}
            </div>
          )}

          {/* Kolom Username */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={20} className="text-gray-500 group-focus-within:text-[#1a536e] transition-colors" />
            </div>
            <input 
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#d9d9d9] border border-transparent focus:border-[#1a536e] focus:bg-white outline-none transition-all placeholder:text-gray-500 font-serif shadow-inner text-sm" 
              placeholder="Username" 
            />
          </div>

          {/* Kolom Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-500 group-focus-within:text-[#1a536e] transition-colors" />
            </div>
            <input 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#d9d9d9] border border-transparent focus:border-[#1a536e] focus:bg-white outline-none transition-all placeholder:text-gray-500 font-serif shadow-inner text-sm" 
              placeholder="Password" 
              type={showPassword ? "text" : "password"} 
            />
            {/* Tombol Lihat Password */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#1a536e] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Tombol Login */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1a536e] text-white rounded-full font-black tracking-[0.3em] mt-8 hover:bg-[#144157] active:scale-95 transition-all shadow-lg border border-black/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                LOADING...
              </>
            ) : (
              'LOGIN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;