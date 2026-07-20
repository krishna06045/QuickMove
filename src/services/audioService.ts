import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "@/lib/utils";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Transcribes audio natively using Gemini's multimodal capabilities.
 * Handles Hinglish, Hindi, and English automatically.
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const genAI = getGeminiClient();
  // gemini-1.5-flash is extremely robust for audio natively
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
  
  // Clean base64 prefix if present
  const base64Data = base64Audio.includes("base64,") ? base64Audio.split("base64,")[1] : base64Audio;

  const prompt = `
You are an expert transcriber for an Indian operations team.
Listen to the following audio and transcribe it EXACTLY as spoken.
CRITICAL INSTRUCTIONS:
- If the speaker speaks in Hindi or a mix of Hindi and English (Hinglish), transcribe it in the Latin alphabet (Hinglish) exactly as they spoke it (e.g. "bhai shifting monday kar dena").
- DO NOT translate Hindi to English! Write the exact Hindi words using English letters.
- If they speak pure English, transcribe in English.
- Return ONLY the transcription text. Do not add any conversational padding like "Here is the transcription:".
`;

  try {
    const result = await withRetry(() => model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]));
    
    return result.response.text().trim();
  } catch (error) {
    console.error("Audio Transcription Error:", error);
    throw error;
  }
};
