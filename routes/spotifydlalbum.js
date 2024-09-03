const express = require('express');
const router = express.Router();
const path = require('path');
const { spotifyDownload } = require('./func/spotify');

router.get('/', async (req, res) => {
  const urll = req.query.url;
  const input = urll;
  try {
    if (!input) {
      const errorResponse = {
        status: false,
        message: 'يجب عليك تحديد عنوان URL لألبوم Spotify.'
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(errorResponse, null, 2));
      return;
    }

    let spty = await spotifyDownload(input);
    console.log(spty);

    // التأكد من أن spty.trackList موجود وأنه يحتوي على trackList مع audioBuffer
    if (!spty.trackList || !spty.trackList.length) {
      throw new Error('لم يتم العثور على قائمة التتبع في الاستجابة.');
    }

    // تحويل كل audioBuffer إلى base64
    const audioBuffersBase64 = spty.trackList.map(track => {
      if (!track.audioBuffer) {
        throw new Error('لا يوجد audioBuffer في أحد العناصر.');
      }
      return track.audioBuffer.toString('base64');
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      ...spty,
      audioBuffer: audioBuffersBase64.join(', ')
    }, null, 2));
  } catch (error) {
    console.error(error);
    res.sendFile(path.join(__dirname, '../public/500.html'));
  }
});

module.exports = router;
