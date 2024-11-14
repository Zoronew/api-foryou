const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// إعداد Express Router
const router = express.Router();

// مفتاح API لـ Google Generative AI
const API_KEY = 'AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM';  // ضع هنا المفتاح الخاص بك
const genAI = new GoogleGenerativeAI(API_KEY);

// نوع MIME للملف الصوتي
const AUDIO_MIME_TYPE = 'audio/mp3';

// دالة لتحميل الملف الصوتي
async function downloadAudioFile(audioFilePath) {
    try {
        const response = await axios.get(audioFilePath, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error('فشل في تحميل الملف الصوتي');
    }
}

// دالة لمعالجة الملف الصوتي
async function processAudioFile(audioFileBuffer, prompt) {
    try {
        // تحويل البيانات إلى base64
        const base64AudioFile = audioFileBuffer.toString('base64');

        // نموذج Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });

        // توليد المحتوى باستخدام البيانات الصوتية
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: AUDIO_MIME_TYPE,
                    data: base64AudioFile,
                },
            },
            { text: prompt },
        ]);

        return result.response.text();  // التأكد من أن النتيجة نصية
    } catch (error) {
        throw new Error('فشل في معالجة الملف الصوتي');
    }
}

// دالة للتحقق من صحة رابط الملف الصوتي
async function validateAudioFileUrl(url) {
    try {
        const response = await axios.head(url);  // نستخدم HEAD للحصول على فقط المعلومات الأساسية
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

// مسار POST لمعالجة الصوت
router.post('/process-audio', async (req, res) => {
    const { audioFilePath, prompt } = req.body;

    if (!audioFilePath || !prompt) {
        return res.status(400).json({ status: false, message: 'معلومات غير كافية' });
    }

    const isValidUrl = await validateAudioFileUrl(audioFilePath);
    if (!isValidUrl) {
        return res.status(400).json({ status: false, message: 'رابط الملف الصوتي غير صالح' });
    }

    try {
        // تحميل الملف الصوتي وتحويله إلى base64
        const audioFileBuffer = await downloadAudioFile(audioFilePath);
        const text = await processAudioFile(audioFileBuffer, prompt);

        res.json({ status: true, result: text });
    } catch (error) {
        console.error('Error during file processing:', error.message);
        res.status(500).json({ 
            status: false, 
            message: 'حدث خطأ أثناء معالجة الطلب',
            error: error.message // يمكنك إضافة مزيد من التفاصيل إذا كانت ضرورية
        });
    }
});

module.exports = router;
