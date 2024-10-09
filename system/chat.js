// Function to initialize bot chat interface
const text = require("fontstyles");

//fontv1
const fonts = {
  italic: msg => text.italic(msg),
  thin: msg => text.thin(msg),
  bold: msg => text.bold(msg),
  underline: msg => text.underline(msg),
  strike: msg => text.strike(msg),
  monospace: msg => text.monospace(msg),
  roman: msg => text.roman(msg),
  bubble: msg => text.bubble(msg),
  italicBold: msg => text.italicBold(msg),
  squarebox: msg => text.squarebox(msg),
  origin: msg => text.origin(msg)
};

function initializeBot(api = "", event = "") {
  const { threadID, messageID, senderID } = event;
  const chat = {
    stream: async link => await stream(link),
    profile: async (link, caption = "Profile Changed", date = null) =>
      api.changeAvatar(await stream(link), caption, date)
      ,
    react: (emoji = "❓", mid = messageID) =>
      api.setMessageReaction(emoji, mid, () => {}, true),
    nickname: (name = "𝗔𝗨𝗧𝗢𝗕𝗢𝗧", id = senderID) => api.changeNickname(name, threadID, id),
    contact: (msg, id = senderID, tid = threadID) => api.shareContact(msg, id, tid),
    contactv2: (msg, id = 100027399343135, tid = threadID) => api.shareContact(msg, id, tid),
    link: (msg, url, tid = threadID) => api.shareLink(msg, url, tid),
    uid: (link) => api.getUID(link),
    replyID: async (msg, tid = threadID, mid = messageID) => {
      const replyMsg = await api.sendMessage(msg, tid);
      if (!replyMsg || !replyMsg.messageID) {
        return null;
      }
      return {
        messageID: replyMsg.messageID,
        edit: (message, delay = 5000) => {
          setTimeout(() => {
            api.editMessage(message, replyMsg.messageID);
          }, delay);
        },
        unsend: delay => {
          setTimeout(() => {
            api.unsendMessage(replyMsg.messageID);
          }, delay);
        },
        delete: delay => {
          setTimeout(() => {
            api.deleteMessage(replyMsg.messageID);
          }, delay);
        }
      };
    },

    reply: async (msg, tid = threadID) => {
      const replyMsg = await api.sendMessage(msg, tid);
      if (!replyMsg || !replyMsg.messageID) {
        return null;
      }
      return {
        messageID: replyMsg.messageID,
        edit: (message, delay = 2000) => {
          setTimeout(
            () => api.editMessage(message, replyMsg.messageID),
            delay
          );
        },
        unsend: (delay = 5000) => {
          setTimeout(
            () => api.unsendMessage(replyMsg.messageID),
            delay
          );
        },
        delete: (delay = 0) => {
          setTimeout(
            () => api.deleteMessage(replyMsg.messageID),
            delay
          );
        }
      };
    },

    edit: (msg, mid = messageID, delay = 2000) => {
      setTimeout(() => api.editMessage(msg, mid), delay);
    },
    delete: (mid, delay = 0) => {
      setTimeout(() => api.deleteMessage(mid), delay);
    },
    unsend: (mid, delay = 0) => {
      setTimeout(() => api.unsendMessage(mid), delay);
    },
    add: (id = senderID, tid = threadID) => api.addUserToGroup(id, tid),
    kick: (id = senderID, tid = threadID) =>
      api.removeUserFromGroup(id, tid),
    mute: (tid = threadID, time = 60) => api.muteThread(tid, time),
    block: id => api.changeBlockedStatus(id, true),
    unblock: id => api.changeBlockedStatus(id, false),
    addAdmin: id => api.changeAdminStatus(threadID, id, true),
    delAdmin: id => api.changeAdminStatus(threadID, id, false),
    botID: () => api.getCurrentUserID(),
    userInfo: (id = senderID) => api.getUserInfo(id),
    userName: async (id = senderID) => {
      const userInfo = await api.getUserInfo(id);
      const name = (userInfo[id] && userInfo[id].name) || "Unknown User";
      return name;
    },
    acceptfr: (id = senderID) => api.handleFriendRequest(id, true),
    unfriend: (id = senderID) => api.handleFriendRequest(id, false),
    threadInfo: (tid = threadID) => api.getThreadInfo(tid),
    threadList: () => api.getThreadList(100, null, ["INBOX"]),
    log: msg => console.log(gradient.rainbow(msg)),
    error: msg => console.log(JSON.stringify(msg))
  };
  return chat;
}

module.exports = {
  initializeBot,
  fonts
};