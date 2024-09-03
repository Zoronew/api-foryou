const express = require('express');
const router = express.Router();
const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

router.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) return res.json({ status: false, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', message: 'يرجى إدخال نص' });

    const question = text; // يمكنك استخدام text بدلاً من ذلك إذا كنت تريد استخدام النص الذي يأتي من المعلمات
    const encodedQuestion = encodeURIComponent(question);
    const url = `https://bf31jhdm60.execute-api.eu-west-2.amazonaws.com/dev/ask/${encodedQuestion}`;

    try {
        const response = await axios.get(url);
        const reply = response.data.choices[0].message.content;

        // Translate the reply to Arabic
        const translatedReply = await translate(reply, { to: 'ar' });

        res.json({ status: true, creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾', result: translatedReply.text }); // إرجاع النص المترجم
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ status: false, message: 'حدث خطأ أثناء المعالجة' });
    }
});

module.exports = router;
