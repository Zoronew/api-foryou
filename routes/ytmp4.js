process.env.YTDL_NO_UPDATE = '1';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { stringify } = require('querystring');
const cheerio = require('cheerio');

// دالة لتحويل رابط فيديو يوتيوب إلى رابط تحميل باستخدام axios و cheerio
const ytmp44 = async (url) => {
  const parameters = {
    'url': url,
    'format': 'mp4',
    'lang': 'en'
  };

  try {
    const conversionResponse = await axios.post('https://s64.notube.net/recover_weight.php', stringify(parameters));
    if (!conversionResponse.data.token) {
      throw new Error('No token received from conversion response.');
    }
    const token = conversionResponse.data.token;
    const downloadPageResponse = await axios.get('https://notube.net/en/download?token=' + token);

    if (downloadPageResponse.status !== 200) {
      throw new Error('Failed to retrieve download page.');
    }

    const $ = cheerio.load(downloadPageResponse.data);
    const result = {
      'titulo': $('#breadcrumbs-section h2').text(),
      'descargar': $('#breadcrumbs-section #downloadButton').attr('href')
    };

    return { status: true, resultados: result };
  } catch (error) {
    console.error('Error converting YouTube video:', error);
    return { status: false, error: error.message };
  }
};

// راوتر لتحميل الفيديوهات
router.get('/', async (req, res) => {
  const link = req.query.url;

  try {
    if (!link) {
      const errorResponse = {
        status: false,
        message: 'Debes especificar la URL de video de YouTube'
      };
      const formattedResults_e = JSON.stringify(errorResponse, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }

    const conversionResult = await ytmp44(link);
    if (!conversionResult.status) {
      res.status(500).json({ status: false, error: conversionResult.error });
      return;
    }

    const { titulo, descargar } = conversionResult.resultados;
    const outputPath = `./tmp/${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`;

    // تحميل الفيديو باستخدام الرابط الذي تم استرداده
    const videoResponse = await axios.get(descargar, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath, videoResponse.data);

    const videoBuffer = Buffer.from(videoResponse.data);
    let fileName = `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`;
    let fileIndex = 1;
    while (fs.existsSync(`./tmp/${fileName}`)) {
      const extension = path.extname(fileName);
      const baseName = path.basename(fileName, extension);
      fileName = `${baseName}_${fileIndex}${extension}`;
      fileIndex++;
    }
    fs.writeFileSync(`./tmp/${fileName}`, videoBuffer);
    res.sendFile(fileName, { root: './tmp' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.sendStatus(500);
      }
      fs.unlinkSync(`./tmp/${fileName}`);
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).sendFile(path.join(__dirname, '../public/500.html'));
  }
});

module.exports = router;
