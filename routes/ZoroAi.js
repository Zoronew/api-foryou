const express = require('express');
const router = express.Router();
const { gpt } = require("gpti");
const fs = require('fs');

// دالة لإعداد الرسائل الافتراضية مع قيمة promot
const getDefaultMessages = (promot) => [
    {
        role: "assistant",
        content: promot
    },
    {
        role: "assistant",
        content: "حسنا سافعل ما تطلبه"
    }
];

// وظيفة لإرسال رسالة جديدة إلى GPT-4
const sendMessage = (userId, newUserMessageContent, promot, callback) => {
    // قراءة المحادثات السابقة
    fs.readFile('conversations.json', 'utf8', (err, fileData) => {
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
                messages: getDefaultMessages(promot) // نسخ الرسائل الافتراضية في بداية المحادثة
            };
            conversations.push(userConversation);
        }

        // إعداد الرسائل الحالية للمحادثة
        const currentMessages = userConversation.messages;

        // إرسال المحادثة إلى GPT-4
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

                // إضافة الرسالة الجديدة من المستخدم ورد المساعد إلى المحادثة
                userConversation.messages.push({
                    role: "user",
                    content: newUserMessageContent
                });
                userConversation.messages.push({
                    role: "assistant",
                    content: data.gpt
                });

                // حفظ المحادثات المحدثة في ملف JSON
                fs.writeFile('conversations.json', JSON.stringify(conversations, null, 2), err => {
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

// تعريف المسار (route)
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const q = req.query.q;
    const promot = req.query.promot;

    if (!userId || !q || !promot) {
        return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال معرف المستخدم، النص و promot' });
    }

    sendMessage(userId, q, promot, (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'حدث خطأ أثناء المعالجة' });
        }
        res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: response });
    });
});

module.exports = router;
