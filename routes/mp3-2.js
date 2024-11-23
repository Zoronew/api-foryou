const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM';
const genAI = new GoogleGenerativeAI(API_KEY);

const AUDIO_MIME_TYPE = 'audio/mp3';

async function downloadAudioFile(audioFilePath) {
    const response = await axios.get(audioFilePath, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}

async function processAudioFile(audioFileBuffer, prompt) {
    const base64AudioFile = audioFileBuffer.toString('base64');

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: AUDIO_MIME_TYPE,
                data: base64AudioFile,
            },
        },
        { text: prompt },
    ]);

    return result.response.text();
}

router.post('/process-audio', async (req, res) => {
    const { audioFilePath, prompt } = req.body;

    if (!audioFilePath || !prompt) {
        return res.status(400).json({ status: false, message: 'معلومات غير كافية' });
    }

    try {
        const audioFileBuffer = await downloadAudioFile(audioFilePath);
        const text = await processAudioFile(audioFileBuffer, prompt);

        res.json({ status: true, result: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'حدث خطأ أثناء معالجة الطلب' });
    }
});

module.exports = router;
