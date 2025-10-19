const GENAI_API_URL = 'http://localhost:3001/api/ai';
const NESSIE_API_URL = 'http://localhost:3001/api/nessie';
var response = null;
var data = null;

response = await fetch(NESSIE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: '68f426849683f20dd519ff49' }), // Send the user's text as JSON
        });
data = await response.json();

// const transactionData = await getFormattedPurchaseHistory("68f426849683f20dd519ff49");
const formattedTransactionData = JSON.stringify(data.text, null, 2);

const instructions = "Analyze the following list of transactions in terms of \
how healthy or unhealthy this list of transastions is. Give the overall list \
of transactions a score value from 0 - 100, where higher scores represent healthy \
transaction histories and lower scores represent unhealthy transaction histories. \
Respond only with a text analysis, not JSON.";

const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

response = await fetch(GENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }), // Send the user's text as JSON
        });
data = await response.json();

console.log(data.text);