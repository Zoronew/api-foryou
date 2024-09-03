const express = require('express');
const router = express.Router();
const path = require('path');
const { spotifySearch1 } = require('./func/spotify');

router.get('/', async (req, res) => {
  const textoo = req.query.text;
  const urll = req.query.url;
  const input = textoo ? textoo : urll
  try {
    if (!input) {
      const errorResponse = {
        status: false,
        message: 'يجب عليك تحديد عنوان URL أو عنوان الموسيقى.'
      };
      const formattedResults_e = JSON.stringify(errorResponse, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;      
    }
    const spty = await spotifySearch1(input);
    const formattedResponse = {status: true, spty};
    const formattedResults2 = JSON.stringify(formattedResponse, null, 2);
    res.setHeader('Content-Type', 'application/json');  
    res.send(formattedResults2);
  } catch (error) {
    res.sendFile(path.join(__dirname, '../public/500.html'));
  }
});

module.exports = router;
