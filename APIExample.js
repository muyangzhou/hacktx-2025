import path from 'path';

const GENAI_API_URL = 'http://localhost:3001/api/ai';
const NESSIE_API_URL = 'http://localhost:3001/api/nessie';
const PARSE_API_URL = 'http://localhost:3001/api/process-receipt';

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

const formattedTransactionData = JSON.stringify(data.text, null, 2);

const instructions = "Analyze the following list of transactions in terms of \
how healthy or unhealthy this list of transastions is. Give the overall list \
of transactions a score value from 0 - 100, where higher scores represent healthy \
transaction histories and lower scores represent unhealthy transaction histories. \
Respond only with a text analysis, not JSON.";

const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

// response = await fetch(GENAI_API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ prompt: prompt }), // Send the user's text as JSON
//         });
// data = await response.json();


const RECEIPT_IMAGE_PATH = "./my_receipt2.jpg"; 
const NESSIE_ACCOUNT_ID = "68f426849683f20dd519ff49"; // Get this from your state/context

response = await fetch(PARSE_API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
        imagePath: RECEIPT_IMAGE_PATH,   // Use the correct key from your server logic
        nessieAccountId: NESSIE_ACCOUNT_ID // Add the second required key
    }), 
});
data = await response.json();

console.log(data.text);