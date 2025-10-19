import { promptAI } from './ai.js';
import { getFormattedPurchaseHistory } from './nessie.js';

const transactionData = await getFormattedPurchaseHistory("68f426849683f20dd519ff49");
const formattedTransactionData = JSON.stringify(transactionData, null, 2);

console.log(formattedTransactionData);

const instructions = "Analyze the following list of transactions in terms of \
how healthy or unhealthy this list of transastions is. Give the overall list \
of transactions a score value from 0 - 100, where higher scores represent healthy \
transaction histories and lower scores represent unhealthy transaction histories. \
Respond only with a text analysis, not JSON.";

const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;
console.log(await promptAI(prompt));