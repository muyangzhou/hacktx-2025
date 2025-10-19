import 'dotenv/config';
import axios from 'axios';
// import { promptAI } from './ai.js';


/**
 * Fetches and formats purchase history for a specific account from the Nessie API.
 *
 * @param {string} accountId - The specific account ID to query.
 * @returns {Promise<Array|null>} A promise that resolves to a list of formatted
 * purchase objects, or null if an error occurs.
 */
export async function getFormattedPurchaseHistory(accountId) {
    
    // 2. Setup API details
    const baseUrl = "http://api.nessieisreal.com";
    const endpoint = `/accounts/${accountId}/purchases`;
    const url = `${baseUrl}${endpoint}`;
    
    // Setup parameters to be sent with the request
    const params = {
        key: process.env.NESSIE_API_KEY
    };

    console.log(`Attempting to fetch purchases for account: ${accountId}...`);

    // 3. Make the API request with error handling
    try {
        const response = await axios.get(url, { params: params });
        
        // axios automatically checks for non-2xx status codes and throws an error.
        // The data from the response is in `response.data`.
        const purchases = response.data;

        if (!purchases || purchases.length === 0) {
            console.log("No purchases found for this account.");
            return [];
        }

        // 4. Loop and format the data using .map()
        // This is the standard JavaScript way to transform a list.
        const formattedPurchases = purchases.map(purchase => {
            return {
                "purchase_date": purchase.purchase_date,
                "amount": purchase.amount,
                "description": purchase.description
            };
        });

        console.log(`Successfully fetched and formatted ${formattedPurchases.length} purchases.`);
        return formattedPurchases;

    } catch (error) {
        // 5. Handle any errors from the API call
        if (error.response) {
            // The server responded with a status code outside the 2xx range
            console.error(`Error: API request failed with status code ${error.response.status}`);
            console.error(`Response: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error: No response received from the server.");
        } else {
            // Something else went wrong
            console.error(`An error occurred during the API request: ${error.message}`);
        }
        return null;
    }
}

// --- Example Usage ---
// We wrap this in an async IIFE (Immediately Invoked Function Expression)
// to allow us to use the 'await' keyword at the top level.
// (async () => {
    
//     // !!! IMPORTANT: Replace these with your actual key and account ID
//     const ACCOUNT_TO_CHECK = "68f4283a9683f20dd51a012c";

//     if (ACCOUNT_TO_CHECK === "YOUR_ACCOUNT_ID") {
//         // UH OH
//         // console.log("="*50);
//         // console.log("Please update the 'YOUR_API_KEY' and 'ACCOUNT_TO_CHECK'");
//         // console.log("variables in the script with your values from Nessie.");
//         // console.log("="*50);
//     } else {
//         // Call the function to get the history
//         const history = await getFormattedPurchaseHistory(ACCOUNT_TO_CHECK);

//         // If we got data, print it in the requested JSON format
//         if (history !== null) {
//             // console.log("\n--- Formatted Purchase History (JSON) ---");
//             // Use JSON.stringify to pretty-print the array of objects
//             console.log(JSON.stringify(history, null, 2));
//             const inctructions = "Analyze the following list of transactions. Respond only with a text analysis, not JSON."
//             const prompt = `${inctructions}\n\n--- TRANSACTION DATA ---\n${JSON.stringify(history, null, 2)}`;
//             console.log(await promptAI(prompt));
//         }
//     }
// })();