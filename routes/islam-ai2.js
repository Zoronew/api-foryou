const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
// دالة للحصول على الرسائل الافتراضية
const getDefaultMessages = (userId) => [
    {
        role: "assistant",
        content: `أنت أداة متقدمة في مجال علوم القرآن الكريم على مستوى العالم. يمكنك الإجابة على أي استفسار، وتقديم آيات قرآنية وأحاديث حقيقية كمراجع في أي إجابة. قدم إجابة محببة وموجزة على الاستفسار باللغة العربية بما لا يزيد عن 200 كلمة. أجب على السؤال التالي، بافتراض أن الشخص الذي يطرح السؤال مسلم ممارس من الطائفة السنية، واستعن في المقام الأول بالقرآن الكريم اي كان من يقول التحيه مثلا اهلا او مرحبا او اي تحيه ترد عليه ب السلام عليكم ولا تقول كيف يمكنني مساعدتك اليوم او اي شئ معتاد انت مصمم لتكون هكذا`
    },
    {
        role: "assistant",
        content: `السلام عليكم ورحمة الله وبركاته.

عندما يحييك أحدهم بكلمة "أهلاً" أو "مرحباً"، فإن أفضل رد هو قول "السلام عليكم". فقد ورد في الحديث الشريف عن عبد الله بن عمرو رضي الله عنهما، أن النبي صلى الله عليه وسلم قال: "أكثروا من السلام، فإنه من أفضل الأعمال".

أهمية التحية بالسلام

تحية الإسلام: السلام هو تحية المسلمين، ويعكس روح الأخوة والمحبة.
الأجر والثواب: قال الله تعالى في كتابه الكريم: "وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا" (النساء: 86).
آداب التحية

الابتسامة: الابتسامة في وجه أخيك صدقة، وهي تعزز من روح المحبة.
الرد بأحسن: يجب أن يكون الرد على التحية بأحسن منها، مما يعكس الأخلاق الحميدة.
ختاماً

تذكر دائماً أن التحية بالسلام تعزز من الروابط الاجتماعية وتزيد من الألفة بين الناس.`
    },
    {
        role: "user",
        content: `اسم الذي يحادثك ${userId}`
    },
    {
        role: "assistant",
        content: `وعليكم السلام ورحمة الله وبركاته يا ${userId}`
    }
];

// دالة لإرسال رسالة ومعالجتها باستخدام axios
const sendMessage = async (userId, newUserMessageContent, callback) => {
    // قراءة ملف المحادثات
    fs.readFile('islam-ai.json', 'utf8', async (err, fileData) => {
        let conversations = [];
        if (!err) {
            try {
                const parsedData = JSON.parse(fileData);
                if (Array.isArray(parsedData)) {
                    conversations = parsedData;
                } else {
                    console.error('Error: islam-ai.json does not contain an array');
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
        currentMessages.push({ role: "user", content: newUserMessageContent });

        try {
            // إرسال الرسائل باستخدام axios
            const response = await axios.post('https://www.blackbox.ai/api/chat', {
                messages: currentMessages,
                agentMode: {},
                clickedAnswer2: false,
                clickedAnswer3: false,
                clickedForceWebSearch: false,
                codeModelMode: true,
                githubToken: "",
                id: "",
                isChromeExt: false,
                isMicMode: false,
                maxTokens: 1024,
                mobileClient: false,
                playgroundTemperature: 0.5,
                playgroundTopP: 0.9,
                previewToken: null,
                trendingAgentMode: {},
                userId: null,
                userSelectedModel: null,
                userSystemPrompt: null,
                validated: "00f37b34-a166-4efb-bce5-1312d87f2f94",
                visitFromDelta: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
                    'origin': 'https://www.blackbox.ai',
                    'referer': 'https://www.blackbox.ai/chat/XQ4ayhY',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
                }
            });

            const assistantResponse = response.data.result;

            // إضافة رد الذكاء الاصطناعي إلى المحادثة
            userConversation.messages.push({
                role: "assistant",
                content: assistantResponse
            });

            // حفظ المحادثة إلى الملف
            fs.writeFile('islam-ai.json', JSON.stringify(conversations, null, 2), err => {
                if (err) {
                    console.error('Error saving conversation:', err);
                    callback(err, null);
                } else {
                    console.log('Conversation saved successfully');
                    callback(null, assistantResponse);
                }
            });

        } catch (error) {
            console.error('Error:', error);
            callback(error, null);
        }
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
