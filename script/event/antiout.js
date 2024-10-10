let antiOutEnabled = true;

module.exports.config = {
  name: "antiout",
  info: 'Prevents user or members from leaving the group.',
  version: "1.0.1",
  usage: "[on/off]",
};

module.exports.handleEvent = async function ({ event, api, chat }) {
  try {
    if (!antiOutEnabled) return; 
    if (event.logMessageData?.leftParticipantFbId === chat.botID()) return;
    if (event.logMessageData?.leftParticipantFbId) {
      const info = await api.getUserInfo(event.logMessageData?.leftParticipantFbId);
      const { name } = info[event.logMessageData?.leftParticipantFbId];
      chat.add(event.logMessageData?.leftParticipantFbId, (error) => {
        if (error) {
          chat.error(`Error adding member ${name} back to the group: ${event.threadID}`, error);
          // chat.reply(`Unable to re-add member ${name} to the group!`);
        } else {
          chat.log(`${name} has been re-added to the group successfully! [${event.threadID}`);
          // chat.reply(`Active antiout mode, ${name} has been re-added to the group successfully!`);
        }
      });
    }
  } catch (error) {
    chat.error('An error occurred:', error);
  }
};

module.exports.run = async function ({ args, chat }) {
  const command = args.join(" ").trim().toLowerCase();
  if (command === "on") {
    antiOutEnabled = true;
    chat.reply("Anti out mode is now enabled");
  } else if (command === "off") {
    antiOutEnabled = false;
    chat.reply("Anti out mode is now disabled");
  } else {
    chat.reply("Type 'on' to enable anti out mode or 'off' to disable it.");
  }
};