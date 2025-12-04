import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, initializeChat } from '../services/geminiService';
import { ChatMessage, Product, User } from '../types';

interface AIAssistantProps {
  products: Product[];
  user: User | null;
}

// Define SpeechRecognition types locally since they might not be in standard lib
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const AIAssistant = React.memo<AIAssistantProps>(({ products, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'Selam Gezgin. Ben AURA. Bugün sana nasıl yardımcı olabilirim?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Toggle for TTS enabled/disabled
  const [isSynthesizing, setIsSynthesizing] = useState(false); // Currently talking status

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasWelcomedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initialize chat when products change (context update)
  useEffect(() => {
    initializeChat(products);
  }, [products]);

  // Trigger Welcome Message when User logs in
  useEffect(() => {
    if (user && !hasWelcomedRef.current) {
      setIsOpen(true);
      const welcomeText = `Hoş geldin, ${user.username}! Sistem seni tanıdı. \n\nAradığın özel bir marka veya ürün var mı? Senin için metadatayı tarayabilirim.`;
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: welcomeText
      };
      setMessages(prev => [...prev, welcomeMsg]);
      
      // Auto speak welcome message if voice is enabled (default off usually, but logic exists)
      if (isSpeaking) speakText(welcomeText);
      
      hasWelcomedRef.current = true;
    }
    if (!user) {
        hasWelcomedRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // --- VOICE LOGIC ---

  // 1. Text-to-Speech (TTS)
  const speakText = (text: string) => {
    if (!isSpeaking) return;
    
    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR'; // Set to Turkish
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0;

    // Optional: Select a specific voice if available
    const voices = synthRef.current.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) utterance.voice = trVoice;

    utterance.onstart = () => setIsSynthesizing(true);
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);

    synthRef.current.speak(utterance);
  };

  // 2. Speech-to-Text (STT)
  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent 3D scene interaction
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız sesli komut özelliğini desteklemiyor.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleVoiceOutput = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newState = !isSpeaking;
      setIsSpeaking(newState);
      if (!newState) {
          synthRef.current.cancel();
          setIsSynthesizing(false);
      }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Stop listening if active
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(userMsg.text);
    
    let textDisplay = response.text;
    if (response.sources && response.sources.length > 0) {
      textDisplay += "\n\nKAYNAKLAR:\n" + response.sources.map((s: any) => 
        `- ${s.web?.title || s.web?.uri || 'Harici Kaynak'}`
      ).join('\n');
    }

    const aiMsg: ChatMessage = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: textDisplay 
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);

    // Speak the response
    speakText(textDisplay);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] pointer-events-auto transition-all duration-300 ease-in-out ${isOpen ? 'w-96 h-[500px]' : 'w-16 h-16'}`}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform cursor-pointer"
        >
          {/* AI Icon */}
          <div className="relative">
             <div className="absolute inset-0 bg-white blur-md opacity-50 rounded-full animate-ping"></div>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 relative z-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="w-full h-full flex flex-col bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-900/50 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-cyan-900/40 to-transparent border-b border-cyan-500/30 flex justify-between items-center">
            <h3 className="text-cyan-400 font-heading font-bold tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSynthesizing ? 'bg-green-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`}/>
              AURA AI
            </h3>
            <div className="flex items-center gap-1">
                {/* Voice Output Toggle */}
                <button 
                    onClick={toggleVoiceOutput}
                    className={`p-1.5 rounded-full transition-colors ${isSpeaking ? 'text-green-400 bg-green-900/20' : 'text-gray-500 hover:text-gray-300'}`}
                    title={isSpeaking ? "Sesi Kapat" : "Sesi Aç"}
                >
                    {isSpeaking ? (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                         </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                    )}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white cursor-pointer p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-700/50 text-white rounded-br-none border border-cyan-500/50' 
                    : 'bg-gray-800/80 text-gray-200 rounded-bl-none border border-gray-600/50'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 p-3 rounded-lg rounded-bl-none border border-gray-700/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-black/40 border-t border-gray-700">
             {/* Listening Indicator */}
             {isListening && (
                 <div className="text-[10px] text-red-400 animate-pulse text-center mb-1 font-bold tracking-widest flex items-center justify-center gap-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                     DİNLENİYOR...
                 </div>
             )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        // CRITICAL FIX: Prevent 3D scene from intercepting keys and breaking input
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        if (e.key === 'Enter') handleSend();
                    }}
                    placeholder={isListening ? "Konuşun..." : "Buraya yazın..."}
                    className={`w-full bg-gray-900/80 border ${isListening ? 'border-red-500' : 'border-gray-600'} rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 pr-10 transition-colors`}
                />
                {/* Microphone Button */}
                <button 
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                    title="Sesli Komut"
                >
                    {isListening ? (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse">
                            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                         </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                GÖNDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});