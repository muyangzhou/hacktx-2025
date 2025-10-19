// 1. Import the axios library
const axios = require('axios');

/**
 * --- GENERIC HELPER FUNCTION ---
 * A reusable function to fetch and format data from a Nessie endpoint.
 *
 * @param {string} accountId - The account ID to query.
 * @param {string} apiKey - Your Nessie API key.
 * @param {string} endpointPath - The API path (e.g., "/purchases", "/deposits").
 * @param {string} entityName - A display name for logging (e.g., "Purchases").
 * @param {function} formatter - A function that takes a single API item
 * and returns the formatted object.
 * @returns {Promise<Array|null>} A promise that resolves to a list of
 * formatted objects, or null if an error occurs.
 */
async function fetchAndFormatNessieData(accountId, apiKey, endpointPath, entityName, formatter) {
    
    const baseUrl = "http://api.nessieisreal.com";
    const url = `${baseUrl}/accounts/${accountId}${endpointPath}`;
    const params = { key: apiKey };

    console.log(`Attempting to fetch ${entityName} for account: ${accountId}...`);

    try {
        const response = await axios.get(url, { params: params });
        const data = response.data;

        if (!data || data.length === 0) {
            console.log(`No ${entityName} found for this account.`);
            return [];
        }

        // Use the provided formatter function to map the data
        const formattedData = data.map(formatter);

        console.log(`Successfully fetched and formatted ${formattedData.length} ${entityName}.`);
        return formattedData;

    } catch (error) {
        if (error.response) {
            console.error(`Error: API request for ${entityName} failed with status code ${error.response.status}`);
            console.error(`Response: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error(`Error: No response received from the server for ${entityName}.`);
        } else {
            console.error(`An error occurred during the ${entityName} request: ${error.message}`);
        }
        return null;
    }
}

/**
 * --- FORMATTERS ---
 * These functions define how to map the API data to your desired JSON format.
 */

// Formatter for Purchases
function formatPurchase(purchase) {
    return {
        "purchase_date": purchase.purchase_date,
        "amount": purchase.amount,
        "description": purchase.description
    };
}

// Formatter for Deposits
function formatDeposit(deposit) {
    return {
        "transaction_date": deposit.transaction_date,
        "amount": deposit.amount,
        "description": deposit.description
    };
}

// Formatter for Transactions (Transfers)
function formatTransaction(transfer) {
    return {
        "transaction_date": transfer.transaction_date,
        "amount": transfer.amount,
        "description": transfer.description,
        "payer_id": transfer.payer_id,
        "payee_id": transfer.payee_id
    };
}

/**
 * --- PUBLIC FUNCTIONS ---
 * These are the functions you'll call from your main code.
 */

/**
 * Fetches and formats purchase history for a specific account.
 */
function getFormattedPurchaseHistory(accountId, apiKey) {
    return fetchAndFormatNessieData(
        accountId,
        apiKey,
        "/purchases",
        "purchases",
        formatPurchase
    );
}

/**
 * Fetches and formats deposit history for a specific account.
 */
function getFormattedDepositHistory(accountId, apiKey) {
    return fetchAndFormatNessieData(
        accountId,
        apiKey,
        "/deposits",
        "deposits",
        formatDeposit
    );
}

/**
 * Fetches and formats transaction (transfer) history for a specific account.
 */
function getFormattedTransactionHistory(accountId, apiKey) {
    return fetchAndFormatNessieData(
        accountId,
        apiKey,
        "/transfers",
        "transactions (transfers)",
        formatTransaction
    );
}


// --- Example Usage ---
// We wrap this in an async IIFE to allow us to use 'await'
(async () => {
    
    // !!! IMPORTANT: Replace these with your actual key and account ID
    const YOUR_API_KEY = "YOUR_NESSIE_API_KEY";
    const ACCOUNT_TO_CHECK = "YOUR_ACCOUNT_ID";

    if (YOUR_API_KEY === "YOUR_NESSIE_API_KEY" || ACCOUNT_TO_CHECK === "YOUR_ACCOUNT_ID") {
        console.log("="*50);
        console.log("Please update the 'YOUR_API_KEY' and 'ACCOUNT_TO_CHECK'");
        console.log("variables in the script with your values from Nessie.");
        console.log("="*50);
    } else {
        
        // Use Promise.all to run all three requests concurrently (it's faster)
        const [
            purchaseHistory,
            depositHistory,
            transactionHistory
        ] = await Promise.all([
            getFormattedPurchaseHistory(ACCOUNT_TO_CHECK, YOUR_API_KEY),
            getFormattedDepositHistory(ACCOUNT_TO_CHECK, YOUR_API_KEY),
            getFormattedTransactionHistory(ACCOUNT_TO_CHECK, YOUR_API_KEY)
        ]);

        // Print Purchases
        if (purchaseHistory !== null) {
            console.log("\n--- Formatted Purchase History (JSON) ---");
            console.log(JSON.stringify(purchaseHistory, null, 2));
        }

        // Print Deposits
        if (depositHistory !== null) {
            console.log("\n--- Formatted Deposit History (JSON) ---");
            console.log(JSON.stringify(depositHistory, null, 2));
        }

        // Print Transactions (Transfers)
        if (transactionHistory !== null) {
            console.log("\n--- Formatted Transaction History (JSON) ---");
            console.log(JSON.stringify(transactionHistory, null, 2));
        }
    }
})();