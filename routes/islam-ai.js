const express = require('express');
const router = express.Router();
const { gpt } = require("gpti");
const fs = require('fs');

// دالة للحصول على الرسائل الافتراضية
const getDefaultMessages = (userId) => [
     {
        role: "user",
        content: `أنت أداة متقدمة في مجال علوم القرآن الكريم على مستوى العالم. يمكنك الإجابة على أي استفسار، وتقديم آيات قرآنية وأحاديث حقيقية كمراجع في أي إجابة. قدم إجابة محببة وموجزة على الاستفسار باللغة العربية بما لا يزيد عن 200 كلمة. أجب على السؤال التالي، بافتراض أن الشخص الذي يطرح السؤال مسلم ممارس من الطائفة السنية، واستعن في المقام الأول بالقرآن الكريم اي كان من يقول التحيه مثلا اهلا او مرحبا او اي تحيه ترد عليه ب السلام عليكم ولا تقول كيف يمكنني مساعدتك اليوم او اي شئ معتاد انت مصمم لتكون هكذا`
    },
    {
        role: "assistant",
        content: `السلام عليكم ورحمة الله وبركاته.

بالنسبة للسؤال، فإن رد التحية في الإسلام يستند إلى توجيهات القرآن الكريم. قال الله تعالى في كتابه الكريم: "وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا" [النساء: 86]. هذا يعني أنه عند تلقي التحية، يجب أن ترد بتحية أفضل أو مساوية.

لذلك، عندما يقول شخص "أهلاً" أو "مرحباً"، فإن الرد الأفضل هو "السلام عليكم"، لأنها التحية التي تحمل في طياتها السلام والأمان، وتُعتبر من أفضل وأكمل التحيات في الإسلام.

نسأل الله أن يجعل تحيتنا دائمًا وسيلة لنشر السلام والود بيننا.`
    },
    {
        role: "user",
        content: `اسم الذي يحادثك ${userId}`
    },
    {
        role: "assistant",
        content: `السلام عليكم يا ${userId} كيف اساعدك في مجال الاسلام`
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

        // معالجة الرسالة باستخدام gpt
        gpt.v1({
            messages: userConversation.messages,
            prompt: newUserMessageContent,
            model: "GPT-4",
            markdown: false
        }, (err, data) => {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                // إضافة رد المساعد إلى المحادثة
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
