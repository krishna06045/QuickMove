import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisSchema } from "@/lib/schema";
import { withRetry } from "@/lib/utils";
import type { Message, AIAnalysis } from "@/types";
import { PIIMasker } from "@/lib/piiMasker";

// This is a client-side wrapper for demonstration purposes.
// In a real production app, this should be handled server-side to protect the API key.
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// We rely strictly on Zod for schema validation.
// We prompt Gemini to return JSON using responseMimeType.

export async function analyzeConversation(customerId: string, customerName: string, messages: Message[]): Promise<AIAnalysis> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const formattedConversation = messages.map(m => {
    return `[ID: ${m.id}] [${m.timestamp}] ${m.sender.toUpperCase()} (${m.type}): ${m.content}`;
  }).join("\n");

  // --- PRIVACY LAYER: Mask sensitive data before sending to LLM ---
  const masker = new PIIMasker();
  const maskedConversation = masker.mask(formattedConversation, customerName);
  
  // Console log to verify masking in development
  console.log("🔒 [PRIVACY LAYER] Masked Payload going to LLM:\n", maskedConversation);

  const expectedSchemaString = `
{
  "profile": {
    "name": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "contact": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "familySize": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "pets": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "dietaryPreferences": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "moveDetails": {
    "origin": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "destination": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "propertyConfig": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "preferredLocality": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "budget": {
    "amount": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "flexibility": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "timeline": {
    "expectedMoveDate": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "flexibility": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "inventory": {
    "summary": { "value": "", "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } },
    "specialItems": { "value": [], "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "utilities": {
    "requirements": { "value": [], "confidence": 0, "status": "Missing", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  },
  "requirementChanges": [
    { "id": "1", "field": "", "oldValue": "", "newValue": "", "reason": "", "timestamp": "", "sourceEvidence": { "messageId": "", "timestamp": "", "preview": "" } }
  ],
  "processingSummary": "",
  "missingInformation": [""],
  "suggestedNextActions": [""],
  "suggestedReply": "Short reply here...",
  "operationsNotes": { 
    "requirementsSummary": "", 
    "unresolvedQuestions": [""], 
    "risks": [""], 
    "nextActions": [""], 
    "vendorFollowUps": [""] 
  },
  "overallConfidence": 95
}`;

  const prompt = `
You are an expert AI Operations Copilot for a relocation company called QuickMove.
Analyze the following customer conversation history and extract the structured data.
You MUST return a JSON object that EXACTLY matches the following structure. Do not add or remove fields:

${expectedSchemaString}

Always evaluate confidence scores (0-100) based on the clarity and explicitness of the customer's statements.
If a requirement has changed during the conversation, populate the 'previousValue' field in the extracted field, and add a corresponding entry in 'requirementChanges'.
Provide source evidence (messageId, timestamp, and a short preview) for every extracted field to help the human operator validate your findings.
For conflicting fields, set the status to "Conflicting". For missing fields, set the status to "Missing". For confident fields, set status to "Confirmed".
The suggested reply should be professional, max 5 lines, no emojis.

CRITICAL PRIVACY INSTRUCTION: 
Sensitive PII in the conversation has been masked with placeholders like <CUSTOMER_NAME_1>, <PHONE_NUMBER_1>, <EMAIL_1>. 
You MUST extract these exact placeholders as the values. Do not ignore them. Our system will unmask them later. 
For example, if the conversation says "My name is <CUSTOMER_NAME_1>", you must set the name value to "<CUSTOMER_NAME_1>".

CRITICAL MULTILINGUAL INSTRUCTION: 
The conversation may be in English, Hindi, Hinglish (Hindi written in Latin script), or a mix. You MUST natively understand and extract entities accurately regardless of the language used. Do not require translation. Output all final JSON values in English.

Conversation:
${maskedConversation}
`;

  try {
    const result = await withRetry(() => model.generateContent([
      { text: "You are a precise data extraction assistant. Ensure the output strictly conforms to the requested schema." },
      { text: prompt }
    ]));
    
    let responseText = result.response.text();
    
    if (!responseText) {
      throw new Error("Failed to get a response from Gemini.");
    }
    
    // Clean up potential markdown formatting (```json ... ```)
    let cleanedText = responseText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

    // Extract just the JSON object by finding the first '{' and last '}'
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    // Parse the JSON returned by Gemini FIRST (before unmasking)
    let rawData = JSON.parse(cleanedText);

    // --- PRIVACY LAYER: Deep unmask the parsed object ---
    // This prevents unescaped quotes or newlines in the original data from breaking JSON.parse
    rawData = masker.unmaskObject(rawData);
    
    // Ensure the customerId matches before validation
    rawData.customerId = customerId;
    
    // Strictly validate against our Zod schema
    const parsedData = AIAnalysisSchema.parse(rawData);
    
    return parsedData as AIAnalysis;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<any> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

  // Strip base64 prefix if present
  const base64Data = base64Image.includes("base64,") ? base64Image.split("base64,")[1] : base64Image;

  const expectedSchema = `
{
  "imageType": "Inventory" | "Damage" | "Apartment" | "Document" | "Other",
  "inventory": [ { "item": "", "quantity": 1, "confidence": 95 } ],
  "damage": [ { "item": "", "issue": "", "severity": "Low|Medium|High|Critical", "confidence": 95 } ],
  "apartmentRisks": [ { "risk": "", "severity": "Low|Medium|High|Critical", "confidence": 95 } ],
  "documentFields": [ { "key": "", "value": "", "confidence": 95 } ],
  "summary": "Brief summary of findings",
  "overallConfidence": 95
}`;

  const prompt = `
You are an expert AI Operations Copilot with advanced vision capabilities.
Analyze the provided image and determine its type. Then extract the relevant structured data based on the type.
Return ONLY a valid JSON object matching this exact schema:

${expectedSchema}

Rules:
- For Inventory: identify all furniture, appliances, boxes. Estimate quantities.
- For Damage: identify the item, describe the issue (scratch, dent, broken), and rate severity.
- For Apartment: identify operational risks like steep stairs, no lift, narrow corridors.
- For Document (Quotations, Bills, IDs): extract key fields like Dates, Amounts, Names, Invoice Numbers.
- Set arrays to empty [] if not applicable to the imageType.
- Evaluate confidence scores (0-100) honestly based on visual clarity.
`;

  try {
    const result = await withRetry(() => model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: mimeType, data: base64Data } }
    ]));
    
    let responseText = result.response.text();
    let cleanedText = responseText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    const rawData = JSON.parse(cleanedText);
    
    // Validate schema loosely here or trust the type. We will just return it.
    return rawData;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw error;
  }
}
