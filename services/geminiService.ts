import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseAnalysis, QAItem } from "../types";
import { 
  SYSTEM_INSTRUCTION_ANALYZER, 
  SYSTEM_INSTRUCTION_QA, 
  SYSTEM_INSTRUCTION_CHAT,
  SYSTEM_INSTRUCTION_DIAGRAM,
  SYSTEM_INSTRUCTION_ARTICLE
} from "../constants";

// Initialize the API client
// CRITICAL: We use process.env.API_KEY directly here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface FileInput {
  data: string; // Base64 string
  mimeType: string;
}

export const analyzeLegalText = async (text: string, file?: FileInput): Promise<CaseAnalysis> => {
  try {
    const parts: any[] = [];
    if (text) parts.push({ text: `Analyze the following legal text/content:\n\n${text}` });
    if (file) parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });

    if (parts.length === 0) throw new Error("No input provided");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYZER,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief executive summary of the text." },
            facts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key facts of the case." },
            issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Legal issues presented." },
            ruling: { type: Type.STRING, description: "The holding or verdict." },
            reasoning: { type: Type.STRING, description: "The rationale behind the decision." }
          },
          required: ["summary", "facts", "issues", "ruling", "reasoning"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CaseAnalysis;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateLegalQA = async (text: string, file?: FileInput): Promise<QAItem[]> => {
  try {
    const parts: any[] = [];
    if (text) parts.push({ text: `Create 5-10 practice questions and answers from this content:\n\n${text}` });
    if (file) parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });

    if (parts.length === 0) throw new Error("No input provided");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_QA,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The practice question." },
              answer: { type: Type.STRING, description: "The detailed correct answer." },
              category: { type: Type.STRING, description: "Topic area (e.g., Criminal Law, Torts)" }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    if (response.text) {
      const items = JSON.parse(response.text) as Omit<QAItem, 'id'>[];
      return items.map((c, i) => ({ ...c, id: `qa-${Date.now()}-${i}` }));
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("QA generation failed:", error);
    throw error;
  }
};

export const streamChatResponse = async (
  history: { role: 'user' | 'model'; text: string }[], 
  newMessage: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Chat stream failed:", error);
    throw error;
  }
};

export const generateFlowchart = async (text: string, file?: FileInput): Promise<string> => {
  try {
    const parts: any[] = [];
    if (text) parts.push({ text: `Create a Mermaid.js flowchart for:\n\n${text}` });
    if (file) parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });

    if (parts.length === 0) throw new Error("No input provided");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DIAGRAM,
      }
    });

    let code = response.text || '';
    // Clean up markdown blocks if present
    code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    
    if (!code) throw new Error("Empty response from AI");
    
    return code;
  } catch (error) {
    console.error("Flowchart generation failed:", error);
    throw error;
  }
};

export const generateLegalArticle = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { 
        parts: [{ text: `Draft a full academic legal article (موضوع قانوني) about: ${topic}` }] 
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ARTICLE,
      }
    });

    if (response.text) {
      return response.text;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Article generation failed:", error);
    throw error;
  }
};