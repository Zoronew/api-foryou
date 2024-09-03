const express = require('express');
const router = express.Router();
const path = require('path');
const { ytplay } = require('./func/ytplay');

router.get('/', async (req, res) => {
  const searchText = req.query.text;
  const videoUrl = req.query.url;
  try {
    if (!searchText && !videoUrl) {
      const errorResponse = {
        status: false,
        message: 'يجب عليك تحديد نص البحث أو عنوان URL للفيديو'
      };
      res.setHeader('Content-Type', 'application/json');
      res.status(400).send(JSON.stringify(errorResponse, null, 2));
      return;
    }
    let results;
    if (searchText) {
      results = await ytplay(searchText);
    } else {
      results = await ytplay(videoUrl);
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(results, null, 2));
  } catch (error) {
    const errorResponse = {
      status: false,
      message: 'حدث خطأ أثناء معالجة طلبك',
      error: error.message
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
});

module.exports = router;
