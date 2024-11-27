const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM"; // تعيين مفتاح API الخاص بك هنا
const genAI = new GoogleGenerativeAI(API_KEY);

// دالة لإعداد الرسائل الافتراضية مع الرسائل المطلوبة
const getDefaultMessages = (prompt, q) => [
    {
        role: "user",
        content: prompt
    },
    {
        role: "assistant",
        content: "حسنا سافعل ما تطلبه"
    },
    {
        role: "user",
        content: q
    }
];

// وظيفة لإرسال رسالة جديدة إلى GoogleGenerativeAI
const sendMessage = (prompt, q, callback) => {
    // إعداد الرسائل الحالية للمحادثة
    const currentMessages = getDefaultMessages(prompt, q);

    // إعداد التاريخ الحالي للمحادثة
    const history = currentMessages.map(message => ({
        role: message.role === 'assistant' ? 'model' : message.role, // تحويل 'assistant' إلى 'model'
        parts: [{ text: message.content.trim() }] // إزالة الفراغات الزائدة
    }));

    async function run() {
        try {
            // الحصول على النموذج
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // بدء المحادثة بالتاريخ المقدم
            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 4096 // تعيين أقصى عدد للتوكنات
                }
            });

            // إرسال رسالة المستخدم الجديدة وانتظار الرد
            const result = await chat.sendMessage(q.trim()); // إزالة الفراغات الزائدة
            const response = await result.response;
            const responseText = response.text().trim(); // إزالة الفراغات الزائدة

            console.log('Response from model:', responseText); // إضافة تسجيل الاستجابة

            // إرسال الرد من المساعد
            callback(null, responseText);
        } catch (error) {
            console.error('Error during AI response:', error);
            callback('عذرًا، حدث خطأ أثناء معالجة الرسالة. حاول مرة أخرى لاحقًا.', null);
        }
    }

    run();
};

// تعريف المسار (route)
router.get('/', async (req, res) => {
    const prompt = req.query.prompt;
    const q = req.query.q;

    if (!prompt || !q) {
        return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال النصوص المطلوبة' });
    }

    sendMessage(prompt, q, (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: err });
        }
        // إرسال الاستجابة بدون ترجمة
        res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: response });
    });
});

module.exports = router;
