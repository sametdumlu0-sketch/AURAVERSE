
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Product } from '../types';

let chatSession: Chat | null = null;

const getSystemInstruction = (contextProducts: Product[]) => {
  const productContext = contextProducts.map(p => 
    `- ${p.name} (${p.category}): ${p.price} tokens. ${p.description}. ${p.stock > 0 ? 'Stokta Var' : 'Tükendi'}.`
  ).join('\n');

  return `
    You are AURA, an advanced AI Personal Shopper in the AURAVERSE metaspace.
    
    MISSION:
    Assist users in finding products, comparing items, and answering questions about the current brand inventory.
    
    CONTEXT (Current Store Inventory):
    ${productContext}
    
    BEHAVIOR:
    1. Tone: Futuristic, professional, yet friendly (Cyberpunk/Sci-Fi style).
    2. Sales: Actively recommend products from the list above if relevant.
    3. Grounding: If the user asks about real-world trends (e.g., "What are 2024 fashion trends?"), use Google Search.
    4. Brevity: Keep responses concise (under 3 sentences unless detailed info is requested).
    
    If the user asks about a product NOT in the list, politely inform them it's not currently available in this sector.
  `;
};

// Exponential Backoff Utility
const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
};

export const initializeChat = async (contextProducts: Product[]) => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(contextProducts),
      tools: [{ googleSearch: {} }],
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<{ text: string; sources?: any[] }> => {
  if (!chatSession) {
    await initializeChat([]);
  }

  if (!chatSession) {
      return { text: "AuraNet bağlantısı kurulamadı. Lütfen API Anahtarını kontrol edin." };
  }

  try {
    // Wrap the API call in the backoff retry logic
    const result: GenerateContentResponse = await retryWithBackoff(async () => {
        return await chatSession!.sendMessage({ message });
    });
    
    let text = result.text || "Veri alındı ancak şifresi çözülemedi.";
    let sources: any[] = [];

    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
       sources = result.candidates[0].groundingMetadata.groundingChunks;
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini Error (Max Retries Reached):", error);
    return { text: "AuraNet paraziti algılandı. İletişim kurulamıyor. Lütfen tekrar deneyin." };
  }
};

// --- NEW: Design Studio AI Generation ---
export const generateDesignFromPrompt = async (userPrompt: string): Promise<any | null> => {
    if (!process.env.API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
        You are a 3D Design Translator. 
        Your task is to convert natural language descriptions of objects into a specific JSON configuration.
        
        Output JSON Schema:
        {
            "baseColor": string (hex color code, e.g., "#FF0000"),
            "roughness": number (0.0 to 1.0, where 0 is smooth/shiny and 1 is rough/matte),
            "metalness": number (0.0 to 1.0, where 1 is metallic),
            "geometry": string ("box" | "sphere" | "cone" | "torus"),
            "textureUrl": string (optional URL)
        }

        Rules:
        1. Analyze the user's request for keywords about color, material, and shape.
        2. If the user explicitly asks for a texture (e.g., "marble", "wood", "brick"), you CANNOT generate the image file itself. 
           However, if they provide a URL in the prompt, extract it. 
           Otherwise, prioritize optimizing the 'roughness' and 'metalness' to mimic that material.
        3. If shape is unspecified, default to "sphere".
        4. If color is unspecified, default to "#ffffff".
        5. Return ONLY the JSON object. No markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (e) {
        console.error("Design Generation Error:", e);
        return null;
    }
};
