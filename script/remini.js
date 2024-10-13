const axios = require('axios');
const fs = require('fs-extra');
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
  name: "remini",
  version: "1.0.",
  role: 0,
  credits: "Mark Hitsuraan",
  info: "enhance your photo ",
  commandCategory: "image",
  usages: "< reply image >",
  cd: 2,
};

module.exports["run"] = async ({ chat, event, args }) => {
  let pathie = __dirname + `/cache/zombie.jpg`;
  const { threadID, messageID } = event;

  var mark = event.messageReply.attachments[0].url || args.join(" ");

  try {
    chat.reply("Enhancing your images...", threadID, messageID);
    const response = await axios.get(`${devs.markdevs69}/api/remini?inputImage=${encodeURIComponent(mark)}`);
    const processedImageURL = response.data.image_data;

    const img = (await axios.get(processedImageURL, { responseType: "arraybuffer"})).data;

    fs.writeFileSync(pathie, Buffer.from(img, 'utf-8'));

    chat.reply({
      body: "Processed Image",
      attachment: fs.createReadStream(pathie)
    }, threadID, () => fs.unlinkSync(pathie), messageID);
  } catch (error) {
    chat.reply(`Error processing image: ${error}`, threadID, messageID);
  };
};