const ytdl = require("ytdl-core");
const { randomBytes } = require("crypto");

class YT {
  constructor() {}

  static isYTUrl(url) {
    const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;
    return ytIdRegex.test(url);
  }

  static getVideoID(url) {
    if (!this.isYTUrl(url)) throw new Error("is not YouTube URL");
    const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;
    return ytIdRegex.exec(url)[1];
  }

  // تحويل الفيديو إلى MP3 وإرجاع البيانات كـ Buffer
  static async mp3(url) {
    try {
      if (!url) {
          throw new Error("Video ID or YouTube Url is required");
      }

      url = this.isYTUrl(url) ? `https://www.youtube.com/watch?v=${this.getVideoID(url)}` : url;
      const stream = ytdl(url, {
        filter: "audioonly",
        quality: 140,
      });

      const buffers = [];
      stream.on("data", (chunk) => {
        buffers.push(chunk);
      });

      return new Promise((resolve, reject) => {
        stream.on("end", () => {
          const fullBuffer = Buffer.concat(buffers); // البيانات كـ Buffer
          resolve(fullBuffer);
        });
        stream.on("error", (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // تحويل الفيديو إلى MP4 وإرجاع البيانات كـ Buffer
  static async mp4(url) {
    try {
      if (!url) {
        throw new Error("Video ID or YouTube Url is required");
      }

      url = this.isYTUrl(url) ? `https://www.youtube.com/watch?v=${this.getVideoID(url)}` : url;
      const stream = ytdl(url, {
        filter: "audioandvideo",
        quality: 'highestvideo',
      });

      const buffers = [];
      stream.on("data", (chunk) => {
        buffers.push(chunk);
      });

      return new Promise((resolve, reject) => {
        stream.on("end", () => {
          const fullBuffer = Buffer.concat(buffers); // إرجاع البيانات كـ Buffer
          resolve(fullBuffer);
        });
        stream.on("error", (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = YT;
