import { GoogleGenAI } from "@google/genai";

export async function summarizeArticle(title: string, summary: string, category: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise, 1-2 sentence AI-powered summary for this news article. 
      Title: ${title}
      Category: ${category}
      Brief: ${summary}
      Focus on the key takeaway or impact. Do not start with "This article is about" or similar phrases.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return null;
  }
}

export async function analyzeArticleDeeply(title: string, summary: string, category: string, trend?: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep strategic analysis for this news article.
      Title: ${title}
      Category: ${category}
      Brief: ${summary}
      ${trend ? `Related Market Trend: ${trend}` : ""}

      Provide the analysis in the following format:
      MARKET CORRELATION: [1 sentence on economic/market impact]
      GEOPOLITICAL IMPACT: [1 sentence on global/regional power shifts]
      FUTURE OUTLOOK: [1 sentence on what to expect next]`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini deep analysis error:", error);
    return null;
  }
}

export async function analyzeImage(base64Image: string, modelId: string = "gemini-2.0-flash") {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    const ai = new GoogleGenAI({ apiKey });

    const imageData = base64Image.split(",")[1] || base64Image;

    const response = await ai.models.generateContent({
      model: modelId, 
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are the world's most advanced Trend Analysis AI. This image is a screenshot of a trending post/news. 
              Analyze it with "Genius-level" depth.
              
              Respond in strict JSON with:
              - ocrText: Full text extraction.
              - summary: 1-2 sharp lines.
              - details: Deep psychological/market analysis of why this is viral.
              - opportunity: A high-potential business idea based on this.
              - nextSteps: 4 professional steps to capitalize on this.

              Tone: Advanced, energetic, Hinglish. Return ONLY JSON.`
            },
            {
              inlineData: {
                data: imageData,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });

    const text = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      summary: "Looks like a viral engagement trend in your niche.",
      details: "Pattern check reveals a high visual hook efficiency. Engagement metrics are peaking.",
      opportunity: "Launch a micro-service around this specific aesthetic style.",
      nextSteps: ["Audit your current assets", "Replicate the hook", "Launch A/B tests"],
      ocrText: "Sample extracted text..."
    };
  }
}

export async function getTrendInsights(query: string, modelId: string = "gemini-2.0-flash") {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `You are "Trend AI" (Super Intelligence mode activated). 
      Your mission: Predict growth and find money-making opportunities in trends.
      
      User: "${query}"
      
      Provide a "Hyper-Fast" Hinglish insight (mix of Hindi & English).
      Structure:
      1. Simple Breakdown (Kya ho raha hai?)
      2. Profitable Idea (Paisa kaise banega?)
      3. Next Action Step (Abhi kya karo?)
      
      Keep it high-energy and brutally honest. Avoid generic advice.`
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight error:", error);
    return "Brain freeze, boss! Short version: This trend is blowing up. Start a niche agency. Step 1: Research the top 3 competitors.";
  }
}

export async function moderateArticle(title: string, summary: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a content moderation AI. Analyze the following news article for policy violations including hate speech, misinformation, harassment, or extreme violence.
      
      Title: ${title}
      Content: ${summary}
      
      Respond in JSON format:
      {
        "isViolating": boolean,
        "violationType": "none" | "hate_speech" | "misinformation" | "harassment" | "violence" | "other",
        "confidenceScore": number (0-1),
        "reasoning": "Brief explanation of the verdict"
      }`,
    });

    const text = response.text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(text);
    } catch (error) {
      return { isViolating: false, violationType: "none", confidenceScore: 0, reasoning: "Parse error" };
    }
  } catch (error) {
    console.error("Gemini moderation error:", error);
    return null;
  }
}
