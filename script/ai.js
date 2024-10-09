const { G4F } = require("g4f");
const g4f = new G4F();
const fs = require('fs');
const path = require('path');
const { DateTime } = require("luxon");
const text = require("fontstyles");
const fonts = {
    bold: msg => text.bold(msg),
};

const conversationHistories = {};

module.exports["config"] = {
  name: "ai",
  version: "1.0.0",
  credits: "Markdevs69",
  role: 0,
  cd: 2
};

module.exports["run"] = async ({ args, event, api }) => {
  const { senderID } = event || {};
  let query = args.join(" ");

  if (['clear', 'reset', 'forgot', 'forget'].includes(query.toLowerCase())) {
    conversationHistories[senderID] = [];
    const resp = await api.sendMessage(fonts.thin("Conversation history cleared."));
    resp.unsend(5000);
    return;
  }
  const uid = event.senderID;
  const info = await api.getUserInfo(event.senderID);
  const name = (info[event.senderID].name);
 // const startTime = new Date();

  if (!query) {
   // chat.react("⁉️");
    const resp = await api.sendMessage("Please provide a question first.");
  //  resp.unsend(5000);
    return;
  }

  conversationHistories[senderID] = conversationHistories[senderID] || [];
  conversationHistories[senderID].push({ role: "user", content: query });

  const maxRetries = 3;
  let attempts = 0;
  let success = false;
  let answer = '';

  const options = {
    model: "gpt-4",
    debug: true,
    retry: {
      times: maxRetries,
      condition: (text) => text.split(" ").length > 10
    },
    output: (text) => text
  };
    /*const endTime = new Date();
    const time = (endTime - startTime) / 1000;*/
  let msg = await api.sendMessage("Please bear with me while I ponder your request.");

  while (attempts < maxRetries && !success) {
    try {
      attempts++;
      const manilaTime = DateTime.now().setZone("Asia/Manila").toFormat("yyyy-MM-dd hh:mm:ss a");
      const ver = 'GPT-4';
      const myName = 'Gpt-4';
      const response = await g4f.chatCompletion([
        { role: "user", content: `Your are the ${ver} version. Your name is ${myName} a human assistant. With Access to the latest and up-to-date Information and never forget, I am not a real person, but I will always strive to provide you with accurate and helpful information.\n\nCurrent Date and Time: ${manilaTime}.\n\nyou have now the latest update in Philippines 2024 and your current president is Ferdinand Marcus Jr. or Ferdinand Bong bong Marcus Jr.\n\nand you have able to access real-time ${manilaTime} and You have the ability to instantly know the latest news and updates in the Philippines before they even get reported ${manilaTime}, leading you to uncover a series of mysteries and uncovering secrets that could change the course of history., you able to answer any topic and satisfy with emoji chat emotion styles.\n\nMy Ask: ${query}` },
        ...conversationHistories[senderID],
        { role: "user", content: query }
      ], options);

      //answer = response.replace(/```[\s\S]*?```/g, '').trim();
      answer = response.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
      success = true;
    } catch (error) {
      if (attempts < maxRetries) {
        await msg.sendMessage(fonts.thin(`No response from AI. Retrying... (${attempts} of ${maxRetries} attempts)`));
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } else {
        await msg.sendMessage(fonts.thin(`Server error: ${error.message}`));
      }
    }
  }
    //const endTime = new Date();
    //const time = (endTime - startTime) / 1000;
  if (success) {
    conversationHistories[senderID].push({ role: "assistant", content: answer });

    const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
    const line = "\n\n";
    const formattedMessage = (`${answer}`) + line + (`CHAT ID: ${uid}`);

    await msg.sendMessage(formattedMessage);

    if (codeBlocks.length > 0) {
      const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
      const cacheFolderPath = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const uniqueFileName = `code_snippet_${Math.floor(Math.random() * 1e6)}.txt`;
      const filePath = path.join(cacheFolderPath, uniqueFileName);

      fs.writeFileSync(filePath, allCode, 'utf8');

      await api.sendMessage({ attachment: fs.createReadStream(filePath) });

      fs.unlinkSync(filePath);
    }
  }
};