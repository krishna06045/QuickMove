import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PIIMasker } from '@/lib/piiMasker';
import { withRetry } from '@/lib/utils';
import type { Message } from '@/types';

export interface CustomerMemory {
  summary: string;
  timeline: string[];
  facts: string[];
  preferences: string[];
  pendingTasks: string[];
  risks: string[];
  lastUpdated: number;
}

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getMemoryFromFirestore = async (customerId: string): Promise<CustomerMemory | null> => {
  try {
    const docRef = doc(db, 'customer_memories', customerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CustomerMemory;
    }
    return null;
  } catch (error) {
    console.error("Error fetching memory from Firestore:", error);
    return null;
  }
};

export const saveMemoryToFirestore = async (customerId: string, memory: CustomerMemory) => {
  try {
    const docRef = doc(db, 'customer_memories', customerId);
    await setDoc(docRef, memory);
    console.log(`🔒 [MEMORY LAYER] Memory successfully saved to Firestore for ${customerId}`);
  } catch (error) {
    console.error("Error saving memory to Firestore:", error);
  }
};

export const generateCustomerMemory = async (customerId: string, customerName: string, messages: Message[], existingMemory: CustomerMemory | null): Promise<CustomerMemory> => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

  const formattedConversation = messages.map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`).join("\n");
  const masker = new PIIMasker();
  const maskedConversation = masker.mask(formattedConversation, customerName);

  const prompt = `
You are a Memory Agent for an AI Operations platform.
Compress the following conversation into a structured operational memory.
If an existing memory is provided, update it with the new information.

CRITICAL MULTILINGUAL INSTRUCTION:
The conversation may be in English, Hindi, Hinglish (Hindi written in Latin script), or a mix. You MUST natively understand and extract facts accurately regardless of the language used. Output all JSON values in English.

Respond ONLY with a JSON object matching this structure exactly:
{
  "summary": "Brief 2 sentence summary of the relocation context",
  "timeline": ["Event 1", "Event 2"],
  "facts": ["Fact 1"],
  "preferences": ["Pref 1"],
  "pendingTasks": ["Task 1"],
  "risks": ["Risk 1"]
}

Existing Memory:
${existingMemory ? JSON.stringify(existingMemory) : 'None'}

Conversation:
${maskedConversation}
`;

  try {
    const result = await withRetry(() => model.generateContent([{ text: prompt }]));
    let responseText = result.response.text();
    
    // Clean up potential markdown formatting
    let cleanedText = responseText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    // Extract just the JSON object by finding the first '{' and last '}'
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }
    
    // Parse first
    let newMemory = JSON.parse(cleanedText);
    
    // Deep unmask
    newMemory = masker.unmaskObject(newMemory);
    
    newMemory.lastUpdated = Date.now();
    
    // Fire and forget save to Firestore
    saveMemoryToFirestore(customerId, newMemory);

    return newMemory as CustomerMemory;
  } catch (error) {
    console.error("Error generating memory:", error);
    throw error;
  }
};

export const askMemoryAgent = async (customerName: string, question: string, memory: CustomerMemory, recentMessages: Message[]): Promise<string> => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const formattedConversation = recentMessages.map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`).join("\n");
  const masker = new PIIMasker();
  const maskedConversation = masker.mask(formattedConversation, customerName);
  const maskedQuestion = masker.mask(question, customerName);

  const prompt = `
You are a highly capable AI Assistant for an Operations Manager.
Use the provided Customer Memory and any recent messages to answer the user's question accurately and concisely.
Keep your response short, direct, and professional.

CRITICAL MULTILINGUAL INSTRUCTION:
The recent messages or the user's question may be in English, Hindi, Hinglish (Hindi written in Latin script), or a mix. You MUST natively understand the intent and facts regardless of the language used. Output your final response in English.

Customer Memory (Source of Truth):
${JSON.stringify(memory, null, 2)}

Recent Unprocessed Messages:
${maskedConversation || 'None'}

Question: ${maskedQuestion}
`;

  try {
    const result = await withRetry(() => model.generateContent([{ text: prompt }]));
    return masker.unmask(result.response.text());
  } catch (error) {
    console.error("Error querying memory agent:", error);
    throw error;
  }
};
