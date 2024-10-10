const os = require("os");
let timestamp;
// Capture the bot's start time
const startTime = new Date();

const fs = require('fs');
module.exports.config = {
  name: "up",
  version: "1.0.0",
  cooldown: 5,
  role: 0,
  hasPrefix: true,
  aliases: ['upt'],
  description: "uptime",
  usage: "{pref}[name of cmd]",
  credits: " Ainz"
};

  module.exports.run = async function({ api, event, Utils, chat }) {
    try {
      const nowTime = Date.now();
let callbackMS;
      const user = api.getCurrentUserID();
      const time = Utils.account.get(user).time;  
      const ping = Date.now() - Date.now();
      const days = Math.floor(time / 86400);
      const hours = Math.floor(time % 86400 / 3600);
      const minutes = Math.floor(time % 3600 / 60);
      const seconds = Math.floor(time % 60);

      const loadAverage = os.loadavg();
      const cpuUsage =
        os
          .cpus()
          .map((cpu) => cpu.times.user)
          .reduce((acc, curr) => acc + curr) / os.cpus().length;

      const totalMemoryGB = os.totalmem() / 1024 ** 3;
      const freeMemoryGB = os.freemem() / 1024 ** 3;
      const usedMemoryGB = totalMemoryGB - freeMemoryGB;
      const answering = await chat.reply("⏳ Checking system, please wait...", event.threadID, (err, info) => {
      timestamp = info.timestamp;
      callbackMS = Date.now();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  const latency = timestamp - nowTime;
  const callbackTime = callbackMS - nowTime;
  const mark = `
╭───⧼ sʏsᴛᴇᴍ ɪɴғᴏ ⧽───✧
│─ Language: Node.js
│─ Node.js Version: ${process.version}
│─ Uptime: (${days}) [ ${hours}:${minutes}:${seconds} ]
│─ Latency: ${latency}
│─ Callback: ${callbackTime}
│─ Callback Difference: ${callbackTime - latency} ms
│─ OS: ${os.type()} ${os.arch()}
│─ CPU Model: ${os.cpus()[0].model}
│─ Memory: ${usedMemoryGB.toFixed(2)} GB /${totalMemoryGB.toFixed(2)} GB
│─ CPU Usage: ${cpuUsage.toFixed(1)}%
│─ RAM Usage: ${((usedMemoryGB / totalMemoryGB) * 100).toFixed(1)}%
╰─────────────────⬤
`;

      await 
      chat.edit(mark, answering.messageID);
    } catch (error) {
      console.error("Error retrieving system information:", error);
      api.sendMessage(
        "Unable to retrieve system information.",
        event.threadID,
        event.messageID,
      );
    }
  };