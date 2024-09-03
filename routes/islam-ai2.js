const express = require('express');
const router = express.Router();
const { gpt } = require("gpti");
const fs = require('fs');

// دالة للحصول على الرسائل الافتراضية
const getDefaultMessages = (userId) => [
    {
        role: "assistant",
        content: "أنت الآن تتحدث مع روبوت الذكاء الاصطناعي. سوف أساعدك في أي استفسار. يرجى توضيح طلبك. إذا كانت لديك أسئلة حول التطبيقات الشائعة أو الحاجة إلى مساعدة، فلا تتردد في طرح الأسئلة."
    },
    {
        role: "assistant",
        content: "حسناً سأساعدك."
    },
    {
        role: "user",
        content: `مرحبا ${userId}`
    },
    {
        role: "assistant",
        content: `رحباً ${userId} إذا كنت بحاجة إلى مساعدة أو معلومات عن خدمات معينة أو طلبات خاصة، لا تتردد في طرح أي سؤال. سأكون سعيداً بمساعدتك. الآن، هل لديك أي سؤال آخر؟`
    }
];

// دالة لإرسال رسالة ومعالجتها باستخدام GPT
const sendMessage = (userId, newUserMessageContent, callback) => {
    // قراءة ملف المحادثات
    fs.readFile('islam-ai.json', 'utf8', (err, fileData) => {
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

        // البحث عن محادثة المستخدم
        let userConversation = conversations.find(conv => conv.userName === userId);

        if (!userConversation) {
            // إنشاء محادثة جديدة للمستخدم
            userConversation = {
                userName: userId,
                messages: getDefaultMessages(userId) // الرسائل الافتراضية
            };

            conversations.push(userConversation);
        }

        // إضافة الرسالة الجديدة
        const currentMessages = userConversation.messages;

        // معالجة الرسالة باستخدام GPT-4
        gpt.v1({
            messages: currentMessages,
            prompt: newUserMessageContent,
            model: "GPT-4",
            markdown: false
        }, (err, data) => {
            if (err != null) {
                console.log(err);
                callback(err, null);
            } else {
                console.log(data);

                // إضافة الرسائل إلى المحادثة
                userConversation.messages.push({
                    role: "user",
                    content: newUserMessageContent
                });
                userConversation.messages.push({
                    role: "assistant",
                    content: data.gpt
                });

                // حفظ المحادثة إلى الملف
                fs.writeFile('islam-ai.json', JSON.stringify(conversations, null, 2), err => {
                    if (err) {
                        console.error('Error saving conversation:', err);
                        callback(err, null);
                    } else {
                        console.log('Conversation saved successfully');
                        callback(null, data.gpt);
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
        return res.json({ status: false, creator: '🤖', message: 'معلومات غير كافية' });
    }

    sendMessage(userId, q, (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'حدث خطأ أثناء معالجة الطلب' });
        }
        res.json({ status: true, creator: '🤖', result: response });
    });
});

module.exports = router;
