const express = require('express');
const router = express.Router();
const Spotify = require('node-spotify-api');
const fetch = require('node-fetch');
const path = require('path');

const spotify = new Spotify({
  id: '9c8fbc8f2bbc48b987cc1b9f4724a314',
  secret: 'fd2195f00e854cd5af7cb54a9c5b1c5f'
});

async function getSpotifyTrackUrl(query) {
  return new Promise((resolve, reject) => {
    spotify.search({ type: 'track', query: query }, function(err, data) {
      if (err) {
        return reject('Error occurred: ' + err);
      }

      const tracks = data.tracks.items;
      if (tracks.length > 0) {
        const track = tracks[0];
        const trackUrl = track.external_urls.spotify;
        resolve(trackUrl);
      } else {
        reject('No track found with the given query.');
      }
    });
  });
}

async function getMusicBuffer(url) {
  const apiUrl = `https://api.cafirexos.com/api/spotifydl?url=${url}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }
  
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

router.get('/', async (req, res) => {
  try {
    const songName = req.query.text;
    if (!songName) {
      const errorResponse = {
        status: false,
        message: 'يجب عليك تحديد اسم الأغنية.'
      };
      const formattedResults_e = JSON.stringify(errorResponse, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }
    
    // احصل على رابط الأغنية من Spotify API
    const trackUrl = await getSpotifyTrackUrl(songName);
    // استخدم هذا الرابط لتحميل الأغنية باستخدام API الخاص بك
    const musicBuffer = await getMusicBuffer(trackUrl);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(musicBuffer);
  } catch (error) {
    console.error(error);
    res.sendFile(path.join(__dirname, '../public/500.html'));
  }
});

module.exports = router;
