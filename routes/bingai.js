const express = require('express');
const router = express.Router();
const { bing } = require("gpti");
const fs = require('fs');

// دالة للحصول على الرسائل الافتراضية
const getDefaultMessages = (userId) => [
    {
        role: "assistant",
        content: "مرحبا! كيف أقدر أساعدك اليوم؟ 😊"
    },
    {
        role: "user",
        content: `اسم الذي يحادثك ${userId}`
    },
    {
        role: "assistant",
        content: `مرحبًا! أنا كوبايلوت، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟ 😊`
    }
];

// دالة لإرسال رسالة ومعالجتها باستخدام GPT
const sendMessage = (userId, newUserMessageContent, callback) => {
    // قراءة ملف المحادثات
    fs.readFile('bing-ai.json', 'utf8', (err, fileData) => {
        let conversations = [];
        if (!err) {
            try {
                const parsedData = JSON.parse(fileData);
                if (Array.isArray(parsedData)) {
                    conversations = parsedData;
                } else {
                    console.error('Error: bing-ai.json does not contain an array');
                }
            } catch (e) {
                console.error('Error parsing JSON file:', e);
            }
        }

        // البحث عن محادثة المستخدم
        let userConversation = conversations.find(conv => conv.userName === userId);

        if (!userConversation) {
            // إنشاء محادثة جديدة للمستخدم
            userConversation = {
                userName: userId,
                messages: getDefaultMessages(userId) // الرسائل الافتراضية تُضاف فقط عند إنشاء محادثة جديدة
            };

            conversations.push(userConversation);
        }

        // إضافة الرسالة الجديدة
        userConversation.messages.push({
            role: "user",
            content: newUserMessageContent
        });

        // معالجة الرسالة باستخدام bing
        bing({
            messages: userConversation.messages,
            prompt: newUserMessageContent,
            conversation_style: "Balanced",
            markdown: false,
            stream: false
        }, (err, data) => {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // إضافة رد المساعد إلى المحادثة
                userConversation.messages.push({
                    role: "assistant",
                    content: data.message
                });

                // حفظ المحادثة إلى الملف
                fs.writeFile('bing-ai.json', JSON.stringify(conversations, null, 2), err => {
                    if (err) {
                        console.error('Error saving conversation:', err);
                        callback(err, null);
                    } else {
                        console.log('Conversation saved successfully');
                        callback(null, data.message);
                    }
                });
            }
        });
    });
};

// مسار GET لمعالجة الطلبات
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const q = req.query.q;

    if (!userId || !q) {
        return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال معرف المستخدم والنص' });
    }

    sendMessage(userId, q, (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: err });
        }
        res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: response });
    });
});

module.exports = router;
