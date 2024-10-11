const fs = require('fs');
const path = require('path');
const login = require('./system/chatbox-fca-remake/index');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { initializeBot, fonts } = require('./system/chat');
//const { OnChat, font } = require('./system/onChat');

//const chalk = require('chalk');
//const gradient = require('gradient-string');
const script = path.join(__dirname, 'script');
const cron = require('node-cron');
const config = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();
const Utils = new Object({
  commands: new Map(),
  handleEvent: new Map(),
  account: new Map(),
  cooldowns: new Map(),
  ObjectReply: new Map(),
  handleReply: [],
});
//const custom = require('./custom');
const tin = txt => fonts.thin(txt);


fs.readdirSync(script).forEach((file) => {
  const scripts = path.join(script, file);
  const stats = fs.statSync(scripts);

  if (stats.isDirectory()) {
    fs.readdirSync(scripts).forEach((file) => {
      const filePath = path.join(scripts, file);

      if (path.extname(filePath).toLowerCase() === '.js') {
        const EVENT = file.replace(/\.js$/, '');
        console.log(`LOADING EVENT [${EVENT.toUpperCase()}]`);
        try {
          const {
            config,
            run,
            handleEvent,
            handleReply
          } = require(filePath);

          if (config) {
            const {
              name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], info = '', usage = '', credits = '',  cd = '5'
            } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));

            aliases.push(name);




      if (run) {
              Utils.commands.set(aliases, {
                name,
                role,
                run,
                aliases,
                info,
                usage,
                version,
                hasPrefix: config.hasPrefix,
                credits,
                cd
              });
            }

            if (handleEvent) {
              Utils.handleEvent.set(aliases, {
                name,
                handleEvent,
                role,
                info,
                usage,
                version,
                hasPrefix: config.hasPrefix,
                credits,
                cd
              });
            }

            if (handleReply) {
              Utils.ObjectReply.set(aliases, {
                name,
                handleReply,
              });
            }
          }
        } catch (error) {
          console.error(`ERROR LOADING EVENT [${file}]: ${error.message}`);
        }
      }
    });
  } else if (path.extname(scripts).toLowerCase() === '.js') {
    const CMD = file.replace(/\.js$/, '');
    console.log(`DEPLOYED COMMAND: [${CMD.toUpperCase()}]`);
    try {
      const {
        config,
        run,
        handleEvent,
        handleReply
      } = require(scripts);

      if (config) {
        const {
          name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], info = '', usage = '', credits = '',  cd = '5'
        } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));

        aliases.push(name);

        if (run) {
          Utils.commands.set(aliases, {
            name,
            role,
            run,
            aliases,
            info,
            usage,
            version,
            hasPrefix: config.hasPrefix,
            credits,
            cd
          });
        }

        if (handleEvent) {
          Utils.handleEvent.set(aliases, {
            name,
            handleEvent,
            role,
            info,
            usage,
            version,
            hasPrefix: config.hasPrefix,
            credits,
            cd
          });
        }

        if (handleReply) {
          Utils.ObjectReply.set(aliases, {
            name,
            handleReply,
          });
        }
      }
    } catch (error) {
      console.error(`ERROR LOADING COMMAND [${file}]: ${error.message}`);
    }
  }
});
/*
const stater = require("./system/stater");
app.get("/stater", async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    res.status(400).json({
      message: "Please provide both email and password.",
    });
  } else {
    try {
      const session = await stater.getCookie(email, password, (error, fbstate) => {
        if (error) {
          res.status(500).json({
            message: "An error occurred while logging in.",
          });
        }

        if (fbstate) {
          res.status(200).json({
            appsState: fbstate,
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});
*/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const routes = [{
  path: '/',
  file: '69.html'
}, ];
routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', route.file));
  });
});
app.get('/info', (req, res) => {
  const data = Array.from(Utils.account.values()).map(account => ({
    name: account.name,
    profileUrl: account.profileUrl,
    thumbSrc: account.thumbSrc,
    time: account.time
  }));
  res.json(JSON.parse(JSON.stringify(data, null, 2)));
});
app.get('/commands', (req, res) => {
  const command = new Set();
  const commands = [...Utils.commands.values()].map(({
    name
  }) => (command.add(name), name));
  const handleEvent = [...Utils.handleEvent.values()].map(({
    name
  }) => command.has(name) ? null : (command.add(name), name)).filter(Boolean);
  const role = [...Utils.commands.values()].map(({
    role
  }) => (command.add(role), role));
  const aliases = [...Utils.commands.values()].map(({
    aliases
  }) => (command.add(aliases), aliases));
  res.json(JSON.parse(JSON.stringify({
    commands,
    handleEvent,
    role,
    aliases
  }, null, 2)));
});
app.post('/login', async (req, res) => {
  const {
    state,
    prefix,
    admin
  } = req.body;
  try {
    if (!state) {
      throw new Error('Missing app state data');
    }
    const cUser = state.find(item => item.key === 'c_user');
    if (cUser) {
      const existingUser = Utils.account.get(cUser.value);
      if (existingUser) {
        console.log(`User ${cUser.value} is already logged in`);
        return res.status(400).json({
          error: false,
          message: "Active user session detected; already logged in",
          user: existingUser
        });
      } else {
        try {
          await accountLogin(state, prefix, [admin]);
          res.status(200).json({
            success: true,
            message: 'Authentication process completed successfully; login achieved.'
          });
        } catch (error) {
          console.error(error);
          res.status(400).json({
            error: true,
            message: error.message
          });
        }
      }
    } else {
      return res.status(400).json({
        error: true,
        message: "There's an issue with the appstate data; it's invalid."
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: "There's an issue with the appstate data; it's invalid."
    });
  }
});
app.listen(PORT, () => {
  console.log(`\n▄▀█ █░█ ▀█▀ █▀█ █▄▄ █▀█ ▀█▀\n█▀█ █▄█ ░█░ █▄█ █▄█ █▄█ ░█░ 𝚖𝚊𝚛𝚔𝚍𝚎𝚟𝚜69
\nAUTOBOT IS RUNNING ON PORT: ${PORT}`);
});
process.on('unhandledException', (reason) => {
  console.error('Unhandled Exception at:', reason);
});
process.on('unhandledException', (error) => {
  console.error('Unhandled Exception:', error);
});


async function accountLogin(state, prefix, admin = []) {
  return new Promise((resolve, reject) => {
    login({
      appState: state
    }, async (error, api) => {
      if (error) {
        reject(error);
        return;
      }
      const userid = await api.getCurrentUserID();
      addThisUser(userid, state, prefix, admin);
      try {
        const userInfo = await api.getUserInfo(userid);
        if (!userInfo || !userInfo[userid]?.name || !userInfo[userid]?.profileUrl || !userInfo[userid]?.thumbSrc) throw new Error('Unable to locate the account; it appears to be in a suspended or locked state.');
        const {
          name,
          profileUrl,
          thumbSrc
        } = userInfo[userid];
        let time = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(user => user.userid === userid) || {}).time || 0;
        Utils.account.set(userid, {
          name,
          profileUrl,
          thumbSrc,
          time: time
        });
        const intervalId = setInterval(() => {
          try {
            const account = Utils.account.get(userid);
            if (!account) throw new Error('Account not found');
            Utils.account.set(userid, {
              ...account,
              time: account.time + 1
            });
          } catch (error) {
            clearInterval(intervalId);
            return;
          }
        }, 1000);
      } catch (error) {
        reject(error);
        return;
      }
      api.setOptions({
        listenEvents: config[0].fcaOption.listenEvents,
        logLevel: config[0].fcaOption.logLevel,
        updatePresence: config[0].fcaOption.updatePresence,
        selfListen: config[0].fcaOption.selfListen,
        forceLogin: config[0].fcaOption.forceLogin,
        online: config[0].fcaOption.online,
        autoMarkDelivery: config[0].fcaOption.autoMarkDelivery,
        autoMarkRead: config[0].fcaOption.autoMarkRead,
      });
      //FUNCTION FOR CUSTOM
        global.custom = require('./custom.js')({ api: api });
      try {
        api.listenMqtt(async (error, event) => {
          if (error) {
            if (error === 'Connection closed.') {}
          }
         // const box = new OnChat(api, event);
          const chat = initializeBot(api, event);
          if (event?.senderID === userid) return
          let database = await fs.existsSync('./data/database.json') ? JSON.parse(fs.readFileSync('./data/database.json', 'utf8')) : createDatabase();
          let history = await fs.existsSync('./data/history.json') ? JSON.parse(fs.readFileSync('./data/history.json')) : {};
          if (!userid === event?.senderID || database.length === 0 || !Object.keys(database[0]?.Threads || {}).includes(event?.threadID)) {
            create = createThread(event.threadID, api);
          } else {
            update = updateThread(event?.senderID)
          }
          let blacklist = (history.find(blacklist => blacklist.userid === userid) || {}).blacklist || [];
          let hasPrefix = (event.body && aliases((event.body || '')?.trim().toLowerCase().split(/ +/).shift())?.hasPrefix == false) ? '' : prefix;
          let [command, ...args] = ((event.body || '').trim().toLowerCase().startsWith(hasPrefix?.toLowerCase()) ? (event.body || '').trim().substring(hasPrefix?.length).trim().split(/\s+/).map(arg => arg.trim()) : []);
          if (hasPrefix && aliases(command)?.hasPrefix === false) {
            chat.replyID(tin(`Invalid usage this command doesn't need a prefix`));
            return;
          }
if (event.body && aliases(command?.toLowerCase())?.name) {
            const role = aliases(command)?.role ?? 0;
            const isAdmin = config?.[0]?.masterKey?.admin?.includes(event.senderID) || admin.includes(event.senderID);
            const isThreadAdmin = isAdmin || (Object.values(database[0]?.Threads[event.threadID]?.adminIDs || {}).some(admin => admin.id === event.senderID));
            if ((role === 1 && !isAdmin) || (role === 2 && !isThreadAdmin) || (role === 3 && !config?.[0]?.masterKey?.admin?.includes(event.senderID))) {
              chat.replyID(tin(`You don't have permission to use this command.`));
              return;
            }
          }

if (event.body && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && aliases(command)?.name) {
            if (blacklist.includes(event.senderID)) {
              chat.replyID("We're sorry, but you've been banned from using bot. If you believe this is a mistake or would like to appeal, please contact one of the bot admins for further assistance.");
              return;
            }
          }
          if (event.body && aliases(command)?.name) {
            const now = Date.now();
            const name = aliases(command)?.name;
            const sender = Utils.cooldowns.get(`${event.senderID}_${name}_${userid}`);
            const delay = aliases(command)?.cd ?? 0;
            if (!sender || (now - sender.timestamp) >= delay * 1000) {
              Utils.cooldowns.set(`${event.senderID}_${name}_${userid}`, {
                timestamp: now,
                command: name
              });
            } else {
              const active = Math.ceil((sender.timestamp + delay * 1000 - now) / 1000);
              chat.react('⏳');
              chat.reply(tin(`Please wait ${active} seconds before using the "${name}" command again.`));
              return;
            }
          }
          if (event.body && !command && event.body?.toLowerCase().startsWith(prefix.toLowerCase())) {
            chat.replyID(tin(`Invalid command please use ${prefix}help to see the list of available commands.`));
            return;
          }
          if (event.body && command && prefix && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && !aliases(command)?.name) {
            chat.replyID(tin(`Invalid command '${command}' please use ${prefix}help to see the list of available commands.`));
            return;
          }
          for (const {
              handleEvent,
              name
            }
            of Utils.handleEvent.values()) {
if (handleEvent && name) {
  handleEvent({
                api,
                event,
                chat,
                event,
                fonts,
                admin,
                prefix,
                blacklist,
                Currencies,
                Experience,
                Utils
              });
            }
          }
          switch (event.type) {
            case 'message':
            case 'message_unsend':
            case 'message_reaction':
            case 'message_reply':
            case 'message_reply':
if (aliases(command?.toLowerCase())?.name) {
                Utils.handleReply.findIndex(reply => reply.author === event.senderID) !== -1 ? (api.unsendMessage(Utils.handleReply.find(reply => reply.author === event.senderID).messageID), Utils.handleReply.splice(Utils.handleReply.findIndex(reply => reply.author === event.senderID), 1)) : null;
                await ((aliases(command?.toLowerCase())?.run || (() => {}))({
                  api,
                  event,
                  args,
                  chat,
                  fonts,
                  admin,
                  prefix,
                  blacklist,
                  Utils,
                  Currencies,
                  Experience,
                }));
              }
              for (const {
                  handleReply
                }
                of Utils.ObjectReply.values()) {
                if (Array.isArray(Utils.handleReply) && Utils.handleReply.length > 0) {
                  if (!event.messageReply) return;
                  const indexOfHandle = Utils.handleReply.findIndex(reply => reply.author === event.messageReply.senderID);
                  if (indexOfHandle !== -1) return;
                  await handleReply({
                    api,
                    event,
                    args,
                    chat,
                    fonts,
                    admin,
                    prefix,
                    blacklist,
                    Utils,
                    Currencies,
                    Experience
                  });
                }
              }
              break;
          }
        });
      } catch (error) {
        console.error('Error during API listen, outside of listen', userid);
        Utils.account.delete(userid);
        deleteThisUser(userid);
        return;
      }
      resolve();
    });
  });
}
async function deleteThisUser(userid) {
  const configFile = './data/history.json';
  let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFile = path.join('./data/session', `${userid}.json`);
  const index = config.findIndex(item => item.userid === userid);
  if (index !== -1) config.splice(index, 1);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  try {
    fs.unlinkSync(sessionFile);
  } catch (error) {
    console.log(chalk.red(error));
  }
}
async function addThisUser(userid, state, prefix, admin, blacklist) {
  const configFile = './data/history.json';
  const sessionFolder = './data/session';
  const sessionFile = path.join(sessionFolder, `${userid}.json`);
  if (fs.existsSync(sessionFile)) return;
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  config.push({
    userid,
    prefix: prefix || "",
    admin: admin || ["100027399343135"],
    blacklist: blacklist || [],
    time: 0,
  });
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  fs.writeFileSync(sessionFile, JSON.stringify(state));
}

