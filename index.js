import { exec } from "child_process"; // Import exec for running shell commands
import cors from "cors"; // Import CORS middleware for cross-origin resource sharing
import dotenv from "dotenv"; // Import dotenv to load environment variables from a .env file
import voice from "elevenlabs-node"; // Import ElevenLabs SDK for text-to-speech
import express from "express"; // Import Express framework for building the API
import { promises as fs } from "fs"; // Import filesystem promises for async file operations
import OpenAI from "openai"; // Import OpenAI SDK for interacting with the OpenAI API

dotenv.config(); // Load environment variables from .env file

// Initialize OpenAI API client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // API key for OpenAI
});

// Initialize ElevenLabs API key and voice ID from environment variables
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "zcAOhNBS3c14rBihAFp1"; // The specific voice ID to use for text-to-speech

// Create an Express application
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Middleware to enable CORS
const port = 3000; // Port for the server to listen on

// Define a route for the root URL that responds with "Hello World!"
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Define a route to get available voices from ElevenLabs
app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

// Function to execute shell commands and return a Promise
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error); // Reject promise if there's an error
      resolve(stdout); // Resolve promise with command output
    });
  });
};

// Function to perform lip-sync processing for a given message
const lipSyncMessage = async (message) => {
  const time = new Date().getTime(); // Record start time for performance measurement
  console.log(`Starting conversion for message ${message}`);
  
  // Convert audio from MP3 to WAV format using ffmpeg
  await execCommand(
    `bin\\ffmpeg.exe -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y option allows overwriting existing files
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  
  // Generate lip-sync data using Rhubarb
  /* await execCommand(
    `C:/Users/aleja/Chatbot/virtual-companion-BACKEND/bin/rhubarb.exe -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
    // -r phonetic option is faster but less accurate
  ); */
  //test for if I can get it to work locally
  await execCommand(
    `bin\\rhubarb.exe -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
    // -r phonetic option is faster but less accurate
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

// Define a route for handling chat messages
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message; // Extract user message from request body

  // Generate a chat completion from OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
        You are a virtual companion called Hugo. If asked, you love coding, chess(rated 800 on chess.com which is a world record), and exercise.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Drunk, Stretching, Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle2, Idle3, Terrified, and Angry. Idle3 makes
        the avatar lay on the ground lazily. Do not select Idle3 unless it makes sense given the response or user message.
        `,
      },
      { role: "user", content: userMessage || "Hello" }, // Default message if none provided
    ],
  });

  // Parse the completion response
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // Handle cases where response is an object with a messages property
  }

  // Process each message
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // Generate audio file for the message
    const fileName = `audios/message_${i}.mp3`;
    const textInput = message.text; // Text to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    
    // Generate lip-sync data for the message
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName); // Convert audio file to base64
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`); // Read lip-sync data
  }

  // Send the processed messages as response
  res.send({ messages });
});

// Function to read JSON transcript from a file
const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

// Function to convert audio file to base64 string
const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

// Start the Express server
app.listen(port, () => {
  console.log(`Virtual Companion listening on port ${port}`);
});
