const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports["config"] = {
  name: "ai",
  version: "5.0",
  role: 0,
  aliases: ["Ai","AI","Gpt","GPT4","gpt4","gpt"],
  credits: "Markdevs69",
  info: "Chat with GPT, process images, and more.",
  usages: "gpt [command] [args]",
  cd: 2,
};

module.exports["run"] = async ({ api, event, args, fonts }) => {
  const { threadID, messageID, senderID } = event;
  const startTime = new Date();
  //const command = args[0].toLowerCase();
  let commands = args[0];
  const query = args.slice(1).join(" ").trim();
  if (query.length < 1) {
      return api.sendMessage("Please provide a question first.", event.threadID, event.messageID);
  }
const command = commands.toLowerCase();
  try {
    switch (command) {
      case 'draw':
        await drawImage(api, threadID, messageID, query);
        break;

      case 'describe':
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
          const photoUrl = event.messageReply.attachments[0].url;
          const description = await describeImage(query, photoUrl);
          api.sendMessage(description, threadID, messageID);
        } else {
          api.sendMessage("Please reply to a message with an image for description.", threadID, messageID);
        }
        break;

      default:
        const answer1 = await b(query, senderID, fonts);
        const answer = answer1.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));

        const uid = event.senderID;
        const endTime = new Date();
  const time = (endTime - startTime) / 10000;
  const TIMES = fonts.monospace(`${time.toFixed(2)}s`);
        api.sendMessage(`   ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎   ‎‎  ‎${TIMES}\n\n${answer}\n\nCHAT ID: ${uid}`, event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, threadID, messageID);
  }
};

async function b(query) {
  try {
    const answer1 = await axios.get(`https://ai-api69-with-model.vercel.app/ai?model=gpt-4o-2024-08-06&system=You are a helpful assistant with emoji chat emotion styles&question=${encodeURIComponent(query)}`);
    return answer1.data.response;
  } catch (error) {
    throw error;
  }
}

async function i(prompt) {
  try {
    const response = await axios.get(`https://dall-e-tau-steel.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}`);
    return response.data.response;
  } catch (error) {
    throw error;
  }
}

async function describeImage(prompt, photoUrl) {
  try {
    const url = `https://sandipbaruwal.onrender.com/gemini2?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(photoUrl)}`;
    const response = await axios.get(url);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function drawImage(api, threadID, messageID, prompt) {
  try {
    const imageUrl = await i(prompt);

    const filePath = path.join(__dirname, 'cache', `image_${Date.now()}.png`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    }).then(() => {
      api.sendMessage({
        body: "",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));
    });
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, threadID, messageID);
  }
}
