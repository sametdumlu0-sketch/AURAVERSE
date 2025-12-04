
import React, { useState } from 'react';
import { User } from '../types';
import { sqlService } from '../services/sqlService';

interface UserAuthProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ onLoginSuccess, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // REGISTER
      const newUser: User = {
        id: `u-${Date.now()}`,
        username: username || 'Citizen',
        email,
        password,
        tokens: 1000, // Welcome bonus
        cash: 5000, // Initial cash bonus
        cart: [],
        verification: {
          isEmailVerified: false,
          isPhoneVerified: false,
          isIdVerified: false
        },
        orders: []
      };

      const success = sqlService.registerUser(newUser);
      if (success) {
        alert('Vatandaş kaydı başarıyla oluşturuldu. +1000 Token Bonus tanımlandı.');
        onLoginSuccess(newUser);
      } else {
        setError('Bu E-Posta adresi zaten kayıtlı.');
      }

    } else {
      // LOGIN
      const user = sqlService.loginUser(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('E-Posta veya Şifre hatalı.');
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Borders - Hidden on very small screens to save space */}
        <div className="hidden md:block absolute -top-6 -left-6 w-16 h-16 border-t-2 border-l-2 border-green-500 opacity-60"></div>
        <div className="hidden md:block absolute -bottom-6 -right-6 w-16 h-16 border-b-2 border-r-2 border-green-500 opacity-60"></div>

        <div className="bg-gray-900/90 border border-gray-700 p-6 md:p-8 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden rounded-lg">
           {/* Close Button */}
           <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

          <div className="text-center mb-6 md:mb-8">
            <div className="text-green-500 text-xs tracking-[0.3em] mb-2 animate-pulse">VATANDAŞ ERİŞİMİ</div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white italic tracking-wider">
              CITIZEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">PORTAL</span>
            </h2>
          </div>

          <div className="flex mb-6 border-b border-gray-700">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-3 font-heading font-bold tracking-wider transition-colors cursor-pointer ${!isRegistering ? 'text-green-400 border-b-2 border-green-500' : 'text-gray-500'}`}
            >
              GİRİŞ YAP
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-3 font-heading font-bold tracking-wider transition-colors cursor-pointer ${isRegistering ? 'text-green-400 border-b-2 border-green-500' : 'text-gray-500'}`}
            >
              KAYIT OL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {isRegistering && (
              <div className="group">
                <label className="block text-gray-500 text-xs uppercase mb-1">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full bg-black/60 border border-gray-700 text-white p-3 focus:border-green-500 focus:outline-none"
                  placeholder="Citizen_One"
                  required
                />
              </div>
            )}

            <div className="group">
              <label className="block text-gray-500 text-xs uppercase mb-1">E-Posta Adresi</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-black/60 border border-gray-700 text-white p-3 focus:border-green-500 focus:outline-none"
                placeholder="mail@ornek.com"
                required
              />
            </div>

            <div className="group">
              <label className="block text-gray-500 text-xs uppercase mb-1">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-black/60 border border-gray-700 text-white p-3 focus:border-green-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 text-red-400 text-xs text-center border border-red-500/30">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 uppercase tracking-[0.2em] shadow-lg shadow-green-900/50 transition-all active:scale-[0.98] mt-4 cursor-pointer"
            >
              {isRegistering ? 'KİMLİK OLUŞTUR' : 'SİSTEME GİR'}
            </button>
          </form>

           {/* SECURITY FOOTER */}
           <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono tracking-wider opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-green-500">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              <span>SQL SERVER SECURED</span>
           </div>
        </div>
      </div>
    </div>
  );
};
