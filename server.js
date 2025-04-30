const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const dataPath = path.join(__dirname, 'data.json');

// Middleware
app.use(cors({
  origin: ['https://shrutisunny.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
  try {
    await fs.access(dataPath);
  } catch (error) {
    await fs.writeFile(dataPath, JSON.stringify({ messages: [] }, null, 2));
  }
};

// Save message to file
const saveMessage = async (message) => {
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  data.messages.push({
    id: Date.now(),
    message,
    timestamp: new Date().toISOString()
  });
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  return data.messages;
};

// Routes
app.post('/api/messages', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    await saveMessage(message.trim());
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    res.json(data.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Initialize and start
initializeDataFile().then(() => {
  console.log('Data file initialized');
});

module.exports = app;
