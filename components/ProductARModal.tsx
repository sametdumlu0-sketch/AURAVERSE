
import React from 'react';
import { Product } from '../types';

interface ProductARModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductARModal: React.FC<ProductARModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  // Placeholder GLB for demo purposes if modelUrl is missing or invalid
  const demoModelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  
  // Workaround for TypeScript error with Web Components: Cast string to any to bypass IntrinsicElements check
  const ModelViewer = 'model-viewer' as any;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <div className="bg-gray-900 border border-cyan-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] relative flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/50">
             <h3 className="text-xl font-heading text-white">{product.name}</h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
             {/* AR Viewer Section */}
             <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <ModelViewer 
                    src={product.modelUrl || demoModelUrl} 
                    alt={product.name}
                    auto-rotate
                    camera-controls
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    shadow-intensity="1"
                    className="w-full h-[300px]"
                >
                    <button slot="ar-button" className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                        AR İLE GÖRÜNTÜLE
                    </button>
                </ModelViewer>
                {!product.modelUrl && <div className="absolute top-2 left-2 bg-black/70 text-gray-300 text-[10px] px-2 py-1 rounded">DEMO MODEL GÖSTERİLİYOR</div>}
             </div>

             {/* Details */}
             <div className="space-y-4">
                 <div className="flex justify-between items-end">
                     <span className="text-cyan-400 font-mono text-2xl font-bold">{product.price} TKN</span>
                     <span className={`text-xs px-2 py-1 rounded border ${product.stock > 0 ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                        {product.stock > 0 ? `STOKTA (${product.stock})` : 'TÜKENDİ'}
                     </span>
                 </div>
                 <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
                 
                 <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500">
                     <div className="bg-gray-800/50 p-2 rounded">KAT: {product.category}</div>
                     <div className="bg-gray-800/50 p-2 rounded">RENK: {product.color}</div>
                 </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-800 bg-black/50 flex gap-4">
              <button 
                onClick={() => { onAddToCart(product); onClose(); }} 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded uppercase tracking-wider transition-all"
              >
                  SEPETE EKLE
              </button>
          </div>
       </div>
    </div>
  );
};
