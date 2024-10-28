const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
 const apiKey = req.query.apiKey 
  const { url } = req.query; 


  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ status: false, message: 'API Key غلط يبروو.' });
  }
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    const api1 = `https://zoro-api-zoro-bot-5b28aebf.koyeb.app/api/downloader-z4u?url=${url}`;
    const api2 = `https://zoro-foryou.vercel.app/api/downloader-z4u?url=${url}&apiKey=zorolovebmw`;

    try {
        const response = await Promise.race([
            axios.get(api1),
            axios.get(api2),
        ]);
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from APIs' });
    }
});

module.exports = router;
