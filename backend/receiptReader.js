// receipt-processor.js (or whatever you call this file)

// Import required libraries
import 'dotenv/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import fs from 'fs';
import path from 'path'; // CRITICAL: Import the path module

// Get the current directory name (equivalent to __dirname in CommonJS)
// This is needed to construct an absolute path in ES Modules
const __dirname = path.resolve(); 

// -------------------------------------------------------------------
// ⭐️ CONFIGURATION: Fill in your values here
// -------------------------------------------------------------------

const GEMINI_API_KEY = process.env.GENAI_API_KEY; 
const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
const NESSIE_ACCOUNT_ID = "68f4425a9683f20dd51a0d6d";

// CRITICAL FIX: Use path.join to create an absolute path to the image
// This ensures Node can find and read the full file contents correctly.
const RECEIPT_IMAGE_PATH_ABSOLUTE = path.join(__dirname, "./", "my_receipt.jpg"); // Adjust 'backend' if the image is in a different relative location

// -------------------------------------------------------------------

// Initialize the Google Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
});

// Configuration for Gemini's safety settings
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// --- Helper Functions ---

/**
 * CORRECTED Helper function to convert a local file to a Gemini Part object.
 */
export function fileToGenerativePart(filePath, mimeType) {
    try {
        // Read the file buffer (binary data)
        // Use the absolute path provided by the caller
        const fileBuffer = fs.readFileSync(filePath); 
        
        // Convert the binary buffer directly to a Base64 string
        const base64Data = fileBuffer.toString("base64");
        
        // Log a check
        console.log(`Successfully loaded file: ${filePath}. Base64 size: ${base64Data.length} chars.`);

        // If the size is too small (e.g., < 1000), throw an error for better debugging
        if (base64Data.length < 1000) {
             throw new Error(`File is too small. Expected a large Base64 string, but got ${base64Data.length} characters. Check file path or integrity.`);
        }

        return {
            inlineData: {
                data: base64Data,
                mimeType
            },
        };
    } catch (e) {
        // CRITICAL: This catch block will tell you if the file was not found
        console.error(`ERROR: Could not read file at path: ${filePath}`, e.message);
        throw e; 
    }
}

/**
 * STEP 1: Parse the receipt image using the Gemini API.
 */
export async function parseReceiptWithGemini(imagePath) {
  console.log("🤖 Starting receipt parse with Gemini-Vision...");

  try {
    const jsonSchema = { /* ... (your schema object) ... */
        type: "OBJECT",
        properties: {
            vendor: { type: "STRING" },
            date: { type: "STRING", description: "The date of the purchase in YYYY-MM-DD format" },
            amount: { type: "NUMBER", description: "The total amount of the purchase" },
            items: { 
              type: "ARRAY", 
              items: { type: "STRING" }, 
              description: "A list of all line items purchased (e.g., 'Chicken Bowl', 'Guac')" 
            }
        },
        required: ["vendor", "date", "amount", "items"] 
    };

    // Use the correct path when creating the part
    const imagePart = fileToGenerativePart(imagePath, "image/jpeg"); 

    const promptParts = [
      imagePart,
      { text: "Analyze this receipt and extract the following information: the vendor name, the total amount, the purchase date (in YYYY-MM-DD format), and a list of all line items. Respond ONLY with the JSON object." },
    ];
    
    // ... (Gemini API call logic remains the same) ...
    const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
        },
        safetySettings: safetySettings,
    });

    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);
    
    console.log("✅ Gemini parsing successful:");
    console.log(parsedJson);
    return parsedJson;

  } catch (error) {
    console.error("❌ Error parsing receipt with Gemini:", error);
    return null;
  }
}

/**
 * STEP 2: Post the parsed purchase data to the Capital One Nessie API.
 * * NOTE: This function relies on the native `fetch` and `Headers` global objects
 * provided by Node.js v18+.
 */
export async function postPurchaseToNessie(accountId, purchaseData) {
  if (!purchaseData) {
    console.log("No purchase data to post. Skipping Nessie API call.");
    return;
  }
  
  // ... (Nessie logic remains the same, as the internal fetch call is fine) ...
  const { vendor, date, amount, items } = purchaseData;
  const url = `http://api.nessieisreal.com/accounts/${accountId}/purchases?key=${NESSIE_API_KEY}`;
  const itemsString = items.join(", "); 
  const newDescription = `${vendor} - ${itemsString}`; 
  const purchasePayload = {
    merchant_id: "57cf75cea73e494d8675ec4a", 
    medium: "balance", 
    purchase_date: date, 
    amount: amount,      
    description: newDescription 
  };

  console.log(`\n🏦 Posting purchase to Nessie for account ${accountId}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(purchasePayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Successfully posted purchase to Nessie:");
      console.log(result);
    } else {
      console.error("❌ Error posting purchase to Nessie:");
      console.error(result);
    }
  } catch (error) {
    console.error("❌ Failed to make Nessie API request:", error);
  }
}

/**
 * Main function to run the program
 */
async function main() {
  // Pass the absolute path created earlier
  const parsedData = await parseReceiptWithGemini(RECEIPT_IMAGE_PATH_ABSOLUTE);
  
  await postPurchaseToNessie(NESSIE_ACCOUNT_ID, parsedData);
}

// Run the main function
// main();