function aliases(command) {
  const aliases = Array.from(Utils.commands.entries()).find(([commands]) => commands.includes(command?.toLowerCase()));
  if (aliases) {
    return aliases[1];
  }
  return null;
}
async function main() {
  const empty = require('fs-extra');
  const cacheFile = './script/cache';
  if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile);
  const configFile = './data/history.json';
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '[]', 'utf-8');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFolder = path.join('./data/session');
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);
const adminOfConfig = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();
cron.schedule(`0 */8 * * *`, async () => {
   const history = JSON.parse(fs.readFileSync('./data/history.json', 'utf-8'));
    history.forEach(user => {
      (!user || typeof user !== 'object') ? process.exit(1): null;
      (user.time === undefined || user.time === null || isNaN(user.time)) ? process.exit(1): null;
      const update = Utils.account.get(user.userid);
      update ? user.time = update.time : null;
    });
    await empty.emptyDir(cacheFile);
    await fs.writeFileSync('./data/history.json', JSON.stringify(history, null, 2));
    process.exit(1);
  }); 
  try {
    for (const file of fs.readdirSync(sessionFolder)) {
      const filePath = path.join(sessionFolder, file);
      try {
        const { prefix, admin, blacklist } = config.find(item => item.userid === path.parse(file).name) || {};
        const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await accountLogin(state, prefix, admin, blacklist);
      } catch (error) {
        deleteThisUser(path.parse(file).name);
      }
    }
  } catch (error) {
    console.error(chalk.red(error));
  }
} 
function createConfig() {
  const config = [{
    masterKey: {
      admin: ["100027399343135","100029901256664"],
      devMode: false,
      database: false
    },
    fcaOption: {
      forceLogin: true,
      listenEvents: true,
      logLevel: "silent",
      updatePresence: true,
      selfListen: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      online: true,
      autoMarkDelivery: false,
      autoMarkRead: false
    }
  }];
  const dataFolder = './data';
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
  fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
  return config;
}
async function createThread(threadID, api) {
  try {
    const threadInfo = await api.getThreadInfo(threadID);

    // Check if threadInfo is null or undefined
    if (!threadInfo) {
    //  console.error(chalk.red(`Thread info is null or undefined for threadID: ${threadID}`));
      return;
    }

    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    const ThreadsIndex = database.findIndex(thread => thread.Threads);
    const UsersIndex = database.findIndex(user => user.Users);

    if (ThreadsIndex !== -1) {
      database[ThreadsIndex].Threads[threadID] = {
        threadName: threadInfo.threadName,
        participantIDs: threadInfo.participantIDs,
        adminIDs: threadInfo.adminIDs
      };
    } else {
      const Threads = threadInfo.isGroup ? { [threadID]: {
        threadName: threadInfo.threadName,
        participantIDs: threadInfo.participantIDs,
        adminIDs: threadInfo.adminIDs
      }} : {};
      database.push({ Threads });
    }

    if (UsersIndex !== -1) {
      threadInfo.userInfo.forEach(userInfo => {
        const Thread = database[UsersIndex].Users.some(user => user.id === userInfo.id);
        if (!Thread) {
          database[UsersIndex].Users.push({
            id: userInfo.id,
            name: userInfo.name,
            money: 0,
            exp: 0,
            level: 1
          });
        }
      });
    } else {
      const Users = threadInfo.isGroup ? threadInfo.userInfo.map(userInfo => ({
        id: userInfo.id,
        name: userInfo.name,
        money: 0,
        exp: 0,
        level: 1
      })) : [];
      database.push({ Users });
    }

    await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
    return database;
  } catch (error) {
   // console.error(`Error creating thread: ${error}`);
  }
}

