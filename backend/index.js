const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Placeholder endpoint for AI feedback
app.post('/api/feedback', async (req, res) => {
  const { answer } = req.body;
  if (!answer) {
    return res.status(400).json({ error: 'No answer provided.' });
  }
  // TODO: Integrate with Hugging Face model
  res.json({ feedback: 'This is a placeholder. Real AI feedback coming soon!' });
});

app.get('/', (req, res) => {
  res.send('Smart Interview Coach Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
