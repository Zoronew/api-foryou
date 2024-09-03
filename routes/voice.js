const express = require('express');
const router = express.Router();
const { ElevenLabsClient } = require("elevenlabs");
const { createWriteStream } = require("fs");
const { v4: uuid } = require("uuid");

router.get('/', async (req, res) => {
  const { text, voice, apikey } = req.query;

  if (!text || !voice || !apikey) {
    return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: "يرجى إدخال text و voice و apikey ليعمل معك" });
  }

  const ELEVENLABS_API_KEY = apikey;

  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  const createAudioFileFromText = async (text, language) => {
    return new Promise(async (resolve, reject) => {
      try {
        const audio = await client.generate({
          voice: voice,
          model_id: "eleven_multilingual_v2",
          text: text,
          language: language
        });
        const fileName = `${uuid()}.mp3`;
        const fileStream = createWriteStream(fileName);

        audio.pipe(fileStream);
        fileStream.on("finish", () => resolve(fileName)); // Resolve with the fileName
        fileStream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  };

  try {
    const fileName = await createAudioFileFromText(text, 'ar');
    res.sendFile(fileName, { root: './', headers: { 'Content-Type': 'audio/mpeg' } });
  } catch (error) {
    console.error("Error creating audio file:", error);
    res.status(500).json({ status: false, message: "حدث خطأ أثناء إنشاء ملف الصوت" });
  }
});

module.exports = router;
