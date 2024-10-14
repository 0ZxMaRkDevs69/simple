const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const SoundCloud = require('soundcloud-scraper');

const apiKeyPath = path.join(__dirname, 'system', 'apikey.txt');

module.exports.config = {
  name: "music",
  version: "1.0.0",
  info: "Search music from SoundCloud and send it as attachment.",
  credits: "Kenneth Panio",
  role: 0,
  aliases: ['play', 'sing', 'song', 'kanta', 'spotify','sc','lyrics'],
  usage: '[title]',
};

async function getApiKey() {
  try {
    if (fs.existsSync(apiKeyPath)) {
      const apiKey = await fs.readFile(apiKeyPath, 'utf8');
      return apiKey.trim();
    } else {
      const newKey = await SoundCloud.keygen();
      await fs.ensureDir(path.dirname(apiKeyPath));
      await fs.writeFile(apiKeyPath, newKey);
      return newKey;
    }
  } catch (error) {
    throw error;
  }
}

async function setNewApiKey() {
  try {
    const newKey = await SoundCloud.keygen();
    await fs.writeFile(apiKeyPath, newKey);
    return newKey;
  } catch (error) {
    throw error;
  }
}

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 7.1.1; SM-G935F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1",
  "Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1",
  "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; GT-I9505 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; U; Android 5.1.1; en-us; SM-G928T Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile Safari/537.36"
];

async function getLyrics(track) {
  try {
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(track)}`, {
      headers: {
        'User-Agent': randomUserAgent,
      },
    });

    return res.data.lyrics;
  } catch (error) {
    throw error;
  }
}

module.exports.run = async ({ api, event, args, chat, fonts }) => {
  const mono = txt => fonts.thin(txt);
  const musicName = args.join(' ');

  if (!musicName) {
    chat.reply(mono(`Please provide the title of the music!`));
    return;
  }

  const searchAndSendMusic = async (apiKey) => {
    const client = new SoundCloud.Client(apiKey);
    const searching = await chat.reply(mono(`🔍 | Searching for "${musicName}"...`));

    try {
      const searchResults = await client.search(musicName, 'track');

      if (!searchResults.length || !searchResults[0]) {
        return chat.reply(mono("Can't find the music you're looking for."));
      }

      const song = searchResults[0];
      const songInfo = await client.getSongInfo(song.url);
      const stream = await songInfo.downloadProgressive();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(__dirname, 'cache', `${timestamp}_music.mp3`);

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('end', async () => {
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return chat.reply(mono('The file could not be sent because it is larger than 25MB.'));
        }

        const message = {
          body: `${songInfo.title} | by - ${songInfo.author.name}`,
          attachment: fs.createReadStream(filePath)
        };

        const icon = await axios.get(songInfo.thumbnail, { responseType: "stream" });
        const thumb = { attachment: icon.data };

        await chat.reply(thumb);
        const lyrics = await getLyrics(musicName);
        if (lyrics) {
          await chat.reply(mono(lyrics));
        } else {
          console.log("Lyrics not found for this song.");
        }
        searching.unsend();

        await chat.reply(message);
        fs.unlinkSync(filePath);

      });
    } catch (error) {
      if (error.message.includes('Invalid ClientID')) {
        const newApiKey = await setNewApiKey();
        await searchAndSendMusic(newApiKey);
      } else {
        throw error;
      }
    }
  };

  try {
    const apiKey = await getApiKey();
    await searchAndSendMusic(apiKey);
  } catch (error) {
    chat.reply(mono(error.message));
  }
};