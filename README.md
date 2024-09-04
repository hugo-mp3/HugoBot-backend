# HugoBot-backend
Overview:
The HugoBot Backend is a Node.js application that serves as the server-side component for the HugoBot project. It handles API requests, processes audio files, and generates lip-sync data. The backend integrates with various services, including OpenAI for chat responses and Eleven Labs for text-to-speech synthesis.

Features
API Endpoints:
/chat: Processes chat messages and returns responses.
/voices: Manages text-to-speech voice options.
Audio Processing:
Converts MP3 files to WAV format using FFmpeg.
Generates lip-sync JSON data using Rhubarb Lip Sync.

Integration:
OpenAI for generating chat responses.
Eleven Labs for text-to-speech synthesis.

Getting Started:
To set up and run the HugoBot backend locally, follow these steps:

Prerequisites:
Node.js (version 16 or later)
FFmpeg (for audio conversion)
Rhubarb Lip Sync (for lip-sync data generation)

Installation:

Clone the repository:
git clone https://github.com/hugo-mp3/HugoBot-backend.git

Install dependencies:
npm install

Create a .env file: Copy the .env.example file to .env and update the following variables with your API keys and configuration:
OPENAI_API_KEY=your_openai_api_key
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key

Install FFmpeg: Follow the installation instructions(https://ffmpeg.org/download.html) for your operating system and ensure ffmpeg is in your system’s PATH.

Install Rhubarb Lip Sync: Download and install Rhubarb Lip Sync from the official website(https://github.com/pixijs/rhubarb-lip-sync). Ensure rhubarb is in your system’s PATH.

Running the Server:

Start the server:
npm start

Access the server: The backend server will start on http://localhost:3000.

Troubleshooting:
Common Issues:
If FFmpeg or Rhubarb are not found, make sure they are correctly installed and in your system’s PATH.
Check for any missing API keys or incorrect configuration in the .env file.
