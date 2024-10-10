const axios = require('axios');
const fs = require('fs-extra');

module.exports["config"] = {
  name: "autodlv2",
  version: "1.0.1",
  role: 0,
  credits: "Mark Hitsuraan",
  info: "Video Downloader from various platforms",
  usages: "video link",
  cd: 2
};

module.exports["handleEvent"] = async function({ api, event }) {
  let message = event.body;
  if (!message) {
    return;
  }

  const urlPatterns = [
    'https://vt.tiktok.com',
    'https://vm.tiktok.com',
    'https://www.facebook.com',
    'https://fb.watch',
    'https://www.instagram.com/',
    'https://youtu.be/',
    'https://www.instagram.com/p/',
    'https://pin.it/',
    'https://youtube.com/',
    'https://imgur.com'
  ];

  if (!urlPatterns.some(pattern => message.startsWith(pattern))) {
    return;
  }

  try {
    if (message.startsWith('https://i.imgur.com')) {
      const fileExtension = message.substring(message.lastIndexOf('.'));
      const response = await axios.get(message, { responseType: 'arraybuffer' });
      const filePath = `${__dirname}/cache/dipto${fileExtension}`;
      fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));
      await api.sendMessage({ body: 'Downloaded from link', attachment: fs.createReadStream(filePath) }, event.threadID);
      fs.unlinkSync(filePath);
    } else {
      const response = await axios.get(`https://www.noobs-api.000.pe/dipto/alldl?url=${encodeURIComponent(message)}`);
      const { title, result } = response.data;
      const filePath = `${__dirname}/cache/video.mp4`;
      const videoData = await axios.get(result, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(videoData.data, 'utf-8'));

      if (message.startsWith('https://fb.watch') || message.startsWith('https://www.instagram.com')) {
        await api.sendMessage({
          body: ``,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);
      } else {
        await api.sendMessage({
          body: ``,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);
      }

      fs.unlinkSync(filePath);
    }
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
  }
};

module.exports["run"] = function({ api, event }) {};