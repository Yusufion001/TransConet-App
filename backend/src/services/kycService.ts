import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/env';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface KycExtractionResult {
  documentType: string;
  extractedName: string;
  licenseNumber: string;
  expirationDate: string;
  isExpired: boolean;
  confidenceScore: number;
  fraudFlags: string[];
}

export async function processKycDocument(imageBase64: string, mimeType: string, userFullName: string): Promise<KycExtractionResult> {
  try {
    // Using gemini-2.5-flash for fast, multimodal document processing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: `You are an expert logistics compliance officer and fraud detection engineer for TransConet. 
          Analyze this uploaded identity or vehicle compliance document. 
          Extract the document type, the full name on the document, the license/registration number, and the expiration date. 
          Cross-reference the extracted name with the registered user profile name: "${userFullName}".
          Identify any potential fraud indicators, such as signs of digital tampering, mismatched names, or expired validity dates.`
        },
      ],
      config: {
        // Enforce structured JSON output to easily ingest results into database triggers
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING, description: "Type of document e.g. Driver License, Vehicle Insurance, Corporate CAC" },
            extractedName: { type: Type.STRING, description: "Full name found on the document" },
            licenseNumber: { type: Type.STRING, description: "Identification or license number" },
            expirationDate: { type: Type.STRING, description: "Expiration date in YYYY-MM-DD format if available" },
            isExpired: { type: Type.BOOLEAN, description: "True if the expiration date has passed relative to current date 2026" },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
            fraudFlags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of anomalies, e.g. 'Name mismatch with profile', 'Document expired', 'Blurry text'" 
            },
          },
          required: ["documentType", "extractedName", "licenseNumber", "expirationDate", "isExpired", "confidenceScore", "fraudFlags"],
        },
      },
    });

    if (!response.text) {
      throw new Error('Gemini Vision failed to return an analysis result.');
    }

    const result: KycExtractionResult = JSON.parse(response.text);
    return result;

  } catch (error) {
    console.error('KYC Vision Processing Error:', error);
    throw error;
  }
}
