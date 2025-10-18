// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "HI can you say hi so i know you work :D",
//   });
//   console.log(response.text);
// }

// await main();

// TODO Not expose the api key

// require('dotenv').config();

import { GoogleGenAI } from "@google/genai";

// const apiKey = process.env.GENAI_API_KEY;
// console.log(`Your API Key: ${apiKey}`);

const ai = new GoogleGenAI({ apiKey: "AIzaSyDCjT1wtl5zvzCZjGjGXWmd52N5eqDCq4E" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "HAI HAI HAI HAI HAI",
  });
  console.log(response.text);
}

main();
