
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Brand } from '../types';

interface SearchOmnibarProps {
  brands: Brand[];
  onSelectBrand: (brandId: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

interface SearchResult {
  type: 'BRAND' | 'PRODUCT';
  id: string;
  name: string;
  subText: string;
  brandId: string; // Target for navigation
}

export const SearchOmnibar = React.memo<SearchOmnibarProps>(({ brands, onSelectBrand, onFocus, onBlur }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Brand[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Helper to get random suggestions
  const getRandomSuggestions = () => {
    if (brands.length === 0) return [];
    const shuffled = [...brands].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  // Update suggestions when focused
  useEffect(() => {
    if (isFocused && !query) {
        setSuggestions(getRandomSuggestions());
    }
  }, [isFocused, query, brands]);

  // Search Logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const hits: SearchResult[] = [];

    brands.forEach(brand => {
      // 1. Check Brand Name
      if (brand.name.toLowerCase().includes(lowerQuery)) {
        hits.push({
          type: 'BRAND',
          id: brand.id,
          name: brand.name,
          subText: 'Resmi Marka Mağazası',
          brandId: brand.id
        });
      }

      // 2. Check Products
      brand.products.forEach(prod => {
        if (prod.name.toLowerCase().includes(lowerQuery)) {
          hits.push({
            type: 'PRODUCT',
            id: prod.id,
            name: prod.name,
            subText: `${brand.name} Koleksiyonu • ${prod.price} TKN`,
            brandId: brand.id
          });
        }
      });
    });

    setResults(hits.slice(0, 6)); // Limit results
  }, [query, brands]);

  return (
    <div ref={wrapperRef} className="pointer-events-auto relative w-[70%] md:max-w-xl mx-auto z-50 transition-all duration-300 transform">
      {/* Input Container */}
      <div className={`
        relative flex items-center bg-black/60 backdrop-blur-xl border-2 rounded-full overflow-hidden transition-all duration-300 animate-border-flicker
        ${isFocused ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105' : 'hover:border-gray-500'}
      `}>
        {/* Icon */}
        <div className="pl-3 md:pl-4 text-cyan-400">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-5 md:h-5 animate-pulse">
             <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
           </svg>
        </div>

        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => { 
              // Immediate focus
              e.target.focus();
              setIsFocused(true); 
              onFocus(); 
          }}
          onBlur={() => { 
             setTimeout(() => {
                 setIsFocused(false); 
                 onBlur();
             }, 200) 
          }}
          onKeyDown={(e) => {
             // CRITICAL FIX: Stop event from bubbling to OrbitControls
             e.stopPropagation();
             e.nativeEvent.stopImmediatePropagation();
          }} 
          placeholder="Holografik Arama..."
          className="w-full bg-transparent text-white px-2 py-1.5 md:px-4 md:py-3 text-[10px] md:text-base outline-none font-heading tracking-wider placeholder-gray-500 cursor-text"
        />

        {query && (
          <button onClick={() => setQuery('')} className="pr-3 md:pr-4 text-gray-500 hover:text-white cursor-pointer pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions / Results Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden shadow-2xl animate-fadeIn pointer-events-auto">
           
           {/* CASE 1: SEARCH RESULTS */}
           {query.length >= 2 && results.length > 0 && (
               <div className="py-2">
                 <div className="px-4 py-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">SONUÇLAR</div>
                 {results.map((item) => (
                   <button
                     key={`${item.type}-${item.id}`}
                     onClick={() => {
                       onSelectBrand(item.brandId);
                       setQuery('');
                       setIsFocused(false);
                       onBlur();
                     }}
                     className="w-full text-left px-3 py-2 md:px-4 md:py-3 hover:bg-cyan-900/30 border-l-4 border-transparent hover:border-cyan-400 transition-all flex items-center gap-3 group cursor-pointer"
                   >
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center shrink-0 ${item.type === 'BRAND' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                        {item.type === 'BRAND' ? (
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                           </svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                           </svg>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-xs md:text-base font-bold group-hover:text-cyan-300 transition-colors truncate">{item.name}</p>
                        <p className="text-[9px] md:text-xs text-gray-500 font-mono uppercase truncate">{item.subText}</p>
                      </div>
                   </button>
                 ))}
               </div>
           )}

           {/* CASE 2: SUGGESTIONS (Query Empty) */}
           {!query && suggestions.length > 0 && (
               <div className="py-2">
                 <div className="px-4 py-1 text-[10px] text-cyan-500 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                    ÖNERİLEN MARKALAR
                 </div>
                 {suggestions.map((brand) => (
                    <button
                        key={`sugg-${brand.id}`}
                        onClick={() => {
                            onSelectBrand(brand.id);
                            setIsFocused(false);
                            onBlur();
                        }}
                        className="w-full text-left px-3 py-2 md:px-4 md:py-3 hover:bg-gray-800 border-l-4 border-transparent hover:border-purple-500 transition-all flex items-center gap-3 group cursor-pointer"
                    >
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gray-800 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-white border border-gray-700">
                             <span className="font-heading font-bold text-xs">{brand.name.substring(0,1)}</span>
                        </div>
                        <div>
                            <p className="text-gray-300 text-xs md:text-sm font-bold group-hover:text-white transition-colors">{brand.name}</p>
                        </div>
                    </button>
                 ))}
               </div>
           )}

           {/* CASE 3: NO RESULTS */}
           {query.length >= 2 && results.length === 0 && (
               <div className="p-4 text-center text-gray-500 text-xs">Sonuç bulunamadı.</div>
           )}
        </div>
      )}
    </div>
  );
});
