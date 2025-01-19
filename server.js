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
// const flowIdOrName = process.env.FLOW_ID;
// const langflowId = process.env.LANGFLOW_ID;
// const applicationToken = process.env.LANGFLOW_APPLICATION_TOKEN;
// const langflowClient = new LangflowClient(process.env.LANGFLOW_BASE_URL, applicationToken);

// Health check endpoint
app.get('/api/home', (req, res) => {
  res.status(200).json({
    message: 'I am coming from backend',
    success: true,
  });
});

// Langflow endpoint to run the flow
// app.post('/api/v1/runFlow', async (req, res) => {
//   const { inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {} } = req.body;

//   try {
//     const response = await langflowClient.runFlow(
//       flowIdOrName,
//       langflowId,
//       inputValue,
//       inputType,
//       outputType,
//       tweaks,
//       stream,
//       (data) => console.log('Received:', data.chunk), // onUpdate
//       (message) => console.log('Stream Closed:', message), // onClose
//       (error) => console.error('Stream Error:', error) // onError
//     );

//     // Handle non-streamed responses
//     if (!stream && response && response.outputs) {
//       const flowOutputs = response.outputs[0];
//       const firstComponentOutputs = flowOutputs.outputs[0];
//       const output = firstComponentOutputs.outputs.message;

//       console.log("Final Output:", output.message.text);
//   }
// } catch (error) {
//   console.error('Main Error', error.message);
// }
// });

app.post('/api/v1/runFlow', async (req, res) =>  {
  // console.log("hi");
  const { inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {} } = req.body;
  // console.log(inputValue);
  const flowIdOrName = process.env.FLOW_ID;
  const langflowId = process.env.LANGFLOW_ID;
  const applicationToken = process.env.LANGFLOW_APPLICATION_TOKEN;
  const langflowClient = new LangflowClient(`${process.env.LANGFLOW_BASE_URL}`,
      applicationToken);

  try {
    const tweaks = {
"ChatInput-Cp7r0": {},
"ChatOutput-e4Zdh": {},
"Memory-YGlYK": {},
"Prompt-o8hZT": {},
"GroqModel-rSr0g": {}
};
    response = await langflowClient.runFlow(
        flowIdOrName,
        langflowId,
        inputValue,
        inputType,
        outputType,
        tweaks,
        stream,
        (data) => console.log("Received:", data.chunk), // onUpdate
        (message) => console.log("Stream Closed:", message), // onClose
        (error) => console.log("Stream Error:", error) // onError
    );
    // console.log(response);
    if (!stream && response && response.outputs) {
        const flowOutputs = response.outputs[0];
        const firstComponentOutputs = flowOutputs.outputs[0];
        const output = firstComponentOutputs.outputs.message;
        res.status(200).json({Final_Output : output.message.text})
      }
    } catch (error) {
      res.status(200).json({Main_error : error.message})
  }
})


// Authentication and User Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Correct path for user-related routes
app.use('/api/users', horoscopeRoutes); // Correct path for horoscope routes

app.get('/api/createKundli', async (req, res) => {
  const {id}  = req.headers;
  const data = await convertPngToPdf(id);
  // const filePath = path.join(__dirname, `./${id}.pdf`); // Path to the PDF file
  // const fileName = "kundli.pdf"; // Name to send as a download
  
  // Ensure the file exists
  // if (fs.existsSync(filePath)) {
  //   res.setHeader("Content-Type", "application/pdf"); // Set content type
  //   res.setHeader(
  //     "Content-Disposition",
  //     `attachment; filename="${fileName}"`
  //   ); // Optional: Make it a download
  //   fs.createReadStream(filePath).pipe(res); // Stream the PDF to the response
  // } else {
  //   res.status(404).send("File not found");
  // }
    res.status(200).json(data);
  
}); 

const getFormattedDate2 = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Add leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = String(today.getFullYear()).slice(-2); // Get the last two digits of the year

  return `20${year}-${month}-${day} `;
};
const getFormattedDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Add leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = String(today.getFullYear()).slice(-2); // Get the last two digits of the year

  return `${day}-${month}-${year}`;
};

app.get('/api/getUserHorroscope', async (req, res) => {
  const {id}  = req.headers;
  let response;
    try {
      response = await User.findById({_id: id})
    } catch(error){
      console.log(error);
      return res.statusCode(500).json({success: false, message: error});
    }
    const sign = response.zodiacSign;
    const date = getFormattedDate2();

  const pythonProcess = spawn('python',["./pythonScripts/scrapeDailyHorroscope.py", sign, date]);
  pythonProcess.stdout.on('data', (data) => {
    return res.json({success: true, message: data.toString()});
  });
  pythonProcess.stderr.on('data', (data) => {
    return res.json({success: false, message: data.toString()});
  });
}); 

app.get('/api/getReels', async (req, res) => {
  const {id}  = req.headers;
  // console.log(id);
  let response;
    try {
      response = await User.findById({_id: id})
    } catch(error){
      console.log(error);
      return res.statusCode(500).json({success: false, message: error});
    }

    const zodiac_sign = response.zodiacSign;
    console.log(zodiac_sign);
    const today_date = getFormattedDate();
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const query = `aaj ka rashifal ${zodiac_sign} ${today_date} in shorts`

  const pythonProcess = spawn('python',["./pythonScripts/scrapeReels.py", query, YOUTUBE_API_KEY]);
  pythonProcess.stdout.on('data', (data) => {
    return res.json({success: true, message: data.toString()});
  });
  pythonProcess.stderr.on('data', (data) => {
    return res.json({success: false, message: data.toString()});
  });
}); 

// Error handling middleware (should be last middleware)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
