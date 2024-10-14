const axios = require("axios");

module.exports["config"] = {
  name: "hercia",
  version: "4.8",
  role: 0,
  credits: "shiki",
  aliases: [],
  usage: "[prompt]",
  cd: 3,
};

module.exports["run"] = async function ({ api, event, args, fonts }) {
  const startTime = new Date();

  if (args.length === 0) {
    api.sendMessage("Please provide a question first.", event.threadID, event.messageID);
    return;
  }

  /*api.sendMessage("🗨️ | Answering your question, Please wait...", event.threadID, event.messageID);*/

  const content = args.join(" ");
  const uid = event.senderID;
  axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(content)}`)
    .then(response => {
      if (response.data.reply) {
        //const aiResponse = response.data.reply;
        const aiResponse = response.data.reply.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
        const endTime = new Date();
  const time = (endTime - startTime) / 10000;
  const TIMES = fonts.monospace(`${time.toFixed(2)}s`);
        api.sendMessage(`   ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${TIMES}\n\n${aiResponse}\n\nCHAT ID: ${uid}`, event.threadID, event.messageID); 
        
      } else {
        api.sendMessage("No response from AI", event.threadID, event.messageID);
      }
    })
    .catch(error => {
      console.error("🤖 Error:", error);
      api.sendMessage("🤖 An error occurred while processing your request, Please try again later.", event.threadID, event.messageID);
    });
};