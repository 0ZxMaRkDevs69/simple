const axios = require('axios');
const fs = require('fs');
const devs = require(__dirname.replace("/script", "") + '/system/api');

module.exports["config"] = {
    name: "ai",
    version: "1.0.0",
    aliases: ["Ai","AI"],
    role: 0,
    credits: "Modify by Marky",
    info: "Talk to GPT4 CONTINUES AI",
    commandCategory: "AI",
    usage: "[prompt]",
    cd: 2
};

module.exports["run"] = async function ({ api, event, args, chat, fonts}) {
    const question = args.join(' '), id = event.senderID
    const startTime = new Date();
   
    if (!question)
      return api.sendMessage("Please provide a question first.", event.threadID, event.messageID);

    try {
       api.setMessageReaction("⏳", event.messageID, () => {}, true);
        const info1 = await new Promise(resolve => {
        api.sendMessage("⏳ Please bear with me while I ponder your request...", event.threadID, (err, info1) => {
        resolve(info1);
       }, event.messageID);
      });

        const uid = event.senderID;
        const endTime = new Date();
        const time = (endTime - startTime) / 10000;

      const userInput = encodeURIComponent(question);

        const apiUrl = `${devs.markdevs69}/gpt4?prompt=${userInput}&uid=${id}`;
        
        const respons = await axios.get(apiUrl);
        const TIMES = fonts.monospace(`${time.toFixed(2)}s`);
        /*const answer = (respons.data.gpt4);*/
      const answer = respons.data.gpt4.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
        api.setMessageReaction("✅", event.messageID, () => {}, true);
    const mark = ` ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎${TIMES}\n\n${answer}\nCHAT ID: ${uid}`;
      chat.edit(mark, info1.messageID, () => {});
      /*const mark = `📰 𝙶𝙿𝚃𝟺+ 𝙲𝙽𝚃𝚂 𝙰𝙸 // ${TIMES}\n━━━━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━━━━\n👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${name}\n📎 𝙰𝚞𝚝𝚘𝚋𝚘𝚝 𝙻𝚒𝚗𝚔:    https://cutt.ly/markdevs69`;
      chat.edit(mark, info1.messageID, () => {});*/
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
