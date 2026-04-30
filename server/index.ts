import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processMessage } from './dialogue/manager';
import { loadHistory, saveHistory } from './data/historyPersistence';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check environment variables
console.log("Environment variables loaded:");
console.log("- PORT:", process.env.PORT);
console.log("- GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("- GEMINI_API_KEY starts with:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
}

const app = express();
const port = process.env.SERVER_PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { userId, text } = req.body;
    if (!text) return res.status(400).send({ error: "Text is required" });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const response = await processMessage(userId || 'default-user', text);
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// History Endpoint
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`Fetching history for user: ${userId}`);
    const history = loadHistory(userId);
    res.json({ history });
});

app.post('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    const { history } = req.body;
    console.log(`Saving history for user: ${userId}, items: ${history?.length || 0}`);
    saveHistory(userId, history);
    res.status(200).send({ message: "History saved successfully" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});