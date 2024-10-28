const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const apiKey = req.query.apiKey;
    const { url } = req.query; // استلام الرابط من الاستعلامات

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ status: false, message: 'API Key غلط يبروو.' });
    }
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    const apis = [
        `https://zoro-api-zoro-bot-5b28aebf.koyeb.app/api/downloader-z4u?url=${url}`,
        `https://zoro-foryou.vercel.app/api/downloader-z4u?url=${url}&apiKey=zorolovebmw`
    ];

    let attempt = 0;

    while (attempt < apis.length * 2) {
        try {
            const response = await axios.get(apis[attempt % 2]);
            return res.json(response.data);
        } catch (error) {
            attempt++;
        }
    }

    res.status(500).json({ error: 'Error fetching data from both APIs after multiple attempts' });
});

module.exports = router;
