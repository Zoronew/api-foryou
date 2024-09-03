const express = require('express');
const router = express.Router();
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const translate = require('@vitalets/google-translate-api');

const API_KEY = "AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM"; // تعيين مفتاح API الخاص بك هنا
const genAI = new GoogleGenerativeAI(API_KEY);

// وظيفة لإرسال رسالة جديدة إلى GoogleGenerativeAI
const sendMessage = (userId, newUserMessageContent, callback) => {
    // قراءة المحادثات السابقة
    fs.readFile('conversations-gemini.json', 'utf8', (err, fileData) => {
        let conversations = [];
        if (!err) {
            try {
                const parsedData = JSON.parse(fileData);
                if (Array.isArray(parsedData)) {
                    conversations = parsedData;
                } else {
                    console.error('Error: conversations.json does not contain an array');
                }
            } catch (e) {
                console.error('Error parsing JSON file:', e);
            }
        }

        // العثور على محادثة المستخدم إذا كانت موجودة
        let userConversation = conversations.find(conv => conv.userName === userId);

        if (!userConversation) {
            // إذا لم تكن المحادثة موجودة، أنشئ محادثة جديدة
            userConversation = {
                userName: userId,
                messages: []
            };
            conversations.push(userConversation);
        }

        // إعداد الرسائل الحالية للمحادثة
        const currentMessages = userConversation.messages;

        // إعداد التاريخ الحالي للمحادثة
        const history = currentMessages.map(message => ({
            role: message.role === 'assistant' ? 'model' : message.role, // تحويل 'assistant' إلى 'model'
            parts: [{ text: message.content }]
        }));

        async function run() {
            try {
                // الحصول على النموذج
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // بدء المحادثة بالتاريخ المقدم
                const chat = model.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 100
                    }
                });

                // إرسال رسالة المستخدم الجديدة وانتظار الرد
                const result = await chat.sendMessage(newUserMessageContent);
                const response = await result.response;
                const responseText = response.text();

                // إضافة الرسالة الجديدة من المستخدم ورد المساعد إلى المحادثة
                userConversation.messages.push({
                    role: "user",
                    content: newUserMessageContent
                });
                userConversation.messages.push({
                    role: "model",
                    content: responseText
                });

                // حفظ المحادثات المحدثة في ملف JSON
                fs.writeFile('conversations-gemini.json', JSON.stringify(conversations, null, 2), err => {
                    if (err) {
                        console.error('Error saving conversation:', err);
                        callback(err, null);
                    } else {
                        console.log('Conversation saved successfully');
                        callback(null, responseText);
                    }
                });
            } catch (error) {
                console.error(error);
                callback(error, null);
            }
        }

        run();
    });
};

// تعريف المسار (route)
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const q = req.query.q;

    if (!userId || !q) {
        return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال معرف المستخدم والنص' });
    }

    sendMessage(userId, q, async (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'حدث خطأ أثناء المعالجة' });
        }

        try {
            // ترجمة النص إلى العربية
            const translatedText = await translate(response, { to: 'ar' });

            // إرسال الاستجابة المترجمة
            res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: translatedText.text });
        } catch (error) {
            console.error('Error translating text:', error);
            res.status(500).json({ status: false, message: 'حدث خطأ أثناء ترجمة النص' });
        }
    });
});

module.exports = router;
