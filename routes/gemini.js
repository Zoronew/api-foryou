const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.get('/', async (req, res) => {
  const prompt = req.query.prompt;
  const image = req.query.image;

  if (!prompt) return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: "يرجى إدخال نص" });

  const API_KEY = "AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM";
  const genAI = new GoogleGenerativeAI(API_KEY);

  async function fileToGenerativePart(url, mimeType) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data, 'binary').toString('base64');
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
  }

  try {
    async function run() {
      let text;

      if (image) {
        // For text-and-image input (multimodal), use the gemini-pro-vision model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const imageParts = [await fileToGenerativePart(image, 'image/jpeg')];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = result.response;
        text = await response.text();
      } else {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

        const result = await model.generateContent(prompt);
        const response = result.response;
        text = await response.text();
      }

      res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: text });
    }

    await run();
  } catch (error) {
    console.error(error);
    const errorResponse = {
      status: false,
      message: error.message,
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
});

module.exports = router;
