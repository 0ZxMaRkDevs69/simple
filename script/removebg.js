module.exports["config"] = {
  name: 'removebg',
  version: '1.1.1',
  role: 0,
  credits: 'developer',
  info: 'Edit photo',
  commandCategory: 'Tools',
  usages: 'Reply images or URL images',
  cd: 2,
  dependencies: {
    'form-data': '',
    'image-downloader': ''
  }
};

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { image } = require('image-downloader');

module.exports["run"] = async function ({
  api,
  event,
  args
}) {
  try {
    if (event.type !== "message_reply") return api.sendMessage("You must reply to the photo you want to remove the background.", event.threadID, event.messageID);

    api.sendMessage("Removing background, Please Wait....", event.threadID, event.messageID);

    if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage("Removed Background Has Been Successfully ", event.threadID, event.messageID);
    if (event.messageReply.attachments[0].type != "photo") return api.sendMessage("❌ | This Media is not available", event.threadID, event.messageID);

    const content = (event.type == "message_reply") ? event.messageReply.attachments[0].url : args.join(" ");
    const apiKeys = ["DABuioDTVc19SqDGaWS7CjYy","KW4FmGpWUC6a75gRp8C6n9pB","jXfRdf2iYgDTqRgbe8Um1LwD"]; // Replace with your API keys
    const inputPath = path.resolve(__dirname, 'cache', `photo.png`);

    await image({
      url: content,
      dest: inputPath
    });

    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

    axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKeys[Math.floor(Math.random() * apiKeys.length)],
      },
      encoding: null
    })
      .then((response) => {
        if (response.status != 200) return console.error('Error:', response.status, response.statusText);
        fs.writeFileSync(inputPath, response.data);
        return api.sendMessage({
          attachment: fs.createReadStream(inputPath)
        }, event.threadID, () => fs.unlinkSync(inputPath));
      })
      .catch((error) => {
        return console.error('Failed Removedbg commands api', error);
      });
  } catch (e) {
    console.log(e);
    return api.sendMessage(`Error in API Removed Background Command`, event.threadID, event.messageID);
  }
};