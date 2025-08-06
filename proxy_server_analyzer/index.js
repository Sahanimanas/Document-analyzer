const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(express.json({ limit: '10mb' }));
const allowedOrigins = ['https://document-analyzerm.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true // only if you're using cookies or auth headers
}));// Allow all origins for dev

app.get('/', (req, res) => {
  res.send('Welcome to the Proxy Server Analyzer!');
});

// Proxy endpoint: expects { documentText, question } in body
app.post('/analyze', async (req, res) => {
  const { documentText, question } = req.body;
  if (!documentText || !question) {
    return res.status(400).json({ error: 'Missing documentText or question' });
  }

    const apiKey = process.env.API_KEY; // IMPORTANT: Paste your API key here
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const prompt = `Based *strictly and only* on the following document, please provide a clear and concise answer to the user's question. - If the answer is explicitly stated in the document, quote it or summarize it. - If the answer cannot be found in the document, you MUST respond with: "The answer to this question could not be found in the provided document." - Do not use any external knowledge or make assumptions beyond the text. --- DOCUMENT START --- ${documentText} --- DOCUMENT END --- --- QUESTION --- ${question} --- ANSWER ---`;

  const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    res.status(500).json({ error: errMsg });
  }
});

app.listen(3000, () => {
  console.log('Proxy server analyzer is running on port 3000');
});