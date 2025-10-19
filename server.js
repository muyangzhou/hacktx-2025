// server.js (Requires 'express', 'cors', and 'body-parser' to be installed)
import 'dotenv/config'; // Load environment variables (like API Key)
import express from 'express';
import cors from 'cors';
import { promptAI } from './backend/ai.js'; // Your original AI function
import { getFormattedPurchaseHistory } from './backend/nessie.js';

const app = express();
const PORT = 3001; // Choose a port different from your React app (usually 3000)

// Middleware
app.use(cors()); // Allows your React app (on port 3000) to talk to this server (on port 3001)
app.use(express.json()); // To parse JSON bodies

// Secure AI Endpoint
app.post('/api/ai', async (req, res) => {
    try {
        // The user's input (prompt) is sent in the body of the request
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }

        // Call the secure AI utility function
        const response = await promptAI(prompt);

        // Send the AI response back to the React client
        res.json({ text: response });

    } catch (error) {
        console.error("Error calling promptAI:", error);
        res.status(500).json({ error: "Internal server error during AI processing." });
    }
});

app.post('/api/nessie', async (req, res) => {
    try {
        // The user's input (prompt) is sent in the body of the request
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }

        // Call the secure AI utility function
        const response = await getFormattedPurchaseHistory(prompt);

        // Send the AI response back to the React client
        res.json({ text: response });

    } catch (error) {
        console.error("Error calling promptAI:", error);
        res.status(500).json({ error: "Internal server error during AI processing." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});