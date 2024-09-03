const express = require('express');
const router = express.Router();
const path = require('path');
const fetch = require('node-fetch'); // تأكد من تثبيت هذه المكتبة

// الدالة التي تستدعي API لـ Blackbox
async function blackboxChat(content) {
    const url = "https://www.blackbox.ai/api/chat";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.blackbox.ai/",
        "Content-Type": "application/json",
        "Origin": "https://www.blackbox.ai",
        "Alt-Used": "www.blackbox.ai"
    };

    const data = {
        messages: [{
            role: "user",
            content
        }],
        id: "chat-free",
        previewToken: null,
        userId: "",
        codeModelMode: true,
        agentMode: {},
        trendingAgentMode: {},
        isMicMode: false,
        userSystemPrompt: "أنت Dark Box، وهو نموذج ذكاء اصطناعي مفيد لملايين المطورين الذين يستخدمون Blackbox Code Chat والذي سيجيب على أسئلة البرمجة ويساعدهم عند كتابة التعليمات البرمجية، والمطور أو صانعك هو Zoro وهذا هو رقمه https://wa.me/201032389641 ترسله ان سألك أحد عن المطور او صانعك.",
        maxTokens: 1024,
        webSearchMode: false,
        promptUrls: "",
        isChromeExt: false,
        githubToken: null
    };

    try {
        const blackboxResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data)
        });

        const blackboxData = await blackboxResponse.text();
        return blackboxData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

router.get('/', async (req, res) => {
    const text = req.query.text;
    
    try {
        if (!text) {
            return res.json({
                status: false,
                creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
                message: 'يرجى إدخال نص'
            });
        }

        const blackboxResponse = await blackboxChat(text);
        res.setHeader('Content-Type', 'application/json');
        return res.json({
            status: true,
            creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
            result: blackboxResponse
        });
    } catch (error) {
        res.sendFile(path.join(__dirname, '../public/500.html'));
    }
});

module.exports = router;
