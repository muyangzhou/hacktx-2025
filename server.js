// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promptAI } from './backend/ai.js';
import { getFormattedPurchaseHistory } from './backend/nessie.js';
import { parseReceiptWithGemini, postPurchaseToNessie } from './backend/receiptReader.js';

// Proof-of-life log to confirm the correct file is running
console.log(`-----\nServer.js version: ${new Date().toLocaleTimeString()}\n-----`);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// ... (other API endpoints remain the same) ...
app.post('/api/ai', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }
        const response = await promptAI(prompt);
        res.json({ text: response });
    } catch (error) {
        console.error("Error calling promptAI:", error);
        res.status(500).json({ error: "Internal server error during AI processing." });
    }
});

app.post('/api/nessie', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }
        const response = await getFormattedPurchaseHistory(prompt);
        res.json({ text: response });
    } catch (error) {
        console.error("Error calling getFormattedPurchaseHistory:", error);
        res.status(500).json({ error: "Internal server error during Nessie processing." });
    }
});


app.post('/api/process-receipt', async (req, res) => {
    const { imageData, nessieAccountId } = req.body;

    if (!imageData || !nessieAccountId) {
        return res.status(400).json({ success: false, message: "Missing imageData or nessieAccountId." });
    }

    let tempImagePath = '';
    try {
        console.log("Backend: Received request to process receipt.");
        const imageBuffer = Buffer.from(imageData, 'base64');
        tempImagePath = path.join(os.tmpdir(), `receipt-${Date.now()}.png`);
        await fs.writeFile(tempImagePath, imageBuffer);
        console.log(`Backend: Image saved temporarily to ${tempImagePath}`);

        // This function correctly returns an object now.
        const geminiObject = await parseReceiptWithGemini(tempImagePath);
        console.log("Backend: Received object from Gemini:", geminiObject);

        if (!geminiObject || typeof geminiObject !== 'object') {
             throw new Error("Failed to parse receipt with Gemini. Response was not a valid object.");
        }
        
        // The redundant JSON.parse is confirmed to be removed.
        
        const nessieResult = await postPurchaseToNessie(nessieAccountId, geminiObject);
        console.log("Backend: Received from Nessie:", nessieResult);
        
        console.log("Backend: Sending successful response to frontend.");
        res.json({
            success: true,
            message: "Receipt processed successfully.",
            geminiData: geminiObject, // Send the object
            nessieResponse: nessieResult
        });

    } catch (error) {
        console.error("Backend: CRITICAL ERROR in /api/process-receipt:", error);
        res.status(500).json({ 
            success: false, 
            message: "An internal server error occurred.",
            error: error.message
        });
    } finally {
        if (tempImagePath) {
            try {
                await fs.unlink(tempImagePath);
                console.log(`Backend: Cleaned up temporary file: ${tempImagePath}`);
            } catch (cleanupError) {
                console.error("Backend: Error cleaning up temp file:", cleanupError);
            }
        }
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

