
import React, { useState, useEffect } from 'react';
import { User, Comment } from '../types';
import { sqlService } from '../services/sqlService';

interface SocialPanelProps {
  brandId: string;
  user: User | null;
}

export const SocialPanel: React.FC<SocialPanelProps> = ({ brandId, user }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Poll comments every 2 seconds to simulate "Real Time"
    const fetchComments = () => {
        const data = sqlService.getCommentsForBrand(brandId);
        setComments(data.reverse()); // Newest first
    };

    fetchComments();
    const interval = setInterval(fetchComments, 2000);
    return () => clearInterval(interval);
  }, [brandId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    sqlService.addComment(
        brandId, 
        user.id, 
        user.username, 
        newComment, 
        user.avatarUrl || 'https://via.placeholder.com/50'
    );
    setNewComment('');
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 bg-black/60 backdrop-blur border border-purple-500/50 text-purple-400 p-3 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-110 transition-transform flex items-center gap-2 pointer-events-auto"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="text-xs font-bold hidden md:inline">CANLI SOHBET</span>
          </button>
      );
  }

  return (
    <div className="fixed bottom-24 right-4 w-72 h-80 bg-gray-900/90 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-2xl flex flex-col z-40 pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-black/40 rounded-t-lg">
            <h4 className="text-purple-400 font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                POD SOHBETİ
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar flex flex-col-reverse">
            {comments.length === 0 && <p className="text-center text-gray-600 text-xs py-4">Sessizlik hakim...</p>}
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-gray-600">
                        <img src={comment.avatarUrl} alt="av" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-white font-bold">{comment.username}</span>
                            <span className="text-[9px] text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-300 break-words">{comment.text}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-black/40 rounded-b-lg">
            {user ? (
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Bir şeyler yaz..."
                        className="flex-1 bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 focus:border-purple-500 outline-none"
                    />
                    <button type="submit" className="text-purple-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    </button>
                </div>
            ) : (
                <p className="text-[10px] text-center text-gray-500">Sohbet için giriş yapmalısınız.</p>
            )}
        </form>
    </div>
  );
};
