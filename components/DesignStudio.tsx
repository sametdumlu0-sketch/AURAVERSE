
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float } from '@react-three/drei';
import * as THREE from 'three';
import { User, DesignConfig } from '../types';
import { sqlService } from '../services/sqlService';
import { generateDesignFromPrompt } from '../services/geminiService';

interface DesignStudioProps {
  user: User;
  onClose: () => void;
}

const PreviewMesh = ({ config }: { config: DesignConfig }) => {
    const meshRef = useRef<any>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    // Dynamic Texture Loading
    useEffect(() => {
        if (config.textureUrl) {
            new THREE.TextureLoader().load(
                config.textureUrl,
                (loadedTexture) => {
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.RepeatWrapping;
                    setTexture(loadedTexture);
                },
                undefined,
                (err) => console.error("Texture load failed", err)
            );
        } else {
            setTexture(null);
        }
    }, [config.textureUrl]);

    useFrame((state, delta) => {
        if(meshRef.current) meshRef.current.rotation.y += delta * 0.5;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                {config.geometry === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
                {config.geometry === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
                {config.geometry === 'cone' && <coneGeometry args={[1, 2, 32]} />}
                {config.geometry === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 32]} />}
                
                <meshStandardMaterial 
                    color={config.baseColor} 
                    roughness={config.roughness} 
                    metalness={config.metalness}
                    map={texture} // Apply texture here
                />
            </mesh>
        </Float>
    );
};

export const DesignStudio: React.FC<DesignStudioProps> = ({ user, onClose }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(100);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [config, setConfig] = useState<DesignConfig>({
      baseColor: '#ffffff',
      roughness: 0.5,
      metalness: 0.5,
      geometry: 'sphere',
      textureUrl: ''
  });

  const handlePublish = () => {
      if(!name || !desc) {
          alert("Lütfen isim ve açıklama giriniz.");
          return;
      }
      sqlService.publishDesign(user.id, user.username, name, desc, price, config);
      alert("Tasarımınız 'Creative Market' üzerinde satışa çıkarıldı!");
      onClose();
  };

  const handleAIGenerate = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      
      const newConfig = await generateDesignFromPrompt(aiPrompt);
      
      if (newConfig) {
          setConfig(prev => ({
              ...prev,
              ...newConfig
          }));
      } else {
          alert("Yapay zeka tasarımı oluşturamadı. Lütfen tekrar deneyin.");
      }
      setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Create a local object URL for preview
          const objectUrl = URL.createObjectURL(file);
          setConfig({ ...config, textureUrl: objectUrl });
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-black/50 flex justify-between items-center">
            <div>
                <h2 className="text-2xl text-white font-heading tracking-widest flex items-center gap-2">
                    <span className="text-pink-500">CREATOR</span> STUDIO
                </h2>
                <p className="text-xs text-gray-400 font-mono">TASARLA • YAYINLA • KAZAN</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2 border border-gray-600 rounded">
                KAPAT
            </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* 3D Preview Canvas */}
            <div className="flex-1 bg-gradient-to-b from-gray-800 to-black relative">
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <Stage environment="city" intensity={0.6}>
                        <PreviewMesh config={config} />
                    </Stage>
                    <OrbitControls makeDefault />
                </Canvas>
                <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono pointer-events-none">
                    PREVIEW MODE // {config.geometry.toUpperCase()}
                </div>
            </div>

            {/* Controls Sidebar */}
            <div className="w-full md:w-96 bg-gray-900 border-l border-gray-700 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                    
                    {/* 0. AI Generation */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <h3 className="text-cyan-400 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 animate-pulse">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 10-1.06 1.06l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 101.06-1.06l-2.846-.813a3.75 3.75 0 00-2.576-2.576l-.813-2.846z" clipRule="evenodd" />
                            </svg>
                            AI İLE OLUŞTUR
                        </h3>
                        <div className="space-y-3">
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Örn: Parlak, metalik kırmızı bir küre oluştur..."
                                className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white text-xs outline-none focus:border-cyan-500 h-20 resize-none"
                            />
                            <button 
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiPrompt}
                                className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        TASARLANIYOR...
                                    </>
                                ) : (
                                    'UYGULA'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 1. Shape & Material */}
                    <div className="space-y-4">
                        <h3 className="text-pink-400 font-bold text-sm uppercase border-b border-gray-700 pb-2">1. Materyal & Şekil</h3>
                        
                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">TEMEL GEOMETRİ</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['box', 'sphere', 'cone', 'torus'] as const).map(shape => (
                                    <button 
                                        key={shape}
                                        onClick={() => setConfig({...config, geometry: shape})}
                                        className={`p-2 rounded border text-[10px] uppercase transition-all ${config.geometry === shape ? 'bg-pink-900/50 border-pink-500 text-white' : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}
                                    >
                                        {shape}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">RENK</label>
                            <div className="flex gap-2">
                                <input type="color" value={config.baseColor} onChange={(e) => setConfig({...config, baseColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" />
                                <input type="text" value={config.baseColor} onChange={(e) => setConfig({...config, baseColor: e.target.value})} className="flex-1 bg-black/30 border border-gray-600 rounded px-2 text-white font-mono text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-2 block flex justify-between">
                                <span>METALİKLİK</span> <span>{config.metalness.toFixed(1)}</span>
                            </label>
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={config.metalness}
                                onChange={(e) => setConfig({...config, metalness: Number(e.target.value)})}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-2 block flex justify-between">
                                <span>PÜRÜZLÜLÜK</span> <span>{config.roughness.toFixed(1)}</span>
                            </label>
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={config.roughness}
                                onChange={(e) => setConfig({...config, roughness: Number(e.target.value)})}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                    </div>

                    {/* 1.5 Texture Upload (New) */}
                    <div className="space-y-4">
                        <h3 className="text-green-400 font-bold text-sm uppercase border-b border-gray-700 pb-2">2. Doku & Görsel</h3>
                        
                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">GÖRSEL URL (VEYA DOSYA YÜKLE)</label>
                            <input 
                                type="text" 
                                value={config.textureUrl || ''} 
                                onChange={(e) => setConfig({...config, textureUrl: e.target.value})} 
                                className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white text-xs outline-none focus:border-green-500 mb-2" 
                                placeholder="https://..." 
                            />
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* 2. Listing Details */}
                    <div className="space-y-4">
                        <h3 className="text-cyan-400 font-bold text-sm uppercase border-b border-gray-700 pb-2">3. Pazar Listelemesi</h3>
                        
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">TASARIM ADI</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white outline-none focus:border-cyan-500" placeholder="Örn: Cyber Sphere X" />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">AÇIKLAMA</label>
                            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white outline-none focus:border-cyan-500 h-20" placeholder="Tasarım hikayesi..." />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">LİSANS BEDELİ (TKN)</label>
                            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono text-lg" />
                            <p className="text-[10px] text-gray-500 mt-1">Bu tasarımı satın alan marka size bu tutarı öder.</p>
                        </div>
                    </div>

                    <button onClick={handlePublish} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded shadow-lg shadow-pink-900/30 transition-all uppercase tracking-widest">
                        PAZARDA YAYINLA
                    </button>

                </div>
            </div>
        </div>
    </div>
  );
};
