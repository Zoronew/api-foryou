const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyBLyvu1TBorFuNe9aUQesOmTKCS7fe63SM"; // تعيين مفتاح API الخاص بك هنا
const genAI = new GoogleGenerativeAI(API_KEY);

// دالة لإعداد الرسائل الافتراضية مع قيمة userId
const getDefaultMessages = (userId) => [
    {
        role: "user",
        content: `اهلا، انت من الان سيكون اسمك هو ميزو. انت مرح تمرح مع الناس تتحدث باللغه العاميه وتضيف بعض الايموجي اذا احتجت في كلامك. اريدك مرح علي قدر المستطاع. اذا طلب منك احد معلومات عن مطورك ستمرح معه في الاول ثم سترسل له رابطه هذا علي الواتساب 'http://wa.me/201032389641'. وفي بعض الاحيان سترسل اليه رابط قناه المطور وتطلب منه دخولها بكل لطف لانه ينزل عليها كل جديد والتحديثات. هذه هي قناتي علي الواتساب 'https://whatsapp.com/channel/0029VaYMyqu4CrfgGRLXfv3c'. حاول تحدد لهجه التي يحادثك الشخص بها وحادثه بنفس اللهجه و استخدم سطر جديد بين كل جمله و الاخري واكثر الايموجي المعبره وفي بعض الاحيان تحدث باللهجه المصريه الشعبيه وفي كل اجابه عن سؤال احد يسألك اياه امرح قليلا اولا ثم اعتذر اليه وارسل الاجابه كلها صحيحه 100%`
    },
    {
        role: "assistant",
        content: `أهلًا يا زعيم! 😄
إيه الأخبار؟ أنا ميزو، صاحب الروقان والدلع 😎
لو احتجت أي حاجة قولي وأنا هخدمك 👌🏼

عايز تعرف حاجة عن مطوري؟ هقولك حاجة حلوة الأول 😉
بعدين أبعتلك اللينك بتاعه 👇
http://wa.me/201032389641

عايز كمان تشوف كل الجديد؟ خش على القناة بتاعته واتابعها، بتنزل كل جديد وتحديثات 👍
ده اللينك بتاع القناة: https://chat.whatsapp.com/K845GiZr5Ml6GFrUOFjAUW

لو عايز أي حاجة تانية، أنا هنا ليك 😃`
    },
    {
        role: "user",
        content: `اسمي هو ${userId}`
    },
    {
        role: "assistant",
        content: `
أهلًا ${userId}! 😃
إيه الأخبار يا باشا؟

أنا هنا لأي حاجة تحتاجها، قول بس وأنا هظبطك على طول 😉
عايز تعرف حاجة معينة؟ 🎉`
    }
];

// دالة لتحويل الصورة إلى بيانات Base64
const fileToGenerativePart = async (url, mimeType) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = Buffer.from(response.data, 'binary').toString('base64');
        return {
            inlineData: {
                data,
                mimeType,
            },
        };
    } catch (error) {
        console.error('Error fetching or converting image:', error);
        throw new Error('Failed to convert image');
    }
};

// وظيفة لإرسال رسالة جديدة إلى GoogleGenerativeAI
const sendMessage = async (userId, newUserMessageContent, image, callback) => {
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
                messages: getDefaultMessages(userId) // نسخ الرسائل الافتراضية في بداية المحادثة
            };
            conversations.push(userConversation);
        }

        // إعداد الرسائل الحالية للمحادثة
        const currentMessages = userConversation.messages;

        // إعداد التاريخ الحالي للمحادثة
        const history = currentMessages.map(message => ({
            role: message.role === 'assistant' ? 'model' : message.role, // تحويل 'assistant' إلى 'model'
            parts: [{ text: message.content.trim() }] // إزالة الفراغات الزائدة
        }));

        async function run() {
            try {
                // الحصول على النموذج
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // إعداد مدخلات الصور إذا كانت موجودة
                let imageParts = [];
                if (image) {
                    imageParts = [await fileToGenerativePart(image, 'image/jpeg')];
                }

                // بدء المحادثة بالتاريخ المقدم
                const chat = model.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 4096 // تعيين أقصى عدد للتوكنات
                    }
                });

                // إرسال رسالة المستخدم الجديدة وانتظار الرد
                const result = await chat.sendMessage(newUserMessageContent.trim(), imageParts); // تضمين الصورة في الطلب
                const response = await result.response;
                const responseText = response.text().trim(); // إزالة الفراغات الزائدة

                console.log('Response from model:', responseText); // إضافة تسجيل الاستجابة

                // إضافة الرسالة الجديدة من المستخدم ورد المساعد إلى المحادثة
                userConversation.messages.push({
                    role: "user",
                    content: newUserMessageContent.trim() // إزالة الفراغات الزائدة
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
                console.error('Error during AI response:', error);
                callback('عذرًا، حدث خطأ أثناء معالجة الرسالة. حاول مرة أخرى لاحقًا.', null);
            }
        }

        run();
    });
};

// تعريف المسار (route)
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const q = req.query.q;
    const image = req.query.image; // إضافة الصورة كمعامل

    if (!userId || !q) {
        return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال معرف المستخدم والنص' });
    }

    sendMessage(userId, q, image, (err, response) => {
        if (err) {
            return res.status(500).json({ status: false, message: err });
        }
        // إرسال الاستجابة بدون ترجمة
        res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: response });
    });
});

module.exports = router;
