const axios = require('axios');
const cron = require('node-cron');

let fontEnabled = true;

function formatFont(text) { 
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

module.exports = async ({ api, fonts }) => {
    const mono = txt => fonts.monospace(txt);
  /*const messagedThreads = new Set();

  async function createPost(body, threadID) {
    try {
      await api.sendMessage({ body }, threadID);
      messagedThreads.add(threadID);
    } catch (error) {
      console.error("Error sending a message:", error);
    }
  }*/

    async function motivation() {
        try {
            console.log('Posting Motivational quotes...');
            const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
            const quotes = response.data;

            const randomIndex = Math.floor(Math.random() * quotes.length);
            const randomQuote = quotes[randomIndex];

            const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Markdevs69"}`;
            api.createPost(formatFont(quote)).catch(() => {});
        } catch (error) {
            console.error('Error fetching or posting the motivational quote:', error);
        }
    }

//cron.schedule('0 */1 * * *', motivation, {
  cron.schedule('*/59 * * * *', motivation, {
    scheduled: true,
    timezone: "Asia/Manila"
  });
}
