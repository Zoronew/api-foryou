const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchVideoUrl(apiUrl) {
  const response = await axios.get(apiUrl);
  const result = response.data;

  if (result.status !== true && result.status !== 200) {
    throw new Error('فشل في الحصول على بيانات الفيديو');
  }

  const videoUrl = result.resultado ? result.resultado.videoUrl : result.resultado.videoUrl;
  if (!videoUrl) {
    throw new Error('لم يتم العثور على عنوان URL للفيديو في الرد');
  }

  return videoUrl;
}

router.get('/', async (req, res) => {
  const match_url = req.query.url;
  try {
    if (!match_url) {
      return res.status(400).json({
        status: false,
        message: 'يجب عليك تحديد URL لفيديو Tiktok'
      });
    }

    let videoUrl;

    try {
      const apiUrl1 = `https://api.cafirexos.com/api/tiktokv1?url=${match_url}`;
      videoUrl = await fetchVideoUrl(apiUrl1);
    } catch (error) {
      console.warn('المحاولة الأولى فشلت، جاري تجربة API بديل...');
      const apiUrl2 = `https://api-brunosobrino.onrender.com/api/tiktokv1?url=${match_url}&apikey=BrunoSobrino`;
      videoUrl = await fetchVideoUrl(apiUrl2);
    }

    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    const videoPath = path.resolve(__dirname, 'video.mp4');
    const writer = fs.createWriteStream(videoPath);

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      res.download(videoPath, 'video.mp4', (err) => {
        if (err) {
          console.error('خطأ أثناء إرسال الفيديو:', err.message);
          res.status(500).json({
            status: false,
            message: 'خطأ أثناء إرسال الفيديو'
          });
        }
        fs.unlinkSync(videoPath);
      });
    });

    writer.on('error', (err) => {
      console.error('خطأ أثناء تحميل الفيديو:', err.message);
      res.status(500).json({
        status: false,
        message: 'خطأ أثناء تحميل الفيديو'
      });
    });

  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error.message, error.stack);
    res.status(500).json({
      status: false,
      message: 'خطأ في معالجة الطلب'
    });
  }
});

module.exports = router;
