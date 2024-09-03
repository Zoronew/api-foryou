const express = require('express');
const router = express.Router();
const fs = require('fs');
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  const text = req.query.text;

  if (!text) {
    const errorResponse = {
      status: false,
      message: 'حط اسم الفيديوهات ال عايزها'
    };
    return res.json(errorResponse); // Ensure the error response is sent
  }

  try {
    const response = await fetch(encodeURI(`https://tikwm.com/api/feed/search?keywords=${text}`));
    const hasil = await response.json();
    const result = hasil.data.videos;

    res.json({
      status: true,
      creator: `𝑍𝑂𝑅𝑂⚡3𝑀𝐾`,
      result
    });
  } catch (e) {
    res.json({
      status: false,
      message: 'حدث خطأ أثناء معالجة طلبك'
    });
  }
});

module.exports = router;
