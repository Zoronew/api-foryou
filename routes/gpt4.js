const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  const text = req.query.text;

  if (!text) {
    return res.json({
      status: false,
      creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
      message: 'يرجي ادخال نص'
    });
  }

  try {
    const response = await fetch(encodeURI(`https://aemt.me/gpt4?text=${text}`));
    const data = await response.json();

    if (data.result) {
      return res.json({
        status: true,
        creator: '𝑍𝑂𝑅𝑂⚡3𝑀𝐾',
        result: data.result
      });
    } else {
      throw new Error('لم يتم الحصول على نتيجة من الـ API');
    }
  } catch (error) {
    console.error(error);
    const errorResponse = {
      status: false,
      message: error.message,
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
});

module.exports = router;
