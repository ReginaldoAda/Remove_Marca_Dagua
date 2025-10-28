
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("A chave da API do Gemini não foi configurada. Verifique suas variáveis de ambiente.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPrompt = (hasMask: boolean): string => {
    const baseInstructions = "A imagem resultante DEVE ter as mesmas dimensões (largura e altura) da imagem original. Preserve a qualidade original da imagem o máximo possível, evitando compressão excessiva. Retorne apenas a imagem final limpa, sem nenhum texto ou explicação adicional.";

    if (hasMask) {
        return `Você receberá duas imagens: a primeira é a imagem original e a segunda é uma máscara. Remova a marca d'água da imagem original apenas nas áreas indicadas pela máscara (as áreas brancas). Seja preciso. ${baseInstructions}`;
    }
    return `Remova todas as marcas d'água, logotipos e textos sobrepostos desta imagem. Quero uma versão limpa da imagem original. ${baseInstructions}`;
}

export const removeWatermark = async (base64Image: string, mimeType: string, maskBase64?: string): Promise<{ base64: string; mimeType: string } | null> => {
  try {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };

    const parts: any[] = [imagePart];

    if (maskBase64) {
        const maskPart = {
            inlineData: {
                data: maskBase64,
                mimeType: 'image/png'
            }
        };
        parts.push(maskPart);
    }

    parts.push({ text: getPrompt(!!maskBase64) });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
        };
      }
    }
    
    return null;

  } catch (error) {
    console.error("Erro na chamada da API Gemini:", error);
    throw new Error("Falha ao comunicar com a API do Gemini.");
  }
};
