import { GoogleGenAI, Modality } from "@google/genai";

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let lastRequestId = 0;
let isQuotaExhausted = false;
let quotaResetTimeout: any = null;

export const speak = async (text: string) => {
  const requestId = ++lastRequestId;
  
  try {
    // Stop any current audio and native speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    if (currentSource) {
      try {
        currentSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      currentSource = null;
    }

    // If we know quota is exhausted, go straight to fallback
    if (isQuotaExhausted) {
      fallbackSpeak(text, requestId);
      return;
    }

    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Generate TTS with a "cute" voice
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga de forma muito fofa e alegre para uma criança: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // If a newer request has started, ignore this one
    if (requestId !== lastRequestId) return;

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      // Initialize AudioContext on first use
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // If a newer request has started during resume, ignore this one
      if (requestId !== lastRequestId) return;

      // Decode and play
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      } catch (e) {
        const bufferToUse = bytes.length % 2 === 0 ? bytes.buffer : bytes.buffer.slice(0, bytes.length - 1);
        const int16Array = new Int16Array(bufferToUse);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768;
        }
        audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);
      }
      
      // Final check before playing
      if (requestId !== lastRequestId) return;

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (currentSource === source) currentSource = null;
      };
      source.start(0);
      currentSource = source;
    } else {
      fallbackSpeak(text, requestId);
    }
  } catch (error: any) {
    // Check for quota exhaustion (429)
    if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn("Gemini TTS Quota exceeded. Falling back to browser speech.");
      isQuotaExhausted = true;
      
      // Reset quota flag after 1 minute to try again later
      if (quotaResetTimeout) clearTimeout(quotaResetTimeout);
      quotaResetTimeout = setTimeout(() => {
        isQuotaExhausted = false;
      }, 60000);
    } else {
      console.error("TTS Error:", error);
    }
    fallbackSpeak(text, requestId);
  }
};

const fallbackSpeak = (text: string, requestId: number) => {
  // Only play if this is still the latest request
  if (requestId !== lastRequestId) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.5; 
    window.speechSynthesis.speak(utterance);
  }
};
