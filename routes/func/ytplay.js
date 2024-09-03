const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');

const ytplay = async (input) => {
  try {
    if (!input) {
      throw new Error('Input not specified');
    }

    // Try the custom API first
    const apiUrl = `https://api.cafirexos.com/api/ytplay?url=${encodeURIComponent(input)}`;
    try {
      const apiResponse = await fetch(apiUrl);
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        return apiData;
      }
    } catch (apiError) {
      console.error('Custom API failed:', apiError);
    }

    // Fallback to the original implementation if the custom API fails
    let info;
    let isSearch = false;
    if (input.startsWith('https://www.youtube.com/') || input.startsWith('https://youtu.be/')) {
      info = await ytdl.getInfo(input, { lang: 'en' });
    } else {
      // Treat the input as a search query
      const searchResults = await yts(input);
      if (!searchResults.videos.length) {
        throw new Error('No videos found for the search query');
      }
      info = await ytdl.getInfo(searchResults.videos[0].url, { lang: 'en' });
      isSearch = true;
    }

    const { videoDetails } = info;
    const audioURL = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }).url;
    const videoURL = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' }).url;
    const shortAudioURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${audioURL}`)).text();
    const shortVideoURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${videoURL}`)).text();

    return {
      resultado: {
        channelUrl: videoDetails.author.channel_url,
        views: videoDetails.viewCount,
        category: videoDetails.category,
        id: videoDetails.videoId,
        url: videoDetails.video_url,
        publicDate: videoDetails.publishDate,
        uploadDate: videoDetails.uploadDate,
        title: videoDetails.title,
        channel: videoDetails.author.name,
        seconds: videoDetails.lengthSeconds,
        description: videoDetails.description,
        image: videoDetails.thumbnails.slice(-1)[0].url,
        download: {
          audio: isSearch ? shortAudioURL : audioURL,
          video: isSearch ? shortVideoURL : videoURL,
        },
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { ytplay };
