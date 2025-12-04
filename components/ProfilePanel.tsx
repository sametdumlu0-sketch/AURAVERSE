
import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { sqlService } from '../services/sqlService';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdate: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'HISTORY'>('IDENTITY');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // --- FILTER STATES ---
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // --- EXPANSION STATE ---
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    sqlService.updateUserAvatar(user.id, avatarUrl);
    setIsEditingAvatar(false);
    onProfileUpdate();
  };

  // --- FILTER LOGIC ---
  
  // Helper to parse "DD.MM.YYYY HH:mm:ss" format from SQL Service
  const parseOrderDate = (dateStr: string): Date => {
    try {
        const [datePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('.').map(Number);
        return new Date(year, month - 1, day);
    } catch (e) {
        return new Date(0); // Fallback
    }
  };

  // Derived unique categories from user's order history
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    user.orders.forEach(order => {
        order.items.forEach(item => {
            if(item.category) categories.add(item.category);
        });
    });
    return Array.from(categories);
  }, [user.orders]);

  const filteredOrders = useMemo(() => {
      return user.orders.filter(order => {
          const orderDate = parseOrderDate(order.date);
          
          // 1. Date Range Check
          if (filterStartDate) {
              const start = new Date(filterStartDate);
              start.setHours(0,0,0,0);
              if (orderDate < start) return false;
          }
          if (filterEndDate) {
              const end = new Date(filterEndDate);
              end.setHours(23,59,59,999);
              if (orderDate > end) return false;
          }

          // 2. Category Check (Show order if it contains ANY item of the category)
          if (filterCategory !== 'ALL') {
              const hasCategory = order.items.some(item => item.category === filterCategory);
              if (!hasCategory) return false;
          }

          return true;
      });
  }, [user.orders, filterStartDate, filterEndDate, filterCategory]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity"
        />
      )}

      {/* Main Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-gray-900 border-l border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-black/50 p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
                <h2 className="text-2xl text-white font-heading tracking-widest">KİMLİK BİRİMİ</h2>
                <p className="text-[10px] text-cyan-500 font-mono tracking-wider">CITIZEN PROFILE MANAGEMENT</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
            </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('IDENTITY')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest transition-colors ${activeTab === 'IDENTITY' ? 'text-cyan-400 bg-cyan-900/20 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
                KİMLİK & AVATAR
            </button>
            <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest transition-colors ${activeTab === 'HISTORY' ? 'text-purple-400 bg-purple-900/20 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
                SİPARİŞ GEÇMİŞİ
            </button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-900 to-black">
            
            {activeTab === 'IDENTITY' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-gray-800">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                                className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full shadow hover:bg-cyan-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                        </div>

                        {isEditingAvatar && (
                            <form onSubmit={handleSaveAvatar} className="mt-4 w-full max-w-xs flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Görsel URL (https://...)" 
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="flex-1 bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-xs outline-none focus:border-cyan-500"
                                />
                                <button type="submit" className="bg-cyan-700 text-white px-3 py-2 rounded text-xs font-bold hover:bg-cyan-600">
                                    KAYDET
                                </button>
                            </form>
                        )}

                        <div className="text-center mt-4">
                            <h3 className="text-2xl text-white font-bold">{user.username}</h3>
                            <p className="text-gray-400 text-sm font-mono">{user.email}</p>
                            <span className="inline-block mt-2 bg-gray-800 text-gray-400 text-[10px] px-2 py-1 rounded border border-gray-700 font-mono">
                                ID: {user.id}
                            </span>
                        </div>
                    </div>

                    {/* Verification Badges */}
                    <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                        <h4 className="text-gray-400 text-xs font-bold mb-4 uppercase">Doğrulama Durumu</h4>
                        <div className="space-y-3">
                            <BadgeItem label="E-POSTA" active={user.verification.isEmailVerified} />
                            <BadgeItem label="TELEFON" active={user.verification.isPhoneVerified} />
                            <BadgeItem label="KİMLİK (KYC)" active={user.verification.isIdVerified} />
                        </div>
                    </div>

                     {/* Stats */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 p-4 rounded border border-gray-700 text-center">
                            <p className="text-gray-500 text-[10px] uppercase">TOPLAM SİPARİŞ</p>
                            <p className="text-2xl text-white font-mono">{user.orders.length}</p>
                        </div>
                        <div className="bg-gray-800/30 p-4 rounded border border-gray-700 text-center">
                            <p className="text-gray-500 text-[10px] uppercase">HESAP YAŞI</p>
                            <p className="text-2xl text-white font-mono">1 GÜN</p>
                        </div>
                     </div>
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="space-y-4 animate-fadeIn">
                    
                    {/* --- FILTER BAR --- */}
                    <div className="bg-black/40 p-4 rounded border border-purple-500/30 space-y-3">
                        <div className="flex justify-between items-center">
                             <h4 className="text-purple-400 text-xs font-bold uppercase tracking-wider">FİLTRELEME SEÇENEKLERİ</h4>
                             <button 
                                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterCategory('ALL'); }}
                                className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                             >
                                TEMİZLE
                             </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <label className="text-[9px] text-gray-500 mb-1">BAŞLANGIÇ</label>
                                <input 
                                    type="date" 
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()} // Stop propagation
                                    className="bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[9px] text-gray-500 mb-1">BİTİŞ</label>
                                <input 
                                    type="date" 
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()} // Stop propagation
                                    className="bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] text-gray-500 mb-1">KATEGORİ</label>
                            <select 
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="ALL">TÜM KATEGORİLER</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- ORDERS LIST --- */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-mono text-sm">
                                {user.orders.length === 0 ? "SİPARİŞ KAYDI BULUNAMADI" : "FİLTRELERE UYGUN SONUÇ YOK"}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map((order, idx) => (
                            <div 
                                key={order.id} 
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                className={`bg-gray-800/30 border ${expandedOrderId === order.id ? 'border-purple-500 bg-gray-800/60' : 'border-gray-700'} rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer group`}
                            >
                                <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                                    <div>
                                        <p className="text-white font-bold text-sm">SİPARİŞ #{order.id.split('-')[1]}</p>
                                        <p className="text-gray-500 text-[10px] font-mono">{order.date}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-purple-400 font-mono font-bold">{order.total} TKN</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded">TAMAMLANDI</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {expandedOrderId === order.id ? (
                                    <div className="space-y-3 animate-fadeIn mt-4">
                                         <h5 className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Ürün Detayları</h5>
                                         {order.items.map((item, i) => (
                                             <div key={i} className="flex gap-3 bg-black/40 p-3 rounded border border-gray-700/50 hover:border-gray-600 transition-colors">
                                                 {/* Image */}
                                                 <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden shrink-0 border border-gray-600">
                                                     {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/> : (
                                                         <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">IMG</div>
                                                     )}
                                                 </div>
                                                 {/* Details */}
                                                 <div className="flex-1 min-w-0">
                                                     <div className="flex justify-between items-start">
                                                         <span className="text-white text-sm font-bold truncate pr-2">{item.name}</span>
                                                         <span className="text-purple-400 text-xs font-mono whitespace-nowrap">{item.price} TKN</span>
                                                     </div>
                                                     <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">{item.description}</p>
                                                     <div className="flex gap-2 mt-2">
                                                        <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">{item.category}</span>
                                                        <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">{item.color}</span>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {order.items.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs text-gray-300">
                                                <span>• {item.name} <span className="text-[9px] text-gray-500 ml-1">({item.category})</span></span>
                                                <span className="text-gray-500">{item.price} TKN</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-[10px] text-gray-500 italic mt-1 pt-1 border-t border-gray-700/50">+ {order.items.length - 3} diğer ürün...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
      </div>
    </>
  );
};

const BadgeItem = ({ label, active }: { label: string, active: boolean }) => (
    <div className={`flex items-center justify-between p-2 rounded ${active ? 'bg-green-900/20' : 'bg-gray-800'}`}>
        <span className={`text-xs font-bold ${active ? 'text-green-400' : 'text-gray-500'}`}>{label}</span>
        {active ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
        ) : (
            <span className="text-[10px] text-red-500 font-mono">ONAY BEKLİYOR</span>
        )}
    </div>
);
