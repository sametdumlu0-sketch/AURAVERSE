
import React from 'react';
import { Product, User } from '../types';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[];
  onRemoveItem: (index: number, product: Product) => void;
  onCheckout: () => void;
  user: User; 
}

export const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose, cart, onRemoveItem, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Panel */}
      <div className={`fixed top-0 left-0 h-full w-full md:w-96 bg-gray-900/95 border-r border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-black/40">
          <div className="flex justify-between items-center mb-4">
            <div>
               <h2 className="text-2xl font-heading text-white tracking-widest">SEPETİM</h2>
               <p className="text-[10px] text-gray-500 font-mono">DİJİTAL VARLIK ENVANTERİ</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100%-150px)] p-6">
           {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 opacity-50">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-sm font-mono">SEPETİNİZ BOŞ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-3 bg-gray-800/40 p-3 rounded border border-gray-700 hover:border-cyan-500/50 transition-colors group">
                  <div className="w-16 h-16 bg-black rounded border border-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-xs text-gray-600">N/A</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400 mb-1">{item.category}</p>
                    <p className="text-cyan-400 font-mono text-sm">{item.price} TKN</p>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(index, item)}
                    className="self-start text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="İade Et"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/60 backdrop-blur border-t border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-bold tracking-wider">TOPLAM</span>
                <span className="text-2xl text-white font-mono font-black">{total} <span className="text-sm text-cyan-500">TKN</span></span>
            </div>
            
            <button 
                disabled={cart.length === 0}
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold py-4 rounded uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/40 transition-all active:scale-[0.98]"
            >
                ÖDEMEYİ TAMAMLA
            </button>
        </div>
      </div>
    </>
  );
};
