
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { sqlService } from '../services/sqlService';

interface VerificationPortalProps {
  user: User;
  onVerificationComplete: (updatedUser: User) => void;
}

type Step = 'EMAIL' | 'PHONE' | 'ID' | 'COMPLETE';

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ user, onVerificationComplete }) => {
  const [activeStep, setActiveStep] = useState<Step>('EMAIL');
  
  // States based on user's existing status
  const [emailVerified, setEmailVerified] = useState(user.verification.isEmailVerified);
  const [phoneVerified, setPhoneVerified] = useState(user.verification.isPhoneVerified);
  const [idVerified, setIdVerified] = useState(user.verification.isIdVerified);

  // Inputs
  const [emailCode, setEmailCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Logic to determine initial step
  useEffect(() => {
    if (!emailVerified) setActiveStep('EMAIL');
    else if (!phoneVerified) setActiveStep('PHONE');
    else if (!idVerified) setActiveStep('ID');
    else setActiveStep('COMPLETE');
  }, [emailVerified, phoneVerified, idVerified]);

  const handleEmailVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCode === '1234' || emailCode.length === 4) { // Demo code
      sqlService.updateVerification(user.id, 'EMAIL');
      setEmailVerified(true);
      setActiveStep('PHONE');
    } else {
      alert("Hatalı Doğrulama Kodu");
    }
  };

  const handlePhoneVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneCode === '1234' || phoneCode.length === 4) {
      sqlService.updateVerification(user.id, 'PHONE');
      setPhoneVerified(true);
      setActiveStep('ID');
    } else {
      alert("Hatalı SMS Kodu");
    }
  };

  const handleIdUpload = () => {
    setIsScanning(true);
    // Simulate AI Scan
    setTimeout(() => {
        setIsScanning(false);
        sqlService.updateVerification(user.id, 'ID');
        setIdVerified(true);
        setActiveStep('COMPLETE');
    }, 3000);
  };

  const handleFinalize = () => {
      // Refresh user object
      const updatedUser = sqlService.getUserById(user.id);
      if (updatedUser) {
          onVerificationComplete(updatedUser);
      }
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="relative w-full max-w-2xl bg-gray-900 border border-green-500/30 rounded-lg shadow-[0_0_100px_rgba(34,197,94,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-black/50 p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
                <h2 className="text-2xl text-white font-heading tracking-widest">
                    GÜVENLİK PROTOKOLÜ <span className="text-green-500">v3.0</span>
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-1">KİMLİK DOĞRULAMA GEREKLİ (KYC)</p>
            </div>
            <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${emailVerified ? 'bg-green-500' : 'bg-gray-600'} animate-pulse`}></div>
                <div className={`w-3 h-3 rounded-full ${phoneVerified ? 'bg-green-500' : 'bg-gray-600'} animate-pulse`}></div>
                <div className={`w-3 h-3 rounded-full ${idVerified ? 'bg-green-500' : 'bg-gray-600'} animate-pulse`}></div>
            </div>
        </div>

        <div className="flex">
            {/* Sidebar Steps */}
            <div className="w-1/3 bg-black/30 border-r border-gray-800 p-6 space-y-4">
                <StepItem label="E-POSTA ONAYI" status={emailVerified} active={activeStep === 'EMAIL'} />
                <StepItem label="MOBİL SMS" status={phoneVerified} active={activeStep === 'PHONE'} />
                <StepItem label="KİMLİK TARA" status={idVerified} active={activeStep === 'ID'} />
                <StepItem label="ERİŞİM" status={activeStep === 'COMPLETE'} active={activeStep === 'COMPLETE'} />
            </div>

            {/* Content Area */}
            <div className="w-2/3 p-8 bg-gradient-to-br from-gray-900 to-gray-800 relative">
                
                {/* STEP 1: EMAIL */}
                {activeStep === 'EMAIL' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center border border-green-500/50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <h3 className="text-xl text-white font-bold">E-Posta Doğrulama</h3>
                        <p className="text-sm text-gray-400">
                            Güvenlik kodunu <strong>{user.email}</strong> adresine gönderdik. Lütfen kodu giriniz.
                        </p>
                        <form onSubmit={handleEmailVerify}>
                            <input 
                                type="text" 
                                placeholder="4 Haneli Kod (örn: 1234)" 
                                value={emailCode}
                                onChange={(e) => setEmailCode(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full bg-black/50 border border-gray-600 rounded p-4 text-center text-2xl tracking-[0.5em] text-white focus:border-green-500 outline-none font-mono"
                                maxLength={4}
                            />
                            <button type="submit" className="mt-4 w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded transition-colors">
                                KODU ONAYLA
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2: PHONE */}
                {activeStep === 'PHONE' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                        </div>
                        <h3 className="text-xl text-white font-bold">Mobil Doğrulama</h3>
                        <div className="space-y-4">
                            {!phoneNumber ? (
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">TELEFON NUMARASI</label>
                                    <div className="flex gap-2">
                                        <input type="text" onKeyDown={(e) => e.stopPropagation()} className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white" placeholder="+90 555 000 0000" />
                                        <button onClick={() => setPhoneNumber('SENT')} className="bg-blue-600 text-white px-4 rounded font-bold text-sm">GÖNDER</button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePhoneVerify}>
                                    <label className="text-xs text-gray-500 mb-2 block">SMS KODU</label>
                                    <input 
                                        type="text" 
                                        placeholder="SMS Kodu (örn: 1234)" 
                                        value={phoneCode}
                                        onChange={(e) => setPhoneCode(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className="w-full bg-black/50 border border-gray-600 rounded p-4 text-center text-2xl tracking-[0.5em] text-white focus:border-blue-500 outline-none font-mono"
                                        maxLength={4}
                                    />
                                    <button type="submit" className="mt-4 w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded transition-colors">
                                        DOĞRULA
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: ID SCAN */}
                {activeStep === 'ID' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl text-white font-bold">Kimlik Doğrulama</h3>
                        <p className="text-sm text-gray-400">
                           Auraverse ekosisteminde işlem yapabilmek için dijital kimlik onayı gereklidir.
                        </p>
                        
                        {isScanning ? (
                            <div className="relative h-40 bg-black/60 rounded border border-purple-500/50 flex flex-col items-center justify-center overflow-hidden">
                                {/* Scan Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                <div className="text-purple-400 font-mono animate-pulse">BİYOMETRİK ANALİZ YAPILIYOR...</div>
                                <div className="text-xs text-gray-500 mt-2 font-mono">%{(Math.random() * 100).toFixed(2)} TAMAMLANDI</div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg p-8 text-center cursor-pointer transition-colors" onClick={handleIdUpload}>
                                <div className="text-gray-400 text-sm">
                                    <span className="block text-2xl mb-2">📂</span>
                                    KİMLİK KARTI veya PASAPORT<br/>Fotoğrafı Yükle
                                </div>
                            </div>
                        )}
                        
                        <style>{`
                            @keyframes scan {
                                0% { top: 0%; }
                                50% { top: 100%; }
                                100% { top: 0%; }
                            }
                        `}</style>
                    </div>
                )}

                {/* STEP 4: COMPLETE */}
                {activeStep === 'COMPLETE' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fadeIn">
                         <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)] mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 className="text-3xl text-white font-heading font-black italic">ERİŞİM ONAYLANDI</h3>
                        <p className="text-gray-400">Tüm güvenlik protokolleri başarıyla tamamlandı.</p>
                        <button onClick={handleFinalize} className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 hover:scale-105 transition-all">
                            AURAVERSE'E GİR
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const StepItem = ({ label, status, active }: { label: string, status: boolean, active: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded transition-colors ${active ? 'bg-gray-800 border-l-4 border-green-500' : 'bg-transparent'}`}>
        <span className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
        {status ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
        ) : (
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`}></div>
        )}
    </div>
);
