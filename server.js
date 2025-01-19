const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const convertPngToPdf = require('./KundliGenerator/index.js')
const { spawn } = require('child_process');
const User = require('./models/userSchema');
// const authMiddleware = require('../middleware/authMiddleware');

// Import Langflow Client and Routes
const { LangflowClient } = require('./langflowClient.js');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const horoscopeRoutes = require('./routes/horoscopeRoutes'); // Correct import path
const { errorHandler } = require('./utils/errorHandler');
const { date } = require('joi');

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

app.get('/api/createKundli', async (req, res) => {
  const {id}  = req.headers;
  await convertPngToPdf(id);
  const filePath = path.join(__dirname, `./${id}.pdf`); // Path to the PDF file
  const fileName = "kundli.pdf"; // Name to send as a download
  
  // Ensure the file exists
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf"); // Set content type
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    ); // Optional: Make it a download
    fs.createReadStream(filePath).pipe(res); // Stream the PDF to the response
  } else {
    res.status(404).send("File not found");
  }
}); 

const getFormattedDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Add leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = String(today.getFullYear()).slice(-2); // Get the last two digits of the year

  return `${year} ${month} ${day}`;
};

app.get('/api/getUserHoroscope', async (req, res) => {
  const { id } = req.headers;
  if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required in headers' });
  }

  try {
      // Fetch user details from the database
      const user = await User.findById({ _id: id });
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      const sign = user.zodiacSign;
      const date = getFormattedDate(); // Ensure this function is defined and works

      // Spawn the Python process
      const pythonProcess = spawn('python', ['./pythonScripts/scrapeDailyHorroscope.py', sign, date]);

      let output = '';
      let error = '';

      // Collect stdout data
      pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
      });

      // Collect stderr data
      pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
      });

      // Handle process close and send the response
      pythonProcess.on('close', (code) => {
          if (code === 0) {
              return res.json({ success: true, message: output.trim() });
          } else {
              console.error(`Python script exited with code ${code}: ${error}`);
              return res.status(500).json({ success: false, message: 'Error executing Python script', error });
          }
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Error handling middleware (should be last middleware)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
