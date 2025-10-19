import { promptAI } from './ai.js';
import { getFormattedPurchaseHistory } from './nessie.js';

const transactionData = await getFormattedPurchaseHistory("68f4283a9683f20dd51a012c");
const formattedTransactionData = JSON.stringify(transactionData, null, 2);
const instructions = "Analyze the following list of transactions. Respond only with a text analysis, not JSON.";
const prompt = `${instructions}\n\n--- TRANSACTION DATA ---\n${formattedTransactionData}`;

console.log(await promptAI(prompt));