
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMathExplanation = async (num1: number, num2: number, operation: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explique de forma muito simples para uma criança de 6 anos como pensar para resolver ${num1} ${operation} ${num2}. Use analogias com frutas ou brinquedos. 
      
      REGRAS CRÍTICAS:
      1. NUNCA dê o resultado final da conta.
      2. Ensine apenas o caminho ou a lógica para a criança descobrir sozinha.
      3. Seja muito encorajador e carinhoso. 
      4. Responda em no máximo 3 frases curtas.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Vamos contar juntos! É muito divertido aprender matemática.";
  }
};
