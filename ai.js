import fs from 'fs';
// import path from 'path';\
import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GENAI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const inctructions = "Analyze the following list of transactions. \
                      Respond only with a text analysis, not JSON."

const filePath = './test.json';

async function main()
{
  const jsonString = fs.readFileSync(filePath, 'utf8');
  const prompt = `${inctructions}\n\n--- TRANSACTION DATA ---\n${jsonString}`;

  console.log(prompt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
}

main();