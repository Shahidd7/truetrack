
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMentalHealthResponse = async (history: Message[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are TrueTrack's AI Friend. You are warm, empathetic, non-judgmental, and a great listener. Your goal is to support the user's mental health, help them process their day, and offer gentle encouragement. Keep responses concise but deeply meaningful.",
    },
  });

  const lastMessage = history[history.length - 1];
  const response = await chat.sendMessage({ message: lastMessage.content });
  return response.text;
};

export const getManifestationIdeas = async (mainGoal: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `My main goal is: "${mainGoal}". Suggest 3 tiny, manageable daily actions I can do to manifest this goal. Keep them simple enough to take less than 5 minutes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });
  return JSON.parse(response.text || '[]') as string[];
};

export const getDailyInsights = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Give me an inspirational quote and a supportive 'reminder from the universe/God' for someone working on their self-improvement journey today.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          reminder: { type: Type.STRING },
        },
        required: ["quote", "reminder"]
      },
    },
  });
  return JSON.parse(response.text || '{}');
};
