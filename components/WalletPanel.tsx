
import React, { useState } from 'react';
import { User } from '../types';
import { sqlService } from '../services/sqlService';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onBalanceUpdate: () => void;
}

type WalletTab = 'DASHBOARD' | 'DEPOSIT' | 'TRANSFER' | 'EXCHANGE';

export const WalletPanel: React.FC<WalletPanelProps> = ({ isOpen, onClose, user, onBalanceUpdate }) => {
  const [activeTab, setActiveTab] = useState<WalletTab>('DASHBOARD');

  // --- STATE FOR FORMS ---
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositMethod, setDepositMethod] = useState<'CARD' | 'CRYPTO'>('CARD');
  const [cardNumber, setCardNumber] = useState('');
  
  const [transferType, setTransferType] = useState<'CASH' | 'TOKEN'>('TOKEN');
  const [transferUsername, setTransferUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  
  const [exchangeAmount, setExchangeAmount] = useState(0);

  // --- HANDLERS ---

  const handleDeposit = (e: React.FormEvent) => {
      e.preventDefault();
      if (depositAmount <= 0) return;
      
      // Simulate Payment Processing Delay
      setTimeout(() => {
          // Deposit Cash or Token based on logic (let's say they buy Tokens directly or Cash)
          // For this demo, depositing CASH (USD) is standard.
          const result = sqlService.depositFunds(user.id, depositAmount, 'CASH');
          if (result.success) {
              alert(`ÖDEME BAŞARILI!\n${result.msg}`);
              setDepositAmount(0);
              setCardNumber('');
              onBalanceUpdate();
              setActiveTab('DASHBOARD');
          } else {
              alert(result.msg);
          }
      }, 1500);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0) return;

    const result = sqlService.transferFunds(user.id, transferUsername, transferAmount, transferType);
    if (result.success) {
        alert(result.msg);
        setTransferUsername('');
        setTransferAmount(0);
        onBalanceUpdate();
    } else {
        alert("HATA: " + result.msg);
    }
  };

  const handleExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (exchangeAmount <= 0) return;

    const result = sqlService.convertCashToTokens(user.id, exchangeAmount);
    if (result.success) {
        alert(result.msg);
        setExchangeAmount(0);
        onBalanceUpdate();
    } else {
        alert("HATA: " + result.msg);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity"
        />
      )}

      {/* Main Modal Panel */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`pointer-events-auto bg-gray-900 w-full h-full md:h-[600px] md:max-w-4xl border border-cyan-500/50 shadow-[0_0_100px_rgba(6,182,212,0.3)] md:rounded-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
              
              {/* SIDEBAR (Top Nav on Mobile) */}
              <div className="w-full md:w-64 bg-black/50 border-b md:border-b-0 md:border-r border-gray-800 p-4 md:p-6 flex flex-col justify-between shrink-0">
                  <div className="flex justify-between md:block items-center mb-4 md:mb-0">
                      <h2 className="text-xl md:text-2xl font-heading text-white italic md:mb-8">
                          NEO<span className="text-cyan-500">BANK</span>
                      </h2>
                      <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </div>
                  
                  {/* Navigation Tabs */}
                  <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                      <button 
                         onClick={() => setActiveTab('DASHBOARD')}
                         className={`whitespace-nowrap w-auto md:w-full text-left px-3 py-2 md:px-4 md:py-3 rounded text-xs md:text-sm font-bold tracking-wider transition-all ${activeTab === 'DASHBOARD' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-white bg-gray-800/20'}`}
                      >
                          ÖZET
                      </button>
                      <button 
                         onClick={() => setActiveTab('DEPOSIT')}
                         className={`whitespace-nowrap w-auto md:w-full text-left px-3 py-2 md:px-4 md:py-3 rounded text-xs md:text-sm font-bold tracking-wider transition-all ${activeTab === 'DEPOSIT' ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'text-gray-400 hover:text-white bg-gray-800/20'}`}
                      >
                          YÜKLE
                      </button>
                      <button 
                         onClick={() => setActiveTab('TRANSFER')}
                         className={`whitespace-nowrap w-auto md:w-full text-left px-3 py-2 md:px-4 md:py-3 rounded text-xs md:text-sm font-bold tracking-wider transition-all ${activeTab === 'TRANSFER' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/50' : 'text-gray-400 hover:text-white bg-gray-800/20'}`}
                      >
                          TRANSFER
                      </button>
                      <button 
                         onClick={() => setActiveTab('EXCHANGE')}
                         className={`whitespace-nowrap w-auto md:w-full text-left px-3 py-2 md:px-4 md:py-3 rounded text-xs md:text-sm font-bold tracking-wider transition-all ${activeTab === 'EXCHANGE' ? 'bg-pink-900/50 text-pink-400 border border-pink-500/50' : 'text-gray-400 hover:text-white bg-gray-800/20'}`}
                      >
                          ÇEVİR
                      </button>
                  </nav>

                  <div className="text-[10px] text-gray-600 font-mono hidden md:block mt-auto">
                      SECURE CONNECTION<br/>ID: {user.id}
                  </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
                  <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white hidden md:block">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* --- TAB: DASHBOARD --- */}
                  {activeTab === 'DASHBOARD' && (
                      <div className="space-y-6 md:space-y-8 animate-fadeIn">
                          <h3 className="text-lg md:text-xl text-white font-heading tracking-widest border-b border-gray-700 pb-4">VARLIK DURUMU</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {/* CASH CARD */}
                              <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/30 p-6 rounded-xl relative overflow-hidden group">
                                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 md:w-24 md:h-24 text-green-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                  </div>
                                  <p className="text-green-400 text-sm font-bold tracking-widest mb-2">NAKİT BAKİYE (USD)</p>
                                  <p className="text-3xl md:text-4xl text-white font-mono font-bold break-all">${user.cash || 0}</p>
                                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                      DURUM: AKTİF
                                  </div>
                              </div>

                              {/* TOKEN CARD */}
                              <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 p-6 rounded-xl relative overflow-hidden group">
                                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 md:w-24 md:h-24 text-purple-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                                      </svg>
                                  </div>
                                  <p className="text-purple-400 text-sm font-bold tracking-widest mb-2">METASPACE TOKEN</p>
                                  <p className="text-3xl md:text-4xl text-white font-mono font-bold break-all">{user.tokens} TKN</p>
                                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                      AĞ: AURANET
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* --- TAB: DEPOSIT (PAYMENT) --- */}
                  {activeTab === 'DEPOSIT' && (
                      <div className="space-y-6 animate-fadeIn">
                          <h3 className="text-lg md:text-xl text-green-400 font-heading tracking-widest border-b border-gray-700 pb-4">BAKİYE YÜKLEME MERKEZİ</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <button onClick={() => setDepositMethod('CARD')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${depositMethod === 'CARD' ? 'bg-green-900/40 border-green-500 text-white' : 'bg-gray-800/40 border-gray-700 text-gray-500'}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                  </svg>
                                  KREDİ KARTI
                              </button>
                              <button onClick={() => setDepositMethod('CRYPTO')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${depositMethod === 'CRYPTO' ? 'bg-yellow-900/40 border-yellow-500 text-white' : 'bg-gray-800/40 border-gray-700 text-gray-500'}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                  </svg>
                                  KRİPTO (BTC/ETH)
                              </button>
                          </div>

                          <form onSubmit={handleDeposit} className="space-y-4 max-w-md mx-auto">
                              <div>
                                  <label className="block text-gray-400 text-xs mb-2">YÜKLENECEK MİKTAR ($)</label>
                                  <input 
                                    type="number" 
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white text-lg font-mono focus:border-green-500 outline-none"
                                    min="1"
                                    placeholder="0.00"
                                  />
                              </div>
                              
                              {/* Fake Credit Card Inputs */}
                              {depositMethod === 'CARD' && (
                                  <div className="space-y-4 p-4 bg-gray-800/30 rounded border border-gray-700">
                                      <div>
                                        <label className="block text-gray-400 text-xs mb-2">KART NUMARASI (Simülasyon)</label>
                                        <input 
                                            type="text" 
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white text-sm outline-none font-mono"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                      </div>
                                      <div className="flex gap-4">
                                          <div className="flex-1">
                                            <label className="block text-gray-400 text-xs mb-2">SKT</label>
                                            <input type="text" placeholder="MM/YY" onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white text-sm outline-none font-mono"/>
                                          </div>
                                          <div className="flex-1">
                                            <label className="block text-gray-400 text-xs mb-2">CVV</label>
                                            <input type="text" placeholder="123" onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white text-sm outline-none font-mono"/>
                                          </div>
                                      </div>
                                  </div>
                              )}

                              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded shadow-lg shadow-green-900/50 transition-all active:scale-[0.98]">
                                  GÜVENLİ ÖDEME YAP
                              </button>
                          </form>
                      </div>
                  )}

                  {/* --- TAB: TRANSFER --- */}
                  {activeTab === 'TRANSFER' && (
                      <div className="space-y-6 animate-fadeIn">
                          <h3 className="text-lg md:text-xl text-purple-400 font-heading tracking-widest border-b border-gray-700 pb-4">FON TRANSFERİ</h3>
                          
                          <div className="bg-gray-800/30 p-6 rounded-lg border border-gray-700 max-w-lg mx-auto">
                              <form onSubmit={handleTransfer} className="space-y-4">
                                  <div className="flex gap-2 mb-4">
                                        <button 
                                        type="button" 
                                        onClick={() => setTransferType('TOKEN')}
                                        className={`flex-1 py-2 text-sm font-bold border rounded ${transferType === 'TOKEN' ? 'bg-purple-600 border-purple-400 text-white' : 'border-gray-600 text-gray-400'}`}
                                        >
                                            TOKEN
                                        </button>
                                        <button 
                                        type="button"
                                        onClick={() => setTransferType('CASH')}
                                        className={`flex-1 py-2 text-sm font-bold border rounded ${transferType === 'CASH' ? 'bg-green-600 border-green-400 text-white' : 'border-gray-600 text-gray-400'}`}
                                        >
                                            NAKİT
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs mb-2">ALICI KULLANICI ADI</label>
                                        <input 
                                            type="text" 
                                            value={transferUsername}
                                            onChange={(e) => setTransferUsername(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white outline-none focus:border-cyan-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs mb-2">GÖNDERİLECEK MİKTAR</label>
                                        <input 
                                            type="number" 
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(Number(e.target.value))}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white outline-none focus:border-cyan-500"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 rounded mt-4 transition-colors">
                                        TRANSFERİ ONAYLA
                                    </button>
                              </form>
                          </div>
                      </div>
                  )}

                  {/* --- TAB: EXCHANGE --- */}
                  {activeTab === 'EXCHANGE' && (
                       <div className="space-y-6 animate-fadeIn">
                          <h3 className="text-lg md:text-xl text-pink-400 font-heading tracking-widest border-b border-gray-700 pb-4">DÖVİZ ÇEVİRİCİ</h3>
                          
                          <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-700 max-w-lg mx-auto text-center">
                              <div className="text-sm text-gray-400 mb-6">GÜNCEL KUR: <span className="text-white font-bold">1 USD = 10 TKN</span></div>

                              <form onSubmit={handleExchange} className="space-y-6">
                                  <div className="relative">
                                      <label className="block text-left text-green-400 text-xs mb-2 font-bold">NAKİT SAT ($)</label>
                                      <input 
                                          type="number" 
                                          value={exchangeAmount}
                                          onChange={(e) => setExchangeAmount(Number(e.target.value))}
                                          onKeyDown={(e) => e.stopPropagation()}
                                          className="w-full bg-black/50 border border-gray-600 rounded p-4 text-white text-xl font-mono outline-none focus:border-green-500"
                                          min="1"
                                          placeholder="0"
                                          required
                                      />
                                  </div>

                                  <div className="flex justify-center">
                                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                          </svg>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-left text-purple-400 text-xs mb-2 font-bold">ALINACAK TOKEN</label>
                                      <div className="w-full bg-black/30 border border-gray-700 rounded p-4 text-purple-300 text-xl font-mono">
                                          {exchangeAmount * 10} TKN
                                      </div>
                                  </div>

                                  <button type="submit" className="w-full bg-gradient-to-r from-pink-700 to-purple-700 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded shadow-lg transition-all">
                                      DÖNÜŞTÜR
                                  </button>
                              </form>
                          </div>
                       </div>
                  )}

              </div>
          </div>
      </div>
    </>
  );
};
