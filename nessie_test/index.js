// Import required libraries
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require("fs");
const { default: fetch, Headers } = require("node-fetch");
global.fetch = fetch; // <-- ADD THIS LINE
global.Headers = Headers; // <-- ADD THIS LINE

// -------------------------------------------------------------------
// ⭐️ CONFIGURATION: Fill in your values here
// -------------------------------------------------------------------

// Get your API key from https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = ""; 

// Get your API key from http://api.nessieisreal.com/
const NESSIE_API_KEY = "";

// The Nessie account ID you want to post the purchase to
const NESSIE_ACCOUNT_ID = "";

// The path to the receipt image you want to parse
const RECEIPT_IMAGE_PATH = "my_receipt2.jpg"; // (e.g., './receipt.png' or '/path/to/your/receipt.jpg')

// -------------------------------------------------------------------

// Initialize the Google Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    // Note: As models evolve, you might use "gemini-1.5-flash"
});

// Configuration for Gemini's safety settings
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Helper function to convert a local file to a GoogleGenerativeAI.Part object.
 * @param {string} path - The local file path to the image.
 * @param {string} mimeType - The MIME type of the image (e.g., "image/jpeg").
 * @returns {object} A Part object for the Gemini API.
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

/**
 * STEP 1: Parse the receipt image using the Gemini API.
 * @param {string} imagePath - The file path to the receipt image.
 * @returns {Promise<object | null>} A promise that resolves to the parsed JSON data or null on failure.
 */
async function parseReceiptWithGemini(imagePath) {
  console.log("🤖 Starting receipt parse with Gemini-Vision...");

  try {
    // 1. Define the exact JSON structure we want Gemini to return.
    //    (We've added the "items" array here)
    const jsonSchema = {
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
      required: ["vendor", "date", "amount", "items"] // Ensure "items" is required
    };

    // 2. Create the prompt parts
    const imagePart = fileToGenerativePart(imagePath, "image/jpeg"); // Assumes JPEG, change if PNG

    // (Updated prompt to ask for line items)
    const promptParts = [
      imagePart,
      { text: "Analyze this receipt and extract the following information: the vendor name, the total amount, the purchase date (in YYYY-MM-DD format), and a list of all line items. Respond ONLY with the JSON object." },
    ];
    
    // 3. Send the request to Gemini
    const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }],
        generationConfig: {
            // Instruct the model to output JSON
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
        },
        safetySettings: safetySettings,
    });

    const response = result.response;
    const responseText = response.text();
    
    // 4. Parse the JSON string response
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
 * @param {string} accountId - The Nessie account ID.
 * @param {object} purchaseData - The data from Gemini ({ vendor, date, amount, items }).
 */
async function postPurchaseToNessie(accountId, purchaseData) {
  if (!purchaseData) {
    console.log("No purchase data to post. Skipping Nessie API call.");
    return;
  }

  // (Destructure the new "items" array)
  const { vendor, date, amount, items } = purchaseData;

  // 1. Construct the API endpoint URL
  const url = `http://api.nessieisreal.com/accounts/${accountId}/purchases?key=${NESSIE_API_KEY}`;

  // 2. Create the new dynamic description
  const itemsString = items.join(", "); // Joins the array: ["Chicken Bowl", "Guac"] -> "Chicken Bowl, Guac"
  const newDescription = `${vendor} - ${itemsString}`; // "Chipotle - Chicken Bowl, Guac"

  // 3. Create the JSON payload for the Nessie API
  const purchasePayload = {
    merchant_id: "57cf75cea73e494d8675ec4a", // This is a placeholder merchant_id.
    medium: "balance", // Required by Nessie, "balance" is standard
    purchase_date: date, // "YYYY-MM-DD" format from Gemini
    amount: amount,      // Number from Gemini
    description: newDescription  // (Use our new formatted description)
  };

  console.log(`\n🏦 Posting purchase to Nessie for account ${accountId}...`);
  console.log("Payload:", JSON.stringify(purchasePayload, null, 2));

  try {
    // 4. Make the POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(purchasePayload),
    });

    const result = await response.json();

    // 5. Handle the response
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
  // Check for placeholder values
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || NESSIE_API_KEY === "YOUR_NESSIE_API_KEY_HERE") {
    console.error("Please fill in your API keys in the CONFIGURATION section at the top of the file.");
    return;
  }

  // Step 1: Parse the receipt
  const parsedData = await parseReceiptWithGemini(RECEIPT_IMAGE_PATH);
  
  // Step 2: Post the purchase to Nessie
  await postPurchaseToNessie(NESSIE_ACCOUNT_ID, parsedData);
}

// Run the main function
main();