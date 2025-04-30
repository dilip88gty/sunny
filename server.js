const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Replace existing CORS middleware with this
app.use(cors({
    origin: [
      'https://shrutisunny.netlify.app',
      'http://localhost:3000' // For testing
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

const dataPath = path.join(__dirname, 'data.json');

// Initialize data.json if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ messages: [] }, null, 2));
}

// API to save message
app.post('/api/messages', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const data = JSON.parse(fs.readFileSync(dataPath));
        data.messages.push({
            id: Date.now(),
            message,
            timestamp: new Date().toISOString()
        });

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.status(201).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to get all messages
app.get('/api/messages', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath));
        res.json(data.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve frontend files (for local testing)
app.use(express.static(path.join(__dirname, '../frontend')));

// For Vercel deployment
module.exports = app;

// Local server (only for testing)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}