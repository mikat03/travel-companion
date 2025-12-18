
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { Message, ActivitySuggestion } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateTravelAdvice(
    prompt: string, 
    location?: { latitude: number; longitude: number },
    chatHistory: Message[] = []
  ): Promise<{ text: string; sources: any[] }> {
    const contents = [
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
      config: {
        systemInstruction: `You are NomadAI, a world-class travel assistant. 
        Act as a tour guide, historian, translator, and safety advisor.
        Always verify travel info. Use grounding for real-time data.
        If a user asks for places nearby, use the location context provided.
        Be friendly, visual, and concise. Warn about common scams.`,
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        } : undefined
      },
    });

    return {
      text: response.text || "I'm sorry, I couldn't generate a response right now.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  async identifyImage(base64Data: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: 'Identify this landmark or object. Provide a brief, engaging historical or cultural fact about it. If it is a menu or sign, translate it briefly.',
          },
        ],
      },
    });
    return response.text || "I couldn't quite make that out. Could you try a different angle?";
  }

  async createItinerary(destination: string, days: number, preferences: string) {
    const prompt = `Create a detailed ${days}-day itinerary for ${destination}. 
    Preferences: ${preferences}. 
    Return the response in a structured Markdown format with times and activities.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return response.text;
  }

  async getQuickSuggestions(destination: string): Promise<ActivitySuggestion[]> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5 must-do unique activities or hidden gems in ${destination}. Return in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "category", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  }

  async getSafetyAlerts(lat: number, lng: number) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3-4 specific travel safety alerts, scam warnings, or local etiquette tips for the area around these coordinates: ${lat}, ${lng}. Include the human-readable city/region name.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            locationName: { type: Type.STRING },
            regionStatus: { type: Type.STRING, description: "Safe, Caution, or Alert" },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  desc: { type: Type.STRING }
                },
                required: ["title", "severity", "desc"]
              }
            },
            etiquette: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["locationName", "regionStatus", "alerts", "etiquette"]
        }
      }
    });

    return JSON.parse(response.text);
  }
}

export const gemini = new GeminiService();