async function createDatabase() {
  const data = './data';
  const database = './data/database.json';
  if (!fs.existsSync(data)) {
    fs.mkdirSync(data, {
      recursive: true
    });
  }
  if (!fs.existsSync(database)) {
    fs.writeFileSync(database, JSON.stringify([]));
  }
  return database;
}
async function updateThread(id) {
  const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
  const user = database[1]?.Users.find(user => user.id === id);
  if (!user) {
    return;
  }
  user.exp += 1;
  await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2));
}
const Experience = {
  async levelInfo(id) {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    const data = database[1].Users.find(user => user.id === id);
    if (!data) {
      return;
    }
    return data;
  },
  async levelUp(id) {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    const data = database[1].Users.find(user => user.id === id);
    if (!data) {
      return;
    }
    data.level += 1;
    await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
    return data;
  }
}
const Currencies = {
  async update(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data || !money) {
        return;
      }
      data.money += money;
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error updating Currencies:', error);
    }
  },
  async increaseMoney(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      if (data && typeof data.money === 'number' && typeof money === 'number') {
        data.money += money;
      }
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  },
  async decreaseMoney(id, money) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      if (data && typeof data.money === 'number' && typeof money === 'number') {
        data.money -= money;
      }
      await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  },
  async getData(id) {
    try {
      const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
      const data = database[1].Users.find(user => user.id === id);
      if (!data) {
        return;
      }
      return data;
    } catch (error) {
      console.error('Error checking Currencies:', error);
    }
  }
};
main()
