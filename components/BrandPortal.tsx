
import React, { useState, useEffect } from 'react';
import { MOCK_ADMIN_TOKEN } from '../constants';
import { Product, Brand, Coupon, Campaign, UserDesign } from '../types';
import { sqlService } from '../services/sqlService';

interface BrandPortalProps {
  brands: Brand[];
  onAddProduct: (brandId: string, product: Product) => void;
  onAddCoupon: (brandId: string, coupon: Coupon) => void;
  onAddCampaign: (brandId: string, campaign: Campaign) => void;
  onClose: () => void;
}

type TabType = 'INVENTORY' | 'CAMPAIGNS' | 'COUPONS' | 'DESIGN' | 'MARKET';

export const BrandPortal: React.FC<BrandPortalProps> = ({ brands, onAddProduct, onAddCoupon, onAddCampaign, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [brandIdInput, setBrandIdInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('INVENTORY');
  
  // Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdStock, setNewProdStock] = useState(10); 
  const [newProdType, setNewProdType] = useState<Product['geometry']>('box');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdModel, setNewProdModel] = useState('');

  // Coupon & Campaign Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDisc, setNewCouponDisc] = useState(10);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  // Design Studio State
  const activeBrand = brands.find(b => b.id === activeBrandId);
  const [wallColor, setWallColor] = useState(activeBrand?.podConfig?.wallColor || '#111111');
  const [floorColor, setFloorColor] = useState(activeBrand?.podConfig?.floorColor || '#222222');
  const [intensity, setIntensity] = useState(activeBrand?.podConfig?.lightIntensity || 1);

  // Market State
  const [marketDesigns, setMarketDesigns] = useState<UserDesign[]>([]);

  useEffect(() => {
      if (activeTab === 'MARKET') {
          const designs = sqlService.getDesignsForSale();
          setMarketDesigns(designs);
      }
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetBrand = brands.find(b => b.id === brandIdInput);

    if (!targetBrand) {
      setErrorMsg('HATA: MARKA KİMLİĞİ AĞDA BULUNAMADI');
      return;
    }

    if (keyInput === MOCK_ADMIN_TOKEN) {
      setIsVerifying(true);
      setTimeout(() => {
          setActiveBrandId(targetBrand.id);
          if(targetBrand.podConfig) {
             setWallColor(targetBrand.podConfig.wallColor);
             setFloorColor(targetBrand.podConfig.floorColor);
             setIntensity(targetBrand.podConfig.lightIntensity);
          }
          setIsAuthenticated(true);
          setIsVerifying(false);
      }, 2500);
    } else {
      setErrorMsg('ERİŞİM REDDEDİLDİ: GEÇERSİZ ŞİFRELEME ANAHTARI');
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      price: newProdPrice,
      stock: newProdStock,
      description: 'Yeni üretilen dijital varlık.',
      category: 'Yeni Gelenler',
      color: '#ffffff',
      geometry: newProdType,
      imageUrl: newProdImage || undefined,
      modelUrl: newProdModel || undefined
    };
    onAddProduct(activeBrandId, newProduct);
    
    setNewProdName(''); setNewProdPrice(0); setNewProdStock(10); setNewProdImage(''); setNewProdModel('');
    alert('Ürün Metaspace\'e başarıyla yüklendi.');
  };

  const handleSubmitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;
    const newCoupon: Coupon = { id: `c-${Date.now()}`, code: newCouponCode.toUpperCase(), discountPercentage: newCouponDisc };
    onAddCoupon(activeBrandId, newCoupon);
    setNewCouponCode(''); setNewCouponDisc(10);
    alert('Akıllı Kontrat (Kupon) Yayınlandı.');
  };

  const handleSubmitCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;
    const newCampaign: Campaign = { id: `cmp-${Date.now()}`, name: newCampaignName, description: newCampaignDesc, active: true };
    onAddCampaign(activeBrandId, newCampaign);
    setNewCampaignName(''); setNewCampaignDesc('');
    alert('Holografik Kampanya Yayını Başlatıldı.');
  };

  const handleSaveDesign = () => {
    if (!activeBrandId) return;
    sqlService.updateBrandDesign(activeBrandId, wallColor, floorColor, intensity);
    alert('Pod Tasarımı Güncellendi. Metaspace yeniden senkronize ediliyor...');
  };

  const handleBuyDesign = (designId: string) => {
      if (!activeBrandId) return;
      const res = sqlService.buyDesignAsBrand(activeBrandId, designId);
      if (res.success) {
          alert(res.msg);
          // Refresh list
          setMarketDesigns(sqlService.getDesignsForSale());
      } else {
          alert(res.msg);
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50">
        <div className="relative w-full max-w-md bg-gray-900/90 border border-gray-700 p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden animate-rgb-cycle">
             <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-400 z-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="text-center mb-8">
               <div className="text-cyan-500 text-xs tracking-[0.3em] mb-2 animate-pulse">GÜVENLİ GEÇİT</div>
               <h2 className="text-4xl font-heading font-black text-white italic">BRAND<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">PORTAL</span></h2>
             </div>
             {isVerifying ? (
                 <div className="flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-cyan-400 font-mono text-sm animate-pulse">DOĞRULANIYOR...</p>
                 </div>
             ) : (
                 <form onSubmit={handleLogin} className="space-y-6">
                    <div className="group">
                        <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">Marka Kimliği (ID)</label>
                        <input type="text" value={brandIdInput} onChange={(e) => setBrandIdInput(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="örn. 123" className="w-full bg-black/60 border border-gray-700 text-white p-4 font-mono focus:border-cyan-500 outline-none" />
                    </div>
                    <div className="group">
                        <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">Erişim Anahtarı</label>
                        <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="••••" className="w-full bg-black/60 border border-gray-700 text-white p-4 font-mono focus:border-pink-500 outline-none" />
                    </div>
                    {errorMsg && <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs text-center font-mono">[!] {errorMsg}</div>}
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 uppercase tracking-[0.2em] transition-all animate-rgb-cycle">BAĞLANTI KUR</button>
                 </form>
             )}
             <div className="mt-8 text-[10px] text-gray-700 font-mono text-center">DEMO ID: 123 | PASS: 123</div>
             <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono tracking-wider">
                <span>SQL SERVER SECURED</span>
             </div>
        </div>
      </div>
    );
  }

  const tabLabels: Record<TabType, string> = { 
      'INVENTORY': 'ENVANTER', 
      'CAMPAIGNS': 'KAMPANYALAR', 
      'COUPONS': 'KUPONLAR', 
      'DESIGN': 'POD TASARIM',
      'MARKET': 'YARATICI PAZARI' // New Label
  };

  return (
    <div className="absolute inset-0 bg-gray-900/95 z-40 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-6 gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow" style={{ backgroundColor: activeBrand?.color }}>
                <span className="text-2xl font-black text-black opacity-50">{activeBrand?.name.substring(0,1)}</span>
             </div>
             <div>
               <h1 className="text-3xl font-heading text-white tracking-wide">{activeBrand?.name}</h1>
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><p className="text-xs text-green-500 font-mono">ÇEVRİMİÇİ</p></div>
             </div>
          </div>
          <button onClick={onClose} className="bg-red-900/20 border border-red-800 text-red-400 px-6 py-2 rounded uppercase text-sm font-bold">BAĞLANTIYI KES</button>
        </header>

        <div className="flex mb-8 border-b border-gray-700 overflow-x-auto">
           {(Object.keys(tabLabels) as TabType[]).map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-heading font-bold tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
               {tabLabels[tab]}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/40 p-6 rounded-lg border border-gray-800">
               <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4">CANLI VERİLER</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-800/50 p-3 rounded"><p className="text-xs text-gray-500">ÜRÜNLER</p><p className="text-2xl font-mono text-cyan-400">{activeBrand?.products.length}</p></div>
                 <div className="bg-gray-800/50 p-3 rounded"><p className="text-xs text-gray-500">TOPLAM STOK</p><p className="text-2xl font-mono text-purple-400">{activeBrand?.products.reduce((acc, p) => acc + (p.stock || 0), 0)}</p></div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'INVENTORY' && (
              <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-heading text-white mb-6">Yeni Ürün Oluştur (Mint)</h3>
                  <form onSubmit={handleSubmitProduct} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input required type="text" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-black/50 text-white p-3 rounded border border-gray-600 outline-none" placeholder="Ürün Adı" />
                          <input required type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} onKeyDown={(e) => e.stopPropagation()} className="bg-black/50 text-white p-3 rounded border border-gray-600 outline-none" placeholder="Fiyat (TKN)" />
                          <div className="relative">
                            <label className="absolute -top-2 left-2 text-[10px] bg-gray-800 px-1 text-gray-400">STOK</label>
                            <input required type="number" value={newProdStock} onChange={(e) => setNewProdStock(Number(e.target.value))} onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 text-white p-3 rounded border border-gray-600 outline-none" placeholder="Stok Adedi" />
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 rounded shadow-lg transition-all">VARLIĞI YÜKLE</button>
                  </form>
              </div>
            )}

            {activeTab === 'CAMPAIGNS' && (
                <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-heading text-white mb-6">Kampanya Başlat</h3>
                    <form onSubmit={handleSubmitCampaign} className="space-y-6">
                        <input required type="text" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 text-white p-3 rounded border border-gray-600 outline-none" placeholder="Kampanya Başlığı" />
                        <textarea required value={newCampaignDesc} onChange={(e) => setNewCampaignDesc(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 text-white p-3 rounded border border-gray-600 outline-none h-24" placeholder="Mesaj..." />
                        <button type="submit" className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded">YAYINI BAŞLAT</button>
                    </form>
                </div>
            )}

            {activeTab === 'COUPONS' && (
                 <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-heading text-white mb-6">Kupon Oluştur</h3>
                    <form onSubmit={handleSubmitCoupon} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <input required type="text" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="bg-black/50 text-white p-3 rounded border border-gray-600 outline-none uppercase" placeholder="KOD" />
                            <input required type="number" value={newCouponDisc} onChange={(e) => setNewCouponDisc(Number(e.target.value))} onKeyDown={(e) => e.stopPropagation()} min="1" max="100" className="bg-black/50 text-white p-3 rounded border border-gray-600 outline-none" placeholder="%" />
                        </div>
                        <button type="submit" className="w-full bg-pink-700 hover:bg-pink-600 text-white font-bold py-3 rounded">DAĞIT</button>
                    </form>
                 </div>
            )}

            {activeTab === 'DESIGN' && (
                <div className="bg-gray-800/30 p-8 rounded-lg border border-gray-700 shadow-xl space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-heading text-white mb-4">Pod Mimari Editörü</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-xs mb-2">DUVAR RENGİ (HEX)</label>
                            <input type="color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                        </div>
                        <button onClick={handleSaveDesign} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 text-white font-bold py-3 rounded">TASARIMI KAYDET & YAYINLA</button>
                    </div>
                </div>
            )}

            {/* NEW: CREATIVE MARKET TAB */}
            {activeTab === 'MARKET' && (
                <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xl font-heading text-pink-400 mb-2">Yaratıcı Topluluk Pazarı</h3>
                    <p className="text-sm text-gray-400 mb-6">Bağımsız tasarımcıların eserlerini keşfedin ve lisanslayarak mağazanıza ekleyin.</p>
                    
                    {marketDesigns.length === 0 ? (
                        <div className="text-center py-10 border border-gray-700 rounded bg-black/20 text-gray-500">
                            Şu anda satışta olan tasarım yok.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {marketDesigns.map(design => (
                                <div key={design.id} className="bg-black/40 border border-pink-500/30 p-4 rounded hover:border-pink-500 transition-colors flex gap-4">
                                    <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center shrink-0 border border-gray-700">
                                        <span className="text-xs text-gray-500">{design.config.geometry}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-bold">{design.name}</h4>
                                            <span className="text-pink-400 font-mono font-bold">{design.price} TKN</span>
                                        </div>
                                        <p className="text-xs text-gray-400 my-1">by {design.username}</p>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">{design.description}</p>
                                        <button 
                                            onClick={() => handleBuyDesign(design.id)}
                                            className="w-full bg-pink-900/50 hover:bg-pink-700 text-pink-200 text-xs font-bold py-2 rounded border border-pink-700 transition-colors"
                                        >
                                            LİSANSI SATIN AL & ENVANTERE EKLE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
