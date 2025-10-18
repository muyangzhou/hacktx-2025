import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "HAI HAI HAI HAI HAI",
  });
  console.log(response.text);
}

main();