const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { igdl2 } = require('./func/igdl');

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    const errorResponse = {
      status: false,
      message: 'Debes especificar la URL del video, post, reel, imagen de Instagram.'
    };
    res.status(400).json(errorResponse);
    return;
  }

  try {
    const results = await igdl2(url);
    if (!results || !results.success || !results.data || !Array.isArray(results.data) || results.data.length === 0) {
      throw new Error('لم يتم العثور على عنوان URL في الرد');
    }

    // تحقق من نوع الوسائط وأرسل الاستجابة المناسبة
    const images = results.data.filter(item => item.type === 'imagen');
    const videos = results.data.filter(item => item.type === 'video');

    if (videos.length > 0) {
      const videoUrl = videos[0].url_download;

      // تحميل الفيديو مؤقتاً على السيرفر
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      const videoPath = path.resolve(__dirname, 'video.mp4');
      const writer = fs.createWriteStream(videoPath);

      videoResponse.data.pipe(writer);

      writer.on('finish', () => {
        // إرسال الفيديو مباشرة للعميل
        res.download(videoPath, 'video.mp4', (err) => {
          if (err) {
            console.error('خطأ أثناء إرسال الفيديو:', err.message);
            res.status(500).json({
              status: false,
              message: 'خطأ أثناء إرسال الفيديو'
            });
          } else {
            fs.unlinkSync(videoPath);
          }
        });
      });

      writer.on('error', (err) => {
        console.error('خطأ أثناء تحميل الفيديو:', err.message);
        res.status(500).json({
          status: false,
          message: 'خطأ أثناء تحميل الفيديو'
        });
      });
    } else if (images.length > 0) {
      const imageUrls = images.map(item => item.url_download);
      res.json({
        status: true,
        data: imageUrls
      });
    } else {
      throw new Error('نوع الوسائط غير مدعوم');
    }
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error.message, error.stack);
    res.status(500).json({
      status: false,
      message: `خطأ في معالجة الطلب: ${error.message}`
    });
  }
});

module.exports = router;
