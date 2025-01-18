const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import Langflow Client and Routes
const { LangflowClient } = require('./langflowClient.js');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const horoscopeRoutes = require('./routes/horoscopeRoutes'); // Correct import path
const { errorHandler } = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1); // Exit if the database connection fails
  });

// Langflow Client setup
const flowIdOrName = process.env.FLOW_ID;
const langflowId = process.env.LANGFLOW_ID;
const applicationToken = process.env.LANGFLOW_APPLICATION_TOKEN;
const langflowClient = new LangflowClient(process.env.LANGFLOW_BASE_URL, applicationToken);

// Health check endpoint
app.get('/api/home', (req, res) => {
  res.status(200).json({
    message: 'I am coming from backend',
    success: true,
  });
});

// Langflow endpoint to run the flow
app.post('/api/v1/runFlow', async (req, res) => {
  const { inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {} } = req.body;

  try {
    const response = await langflowClient.runFlow(
      flowIdOrName,
      langflowId,
      inputValue,
      inputType,
      outputType,
      tweaks,
      stream,
      (data) => console.log('Received:', data.chunk), // onUpdate
      (message) => console.log('Stream Closed:', message), // onClose
      (error) => console.error('Stream Error:', error) // onError
    );

    // Handle non-streamed responses
    if (!stream && response?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.text) {
      const output = response.outputs[0].outputs[0].outputs.message.text;
      res.status(200).json({ message: output });
    } else if (!stream) {
      res.status(500).json({ error: 'Unexpected response structure from Langflow' });
    } else {
      // Stream responses will already be handled
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error while running Langflow:', error.message);
    res.status(500).json({ error: 'Failed to process the Langflow request' });
  }
});

// Authentication and User Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Correct path for user-related routes
app.use('/api/users', horoscopeRoutes); // Correct path for horoscope routes

// Error handling middleware (should be last middleware)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
