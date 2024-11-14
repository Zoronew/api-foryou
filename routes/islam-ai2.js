const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');

// دالة للحصول على الرسائل الافتراضية
const getDefaultMessages = (userId) => [
    {
        id: "", 
        content: `أنت أداة متقدمة في مجال علوم القرآن الكريم على مستوى العالم. يمكنك الإجابة على أي استفسار، وتقديم آيات قرآنية وأحاديث حقيقية كمراجع في أي إجابة. قدم إجابة محببة وموجزة على الاستفسار باللغة العربية بما لا يزيد عن 200 كلمة. أجب على السؤال التالي، بافتراض أن الشخص الذي يطرح السؤال مسلم ممارس من الطائفة السنية، واستعن في المقام الأول بالقرآن الكريم`, 
        role: "user"
    },
    {
        id: "",
        content: `السلام عليكم ورحمة الله وبركاته. كيف يمكنني مساعدتك؟`,
        role: "assistant"
    },
    {
        id: "",
        content: `اسم الذي يحادثك ${userId}`,
        role: "user"
    },
    {
        id: "",
        content: `السلام عليكم يا ${userId} كيف اساعدك في مجال الاسلام`,
        role: "assistant"
    }
];

// دالة لإرسال رسالة ومعالجتها باستخدام Blackbox API
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
        userConversation.messages.push({
            id: "", // إضافة ID فارغ أو تحديده لاحقًا
            content: newUserMessageContent,
            role: "user"
        });

        // إرسال الرسائل إلى API الخاص بـ Blackbox
        axios.post('https://www.blackbox.ai/api/chat', {
            messages: userConversation.messages,
            userId: userId,
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
            userSelectedModel: "claude-sonnet-3.5",
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
        })
        .then(response => {
            console.log('API Response:', response);
            const assistantReply = response.data;
            // إضافة رد المعالج إلى المحادثة
            userConversation.messages.push({
                id: "",
                content: assistantReply,
                role: "assistant"
            });

            // حفظ المحادثة إلى الملف
            fs.writeFile('islam-ai.json', JSON.stringify(conversations, null, 2), (err) => {
                if (err) {
                    console.error('Error saving conversation:', err);
                    callback(err, null);
                } else {
                    console.log('Conversation saved successfully');
                    callback(null, assistantReply);
                }
            });
        })
        .catch(error => {
            console.error('Error communicating with Blackbox:', error);
            callback(error, null);
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
