const express = require('express');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

const router = express.Router();

// الدالة التي تستدعي API لـ Blackbox مع البيانات التي قدمتها
async function blackboxChat(text) {
    const apiUrl = "https://www.blackbox.ai/api/chat";
    const headers = {
        "Accept": "*/*",
        "Accept-Language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/json",
        "Referer": "https://www.blackbox.ai/agent/ImageGenerationLV45LJp",
        "Origin": "https://www.blackbox.ai",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };

    const data = {
        agentMode: {
            mode: true,
            id: "ImageGenerationLV45LJp",
            name: "Image Generation"
        },
        id: "",
        codeModelMode: true,
        githubToken: null,
        isChromeExt: false,
        maxTokens: 4096,
        messages: [
            {
                id: "",
                content: text,
                role: "user"
            }
        ],
        mobileClient: false,
        playgroundTemperature: null,
        playgroundTopP: null,
        previewToken: null,
        trendingAgentMode: {},
        userId: null,
        userSelectedModel: null,
        visitFromDelta: false
    };

    try {
        // زيادة المهلة إلى 60 ثانية
        const response = await axios.post(apiUrl, data, { headers, timeout: 60000 });
        const imageMarkdown = response.data;

        const urlMatch = imageMarkdown.match(/!\[.*?\]\((.*?)\)/);
        const imageUrl = urlMatch ? urlMatch[1] : null;

        if (!imageUrl) {
            throw new Error("Image URL not found");
        }

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 60000 });

        const tempFilePath = path.join(os.tmpdir(), 'z4u.png');
        fs.writeFileSync(tempFilePath, imageResponse.data);
        console.log(`Image saved to ${tempFilePath}`);

        return { success: true, message: "Image saved successfully", path: tempFilePath };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { success: false, message: error.message };
    }
}


// إعداد مسار للتعامل مع الطلبات
router.get('/', async (req, res) => {
    const { text } = req.query; // الحصول على النص من استعلام URL
    if (!text) {
        return res.status(400).json({ success: false, message: "صباح الفل فين text ?" });
    }

    const result = await blackboxChat(text);
    
    if (result.success) {
        // إرسال الصورة إلى المستخدم
        res.sendFile(result.path, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Error sending file");
            }

            // حذف الصورة بعد إرسالها
            fs.unlink(result.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting file:", unlinkErr);
                } else {
                    console.log(`Image deleted from ${result.path}`);
                }
            });
        });
    } else {
        res.json(result);
    }
});

module.exports = router;
