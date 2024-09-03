const { PassThrough } = require('stream');
const fetch = require('node-fetch');
const SpottyDL = require('spottydl');
const NodeID3 = require('node-id3');
const axios = require('axios');

async function getMusicBuffer(text) {
  try {
    const isSpotifyUrl = text.match(/^(https:\/\/open\.spotify\.com\/(album|track)\/[a-zA-Z0-9]+)/i);
    let audioBuffer;

    if (isSpotifyUrl) {
      if (isSpotifyUrl[2] === 'album') {
        const album = await downloadAlbum(isSpotifyUrl[0]);
        audioBuffer = album.trackList[0].audioBuffer;
      } else if (isSpotifyUrl[2] === 'track') {
        const track = await downloadTrack(isSpotifyUrl[0]);
        audioBuffer = track.audioBuffer;
      }

      let dataInfo;
      if (isSpotifyUrl[2] === 'album') {
        dataInfo = await SpottyDL.getAlbum(isSpotifyUrl[0]);
      } else if (isSpotifyUrl[2] === 'track') {
        dataInfo = await SpottyDL.getTrack(isSpotifyUrl[0]);
      }

      const tags = {
        title: dataInfo.title || '-',
        artist: dataInfo.artist || '-',
        album: dataInfo.album || '-',
        year: dataInfo.year || '-',
        genre: 'Música',
        comment: {
          language: 'spa',
          text: '🤴🏻 التحميل بواسطة zoro & the-zoro-bit 🤖',
        },
        unsynchronisedLyrics: {
          language: 'spa',
          text: '🤴🏻 التحميل بواسطة zoro & the-zoro-bit 🤖',
        },
        image: {
          mime: 'image/jpeg',
          type: {
            id: 3,
            name: 'front cover',
          },
          description: 'Spotify Thumbnail',
          imageBuffer: await axios.get(dataInfo.albumCoverURL, { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'binary')),
        },
        mimetype: 'image/jpeg',
        copyright: 'Copyright Darlyn ©2023',
      };

      // كتابة التاج إلى Buffer
      const taggedBuffer = await NodeID3.write(tags, audioBuffer);
      return taggedBuffer;

    } else {
      const resDL = await fetch(`https://controlled-gae-deliriusapi.koyeb.app/api/spotify?q=${text}`);
      const jsonDL = await resDL.json();
      const linkDL = jsonDL.data[0].url;
      const dlspoty = await downloadTrack(linkDL);
      const dataInfo = await SpottyDL.getTrack(linkDL);

      const tags = {
        title: dataInfo.title || '-',
        artist: dataInfo.artist || '-',
        album: dataInfo.album || '-',
        year: dataInfo.year || '-',
        genre: 'Música',
        comment: {
          language: 'spa',
          text: '🤴🏻 التحميل بواسطة zoro & the-zoro-bit 🤖',
        },
        unsynchronisedLyrics: {
          language: 'spa',
          text: '🤴🏻 التحميل بواسطة zoro & the-zoro-bit 🤖',
        },
        image: {
          mime: 'image/jpeg',
          type: {
            id: 3,
            name: 'front cover',
          },
          description: 'Spotify Thumbnail',
          imageBuffer: await axios.get(dataInfo.albumCoverURL, { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'binary')),
        },
        mimetype: 'image/jpeg',
        copyright: 'Copyright Darlyn ©2023',
      };

      const audioBuffer = dlspoty.audioBuffer;

      const taggedBuffer = await NodeID3.write(tags, audioBuffer);
      return taggedBuffer;
    }
  } catch (error) {
    console.error(error);
    throw 'حدث خطأ أثناء الحصول على مسار الموسيقى.';
  }
}

async function spotifySearch1(input) {
  try {
    let linkDL = input;
    if (!input.match(/^(https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+)/i)) {
      const resDL = await fetch(`https://controlled-gae-deliriusapi.koyeb.app/api/spotify?q=${input}`);
      const jsonDL = await resDL.json();
      linkDL = jsonDL.data[0].url;
    }
    const dataInfo = await SpottyDL.getTrack(linkDL);
    const dlspoty = await downloadTrack(linkDL);
    const artist = dataInfo.artist || '-';
    const data = {
      title: dataInfo.title || '-',
      artist: artist,
      album: dataInfo.album || '-',
      url: linkDL || '-',
      year: dataInfo.year || '-',
      genre: 'Música',
      thumbnail: dataInfo.albumCoverURL || '-'
    };
    return { resultado: data, download: { audio: dlspoty.audioBuffer } };
  } catch (error) {
    console.error(error);
    throw "حدث خطأ أثناء الحصول على بيانات الموسيقى.";
  }
}

async function spotifySearch2(text) {
  try {
    const resDL = await fetch(`https://controlled-gae-deliriusapi.koyeb.app/api/spotify?q=${text}`);
    const jsonDL = await resDL.json();
    return { resultado: jsonDL.data };
  } catch (error) {
    console.error(error);
    throw "خطأ في البحث عن Spotify.";
  }
}

async function spotifyDownload(input) {
  input = String(input);
  const isSpotifyUrl = input.match(/^(https:\/\/open\.spotify\.com\/(album)\/[a-zA-Z0-9]+)/i);
  if (!isSpotifyUrl) return { status: false, message: 'الرابط الذي تم إدخاله ليس أحد ألبومات Spotify.' };
  try {
    const response = await downloadAlbum(isSpotifyUrl[0]);
    return response;
  } catch (error) {
    return { status: false, error: error.message };
  }
}

module.exports = {
  getMusicBuffer,
  spotifySearch1,
  spotifySearch2,
  spotifyDownload
};
