import React, { useState, useEffect } from 'react';
import { User, GlobalComment } from '../types';
import { sqlService } from '../services/sqlService';

interface SocialHubPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const SocialHubPanel: React.FC<SocialHubPanelProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'CHAT'>('FEED');
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<GlobalComment[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Polling for updates
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = () => {
      if (activeTab === 'FEED') {
        const orders = sqlService.getAllRecentOrders();
        setFeedItems(orders);
      } else {
        const comments = sqlService.getGlobalComments();
        setChatMessages(comments.reverse());
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sqlService.addGlobalComment(
        user.id, 
        user.username, 
        newMessage, 
        user.avatarUrl || 'https://via.placeholder.com/50'
    );
    setNewMessage('');
    // Refresh immediately
    const comments = sqlService.getGlobalComments();
    setChatMessages(comments.reverse());
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Slide-out Panel */}
      <div className={`fixed inset-y-0 left-0 w-full md:w-[450px] bg-gray-900 border-r border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-black/50 p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
                <h2 className="text-2xl text-white font-heading tracking-widest">SOCIAL HUB</h2>
                <p className="text-[10px] text-cyan-500 font-mono tracking-wider">GLOBAL ACTIVITY STREAM</p>
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
                onClick={() => setActiveTab('FEED')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest transition-colors ${activeTab === 'FEED' ? 'text-cyan-400 bg-cyan-900/20 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
                ACTIVITY FEED
            </button>
            <button 
                onClick={() => setActiveTab('CHAT')}
                className={`flex-1 py-4 text-sm font-bold tracking-widest transition-colors ${activeTab === 'CHAT' ? 'text-pink-400 bg-pink-900/20 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
                LOBBY CHAT
            </button>
        </div>

        {/* Content Area */}
        <div className="p-4 h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-900 to-black relative">
            
            {activeTab === 'FEED' && (
                <div className="space-y-4 animate-fadeIn">
                    {feedItems.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">Henüz aktivite yok.</div>
                    ) : (
                        feedItems.map((item, idx) => (
                            <div key={idx} className="bg-gray-800/40 border border-gray-700 p-4 rounded-lg flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-cyan-500/30">
                                    {item.avatarUrl ? <img src={item.avatarUrl} className="w-full h-full object-cover"/> : null}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-cyan-400 font-bold mb-1">{item.username} <span className="text-gray-400 font-normal">satın aldı:</span></p>
                                    <div className="space-y-1">
                                        {item.items.map((prod: any, i: number) => (
                                            <div key={i} className="text-sm text-white font-mono flex justify-between">
                                                <span>{prod.name}</span>
                                                <span className="text-gray-500">{prod.price} TKN</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-500 flex justify-between border-t border-gray-700 pt-1">
                                        <span>{item.orderDate}</span>
                                        <span className="text-cyan-600 font-bold">TOTAL: {item.orderTotal} TKN</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'CHAT' && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar flex flex-col-reverse mb-4">
                        {chatMessages.length === 0 && <p className="text-center text-gray-600 text-xs">Sohbet odası boş.</p>}
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-pink-500/30">
                                     <img src={msg.avatarUrl || 'https://via.placeholder.com/50'} className="w-full h-full object-cover"/>
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-lg text-xs ${msg.userId === user.id ? 'bg-pink-900/40 text-white rounded-tr-none border border-pink-500/30' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                                    <div className="flex justify-between items-baseline mb-1 gap-2">
                                        <span className={`font-bold ${msg.userId === user.id ? 'text-pink-300' : 'text-gray-400'}`}>{msg.username}</span>
                                        <span className="text-[8px] opacity-50">{msg.timestamp}</span>
                                    </div>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="relative">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()} 
                            placeholder="Mesaj gönder..."
                            className="w-full bg-black/50 border border-gray-600 rounded-full py-3 px-4 pr-12 text-white text-sm outline-none focus:border-pink-500 focus:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-pink-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </>
  );
};