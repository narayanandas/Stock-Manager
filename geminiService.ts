
import { GoogleGenAI } from "@google/genai";
import { Customer, StockLog, Product } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (
  customers: Customer[],
  products: Product[],
  logs: StockLog[]
): Promise<string> => {
  try {
    const summary = {
      customersCount: customers.length,
      productsCount: products.length,
      totalLogs: logs.length,
      recentActivity: logs.slice(-5).map(l => ({
        type: l.type,
        qty: l.quantity,
        status: l.paymentStatus
      }))
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this business data and provide a concise 2-3 sentence business health summary and one actionable tip: ${JSON.stringify(summary)}`,
      config: {
        temperature: 0.7,
        systemInstruction: "You are a professional business analyst. Keep advice practical and brief."
      }
    });

    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to fetch AI insights. Check your connection.";
  }
};
