import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export async function promptAI(prompt)
{
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return(response.text);
}