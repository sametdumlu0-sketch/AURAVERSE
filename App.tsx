
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei';
import { Brand, Product, ViewState, User, Coupon, Campaign } from './types';
import { GalaxyBackground, BrandPodMesh, ProductMesh, UserAvatar, AuraverseTitle3D, OtherUser } from './components/ThreeElements';
import { AIAssistant } from './components/AIAssistant';
import { BrandPortal } from './components/BrandPortal';
import { UserAuth } from './components/UserAuth';
import { SearchOmnibar } from './components/SearchOmnibar'; 
import { CartPanel } from './components/CartPanel'; 
import { WalletPanel } from './components/WalletPanel';
import { VerificationPortal } from './components/VerificationPortal'; 
import { ProfilePanel } from './components/ProfilePanel'; 
import { ProductARModal } from './components/ProductARModal'; 
import { SocialPanel } from './components/SocialPanel';
import { SocialHubPanel } from './components/SocialHubPanel';
import { DesignStudio } from './components/DesignStudio'; // New Import
import { sqlService } from './services/sqlService';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.GALAXY);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [isInputFocused, setIsInputFocused] = useState(false); 
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [isWalletOpen, setIsWalletOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [isSocialHubOpen, setIsSocialHubOpen] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [dpr, setDpr] = useState(1.5);

  const mockVisitors = useMemo(() => [
      { id: 1, name: 'Cyber_Drifter', pos: [3, 0, 2] },
      { id: 2, name: 'Neon_Viper', pos: [-4, 0, 3] },
      { id: 3, name: 'Data_Miner', pos: [2, 0, -4] },
      { id: 4, name: 'Glitch_Hunter', pos: [-3, 0, -3] },
  ], []);

  const handleSearchFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      setTimeout(() => {
        try {
          sqlService.initDatabase();
          const loadedBrands = sqlService.getAllBrands();
          setBrands(loadedBrands);
          setIsDbReady(true);
        } catch (e) {
          console.error("Database Error:", e);
        }
      }, 500);
    };
    init();
  }, []);

  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (viewState === ViewState.POD_VIEW && user && activeBrandId) {
          timer = setTimeout(() => {
              sqlService.addTokenReward(user.id, 50);
              refreshUserBalance();
              setRewardNotification("⏳ Marka Etkileşim Bonusu: +50 TKN");
              setTimeout(() => setRewardNotification(null), 4000);
          }, 30000);
      }
      return () => { if (timer) clearTimeout(timer); };
  }, [viewState, user, activeBrandId]);

  const enterPod = useCallback((brandId: string) => {
    setActiveBrandId(brandId);
    setViewState(ViewState.POD_VIEW);
    if (user) {
        sqlService.addTokenReward(user.id, 100);
        refreshUserBalance();
        setRewardNotification("🚀 Pod Giriş Ödülü: +100 TKN");
        setTimeout(() => setRewardNotification(null), 3000);
    }
  }, [user]);

  const returnToGalaxy = useCallback(() => {
    setActiveBrandId(null);
    setViewState(ViewState.GALAXY);
  }, []);

  const openAdmin = () => {
    setViewState(ViewState.ADMIN_LOGIN);
  };

  const openUserAuth = () => {
    setViewState(ViewState.USER_LOGIN);
  };

  const handleUserLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    const { isEmailVerified, isPhoneVerified, isIdVerified } = loggedInUser.verification;
    if (!isEmailVerified || !isPhoneVerified || !isIdVerified) {
        setViewState(ViewState.VERIFICATION);
    } else {
        setViewState(ViewState.GALAXY);
    }
  };

  const handleVerificationComplete = (updatedUser: User) => {
      setUser(updatedUser);
      setViewState(ViewState.GALAXY);
      alert("Kimlik Doğrulama Başarılı. Auraverse'e Hoş Geldiniz.");
  };

  const refreshUserBalance = () => {
      if (user) {
          const updatedUser = sqlService.getUserById(user.id);
          if (updatedUser) {
              setUser({ ...updatedUser, cart: user.cart });
          }
      }
  };

  const addToCart = useCallback((product: Product) => {
    if (!user) {
        alert("Lütfen önce giriş yapın.");
        setViewState(ViewState.USER_LOGIN);
        return;
    }
    if (user.tokens >= product.price) {
      setUser(prev => prev ? ({ ...prev, cart: [...prev.cart, product] }) : null);
      setCartNotification(`${product.name} sepete eklendi`);
      setTimeout(() => setCartNotification(null), 3000);
    } else {
      alert("Yetersiz Token Bakiyesi (Tahmini).");
    }
  }, [user]);

  const removeFromCart = (index: number, product: Product) => {
    if (!user) return;
    const newCart = [...user.cart];
    newCart.splice(index, 1);
    setUser({ ...user, cart: newCart });
  };

  const checkoutCart = () => {
      if(!user) return;
      const total = user.cart.reduce((sum, item) => sum + item.price, 0);
      if (user.tokens < total) {
          alert("HATA: Yetersiz Bakiye.");
          return;
      }
      sqlService.createOrder(user.id, user.cart, total);
      alert(`Sipariş Onaylandı! Toplam: ${total} TKN hesaptan düşüldü.`);
      const updatedUser = sqlService.getUserById(user.id);
      if (updatedUser) {
          setUser({ ...updatedUser, cart: [] });
      }
      setIsCartOpen(false);
  };

  const handleAddProduct = (brandId: string, product: Product) => {
    sqlService.addProduct(brandId, product);
    setBrands(sqlService.getAllBrands());
  };

  const handleAddCoupon = (brandId: string, coupon: Coupon) => {
    sqlService.addCoupon(brandId, coupon);
    setBrands(sqlService.getAllBrands());
  };

  const handleAddCampaign = (brandId: string, campaign: Campaign) => {
    sqlService.addCampaign(brandId, campaign);
    setBrands(sqlService.getAllBrands());
  };

  const currentContextProducts = useMemo(() => {
    if (viewState === ViewState.POD_VIEW && activeBrandId) {
      return brands.find(b => b.id === activeBrandId)?.products || [];
    }
    return brands.flatMap(b => b.products); 
  }, [viewState, activeBrandId, brands]);

  const FluidText = ({ text, className, delayMultiplier = 0.1 }: { text: string, className?: string, delayMultiplier?: number }) => (
    <span className={`inline-flex ${className}`}>
        {text.split('').map((char, i) => (
            <span key={i} className="animate-letter-blink" style={{ animationDelay: `${i * delayMultiplier}s` }}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ))}
    </span>
  );

  if (!isDbReady) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center flex-col">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-500 font-heading tracking-widest animate-pulse">SQL SERVER BAĞLANTISI KURULUYOR...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene - Hidden when in Design Studio */}
      {viewState !== ViewState.DESIGN_STUDIO && (
        <div className="absolute inset-0 z-0">
            <Canvas shadows dpr={dpr}>
            <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
            <PerspectiveCamera makeDefault position={viewState === ViewState.POD_VIEW ? [0, 2, 10] : [0, 30, 60]} fov={60} />
            <OrbitControls 
                enabled={!isInputFocused}
                enablePan={true} 
                enableZoom={true}
                autoRotate={!user && viewState === ViewState.GALAXY} 
                autoRotateSpeed={0.5}
                maxDistance={viewState === ViewState.POD_VIEW ? 20 : 150}
                minDistance={5}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            
            <GalaxyBackground />

            {viewState === ViewState.GALAXY && <AuraverseTitle3D />}
            <UserAvatar />

            {viewState === ViewState.GALAXY && (
                <group>
                {brands.map(brand => (
                    <BrandPodMesh key={brand.id} brand={brand} onClick={enterPod} />
                ))}
                </group>
            )}

            {viewState === ViewState.POD_VIEW && activeBrandId && (
                <group>
                {brands.find(b => b.id === activeBrandId)?.products.map((product, idx) => {
                    const angle = (idx / 5) * Math.PI * 2; 
                    const radius = 4;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    return (
                    <ProductMesh 
                        key={product.id} 
                        product={product} 
                        position={[x, 0, z]} 
                        onAddToCart={addToCart}
                        onViewDetails={(p) => setSelectedProduct(p)}
                    />
                    );
                })}
                {mockVisitors.map(v => (
                    <OtherUser key={v.id} position={v.pos as [number, number, number]} name={v.name} />
                ))}
                <gridHelper args={[20, 20, 0x444444, 0x222222]} />
                </group>
            )}
            </Canvas>
        </div>
      )}

      {/* Notifications */}
      {rewardNotification && (
          <div className="absolute top-24 md:top-32 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
              <div className="bg-black/80 backdrop-blur border border-green-500 text-green-400 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-3 font-bold tracking-widest text-xs md:text-base whitespace-nowrap">
                   {rewardNotification}
              </div>
          </div>
      )}
      {cartNotification && (
          <div className="absolute top-20 left-16 z-50 animate-float">
             <div className="bg-black/90 backdrop-blur border border-cyan-500 text-cyan-400 px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-3">
                 <div className="bg-cyan-500/20 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></div>
                 <div><p className="text-xs font-bold uppercase tracking-wide">ENVANTERE EKLENDİ</p><p className="text-[10px] text-gray-400 font-mono">{cartNotification}</p></div>
             </div>
          </div>
      )}

      {/* UI Overlay (HUD) */}
      {viewState !== ViewState.DESIGN_STUDIO && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
            
            {/* LOGOS (Mobile/Desktop) - Copied from previous logic */}
            <div className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 text-center w-full flex flex-col items-center">
                <div className="w-12 h-12 relative mb-1 animate-float">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                        <defs><linearGradient id="shieldGradMob" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                        <path d="M50 5 L90 25 V55 C90 80 50 95 50 95 C50 95 10 80 10 55 V25 L50 5 Z" fill="rgba(0,0,0,0.5)" stroke="url(#shieldGradMob)" strokeWidth="3" />
                        <path d="M35 50 V40 A15 15 0 0 1 65 40 V50 H70 V80 H30 V50 H35 M42 40 A8 8 0 0 1 58 40 V50 H42 V40" fill="white" className="drop-shadow-sm" />
                        <circle cx="50" cy="65" r="3" fill="#000" /><path d="M50 65 L50 73" stroke="#000" strokeWidth="2" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center text-[8px] font-bold border border-yellow-200 shadow-lg text-yellow-900 animate-bounce">₿</div>
                </div>
                <h1 className="text-3xl font-black font-heading tracking-widest drop-shadow-md"><FluidText text="AURAVERSE" className="animate-rgb-cycle" delayMultiplier={0.1}/></h1>
                <p className="text-[9px] text-cyan-400 tracking-[0.3em] font-mono font-bold mt-1 uppercase">FORT KNOX OF FINANCE</p>
            </div>

            <div className="hidden md:flex absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none z-40 text-center flex-col items-center">
                <div className="w-20 h-20 relative mb-2 animate-float">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        <defs><linearGradient id="shieldGradDesk" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                        <path d="M50 5 L90 25 V55 C90 80 50 95 50 95 C50 95 10 80 10 55 V25 L50 5 Z" fill="rgba(0,0,0,0.5)" stroke="url(#shieldGradDesk)" strokeWidth="2" />
                        <path d="M35 50 V40 A15 15 0 0 1 65 40 V50 H70 V80 H30 V50 H35 M42 40 A8 8 0 0 1 58 40 V50 H42 V40" fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        <circle cx="50" cy="65" r="3" fill="#000" /><path d="M50 65 L50 73" stroke="#000" strokeWidth="2" />
                    </svg>
                    <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-yellow-900 animate-bounce" style={{ animationDelay: '0.5s' }}>₿</div>
                    <div className="absolute bottom-2 -left-2 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center text-[8px] font-bold border border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-yellow-900 animate-bounce" style={{ animationDelay: '1.2s' }}>₿</div>
                </div>
                <h1 className="text-6xl font-black font-heading tracking-widest drop-shadow-md"><FluidText text="AURAVERSE" className="animate-rgb-cycle" delayMultiplier={0.15}/></h1>
                <p className="text-xs text-cyan-400 tracking-[0.6em] mt-2 font-mono font-bold uppercase drop-shadow">FORT KNOX OF FINANCE</p>
            </div>

            <div className="flex justify-between items-start pointer-events-auto w-full">
            {/* LEFT SIDE: Menu Button */}
            <div className="flex gap-2 md:gap-4 mt-2 md:mt-0">
                {/* HAMBURGER MENU */}
                {user && (
                    <div className="relative group z-[60] flex flex-col items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer z-50 group`} onPointerDown={(e) => e.stopPropagation()}>
                            <div className={`absolute inset-0 rounded-full bg-cyan-500 blur-md opacity-20 group-hover:opacity-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-60' : ''}`}></div>
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                                <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ccc" /><stop offset="50%" stopColor="#555" /><stop offset="100%" stopColor="#ccc" /></linearGradient><linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff3300" /><stop offset="100%" stopColor="#ffaa00" /></linearGradient><linearGradient id="wingGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00ccff" /><stop offset="100%" stopColor="#0066cc" /></linearGradient></defs>
                                <circle cx="50" cy="50" r="48" fill="#0a0a15" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ringGrad)" strokeWidth="3" />
                                <path d="M 35 45 Q 45 35 60 40 L 55 44 L 62 47 L 55 52 L 40 52 Q 35 50 35 45 Z" fill="url(#wingGrad)" />
                                <path d="M 60 42 L 85 50 L 60 58 L 65 50 Z" fill="url(#arrowGrad)" />
                                <path d="M 52 35 L 48 48 L 54 48 L 50 60 L 62 45 L 56 45 Z" fill="#ffffff" stroke="#ccc" strokeWidth="0.5" />
                                <text x="50" y="75" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Orbitron, sans-serif" fontWeight="bold" letterSpacing="1" className="drop-shadow-md">PANEL</text>
                                <path d="M 30 82 H 70 M 67 79 L 70 82 L 67 85" stroke="#fff" strokeWidth="1" fill="none" />
                            </svg>
                        </button>

                        <div className={`absolute top-0 left-full ml-2 w-56 md:w-64 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden transition-all duration-300 origin-top-left ${isMenuOpen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-4 pointer-events-none'}`}>
                            <div className="p-2 space-y-1">
                                <button onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-900/30 text-gray-300 hover:text-cyan-400 transition-colors rounded group/item cursor-pointer">
                                    <span className="block font-bold text-sm tracking-wider">SEPETİM</span>
                                    {user.cart.length > 0 && (<span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{user.cart.length}</span>)}
                                </button>
                                <button onClick={() => { setIsWalletOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-900/30 text-gray-300 hover:text-green-400 transition-colors rounded group/item cursor-pointer">
                                    <span className="block font-bold text-sm tracking-wider">CÜZDAN</span>
                                </button>
                                <button onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900/30 text-gray-300 hover:text-purple-400 transition-colors rounded group/item cursor-pointer">
                                    <span className="block font-bold text-sm tracking-wider">PROFİL</span>
                                </button>
                                <button onClick={() => { setIsSocialHubOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-900/30 text-gray-300 hover:text-pink-400 transition-colors rounded group/item cursor-pointer">
                                    <span className="block font-bold text-sm tracking-wider">SOSYAL</span>
                                </button>
                                {/* NEW: STUDIO LINK */}
                                <button onClick={() => { setViewState(ViewState.DESIGN_STUDIO); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-900/30 text-gray-300 hover:text-yellow-400 transition-colors rounded group/item cursor-pointer border-t border-gray-700/50">
                                    <span className="block font-bold text-sm tracking-wider">TASARIM STÜDYOSU</span>
                                </button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button onClick={() => { setUser(null); setIsMenuOpen(false); setViewState(ViewState.GALAXY); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors rounded cursor-pointer">
                                    <span className="text-xs font-bold ml-auto">GÜVENLİ ÇIKIŞ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Top Right HUD */}
            {user && (
                <div className="hidden md:flex bg-black/20 backdrop-blur-md border-l-2 border-b-2 border-cyan-500/30 rounded-bl-[3rem] pl-10 pr-4 py-6 flex-col items-end gap-2 transition-all duration-500 hover:bg-black/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)] hover:border-cyan-400 group">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="text-right"><p className="text-[10px] text-cyan-400 tracking-[0.3em] font-heading mb-1 opacity-70 group-hover:opacity-100 transition-opacity">CITIZEN ID</p><h3 className="text-2xl text-white font-bold tracking-wide shadow-cyan-500/50 drop-shadow-sm group-hover:text-cyan-100 transition-colors">{user.username}</h3></div>
                        <div className="relative"><div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">{user.avatarUrl ? (<img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600"></div>)}</div><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div></div>
                    </div>
                    <div className="w-48 h-[1px] bg-gradient-to-l from-cyan-500/50 via-cyan-500/20 to-transparent my-1 group-hover:w-56 transition-all duration-500"></div>
                    <div className="flex items-end gap-8 mt-2">
                        <div className="text-right group-hover:-translate-x-2 transition-transform duration-300"><p className="text-[10px] text-green-400 tracking-[0.1em] font-bold">CASH</p><p className="text-gray-300 font-mono text-sm">${user.cash || 0}</p></div>
                        <div className="text-right"><p className="text-[10px] text-pink-500 tracking-[0.1em] font-bold">CREDITS</p><p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-black font-mono tracking-wider drop-shadow-[0_0_5px_rgba(236,72,153,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] transition-all duration-300">{user.tokens}</p></div>
                    </div>
                </div>
            )}
            </div>

            {user && (
                <div className="absolute top-36 md:top-48 left-0 right-0 pl-12 md:pl-0 z-20 flex justify-center w-full pointer-events-none">
                    <SearchOmnibar brands={brands} onSelectBrand={enterPod} onFocus={handleSearchFocus} onBlur={handleSearchBlur} />
                </div>
            )}

            {/* ENTRY BUTTONS */}
            {viewState === ViewState.GALAXY && !user && (
            <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center pointer-events-none gap-6 md:gap-16 p-4 mt-12 md:mt-0">
                <button onClick={openUserAuth} onPointerDown={(e) => e.stopPropagation()} className="pointer-events-auto group relative w-[85%] max-w-xs h-32 md:w-80 md:h-48 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col items-center justify-center border border-green-500/30 cursor-pointer animate-rgb-cycle animate-float hover:scale-105 hover:-translate-y-2 hover:border-green-400 hover:shadow-[0_0_50px_rgba(34,197,94,0.4)] active:scale-95 active:translate-y-1 transition-all duration-300 ease-out text-current">
                <div className="text-inherit mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <h2 className="text-xl md:text-3xl font-heading font-bold text-inherit tracking-widest group-hover:text-green-300 transition-colors">CITIZEN ACCESS</h2>
                </button>
                <button onClick={openAdmin} onPointerDown={(e) => e.stopPropagation()} className="pointer-events-auto group relative w-[85%] max-w-xs h-32 md:w-80 md:h-48 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col items-center justify-center border border-cyan-500/30 cursor-pointer animate-rgb-cycle animate-float-delayed hover:scale-105 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] active:scale-95 active:translate-y-1 transition-all duration-300 ease-out text-current">
                <div className="text-inherit mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
                </div>
                <h2 className="text-xl md:text-3xl font-heading font-bold text-inherit tracking-widest group-hover:text-cyan-300 transition-colors">BRAND ACCESS</h2>
                </button>
            </div>
            )}

            {/* Bottom Bar */}
            <div className="flex justify-between items-end pointer-events-auto h-20">
            <div className="flex gap-4">
                {viewState === ViewState.POD_VIEW && (
                <button onClick={returnToGalaxy} className="bg-gray-800/80 hover:bg-gray-700 text-white px-6 py-2 rounded border border-gray-600 font-bold transition-all cursor-pointer">← EXIT POD</button>
                )}
            </div>
            {/* TRADE UP, CASH IN LOGO */}
            {viewState === ViewState.GALAXY && !user && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-80 pointer-events-none z-30">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 mb-2 text-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="200" strokeLinecap="round" className="opacity-80" />
                        <path d="M 50 10 L 60 20 L 50 30 M 60 20 L 50 20" stroke="currentColor" strokeWidth="4" fill="none" />
                        <text x="50" y="65" textAnchor="middle" fill="currentColor" fontSize="35" fontFamily="monospace" fontWeight="bold">$</text>
                    </svg>
                    <h3 className="text-xl font-heading font-black text-gray-300 tracking-widest uppercase">TRADE UP, CASH IN</h3>
                    <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase">Exchange. Upgrade. Prosper.</p>
                </div>
            )}
            </div>
        </div>
      )}

      {/* Overlays */}
      <div className="pointer-events-auto z-20">
        <AIAssistant products={currentContextProducts} user={user} />
        {user && <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={user.cart} onRemoveItem={removeFromCart} onCheckout={checkoutCart} user={user} />}
        {user && <WalletPanel isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} user={user} onBalanceUpdate={refreshUserBalance} />}
        {user && <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onProfileUpdate={refreshUserBalance} />}
        {user && <SocialHubPanel isOpen={isSocialHubOpen} onClose={() => setIsSocialHubOpen(false)} user={user} />}
        {user && viewState === ViewState.POD_VIEW && activeBrandId && <SocialPanel brandId={activeBrandId} user={user} />}
        {selectedProduct && <ProductARModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
      </div>

      {/* Full Screen Modules */}
      {viewState === ViewState.DESIGN_STUDIO && user && (
          <DesignStudio user={user} onClose={() => setViewState(ViewState.GALAXY)} />
      )}

      {(viewState === ViewState.ADMIN_LOGIN || viewState === ViewState.ADMIN_DASHBOARD) && (
        <BrandPortal brands={brands} onAddProduct={handleAddProduct} onAddCoupon={handleAddCoupon} onAddCampaign={handleAddCampaign} onClose={() => setViewState(ViewState.GALAXY)} />
      )}

      {viewState === ViewState.USER_LOGIN && (
        <UserAuth onLoginSuccess={handleUserLogin} onClose={() => setViewState(ViewState.GALAXY)} />
      )}

      {viewState === ViewState.VERIFICATION && user && (
          <VerificationPortal user={user} onVerificationComplete={handleVerificationComplete} />
      )}
    </div>
  );
}
