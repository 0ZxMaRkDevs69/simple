const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports["config"] = {
    name: "gemini",
    version: "1.0.0",
    credits: "Kenneth Panio",
    role: 0,
    type: "artificial-intelligence",
    info: "Interact with Gemini AI.",
    usage: "[prompt or reply to a photo, audio, or video]",
    guide: "gemini How does nuclear fusion work?",
    cd: 6
};

module.exports["run"] = async ({ chat, args, event, fonts }) => {
  //  const { key } = global.api.workers.google;
    const genAI = new GoogleGenerativeAI("AIzaSyDaYSM9BJCDc7wjpbMSs2HAqfgKwPeHDoI");// you can replace the key inside with string contains google api key
    const modelName = "gemini-1.5-flash";
    // other models: gemini-1.5-pro, gemini-1.0-pro, aqa
    const cacheFolderPath = path.join(__dirname, "cache");

    //const mono = txt => fonts.monospace(txt);

    let query = args.join(" ");
    let inlineData = null;
    let mimeType = null;

    // Handle image, audio, and video replies
    if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        const content = attachment.url;

        try {
            if (!fs.existsSync(cacheFolderPath)) {
                fs.mkdirSync(cacheFolderPath);
            }

            // Fetch content to determine its type
            const response = await axios.get(content, { responseType: 'arraybuffer', maxRedirects: 0 });
            mimeType = response.headers['content-type'];
            const uniqueFileName = `file_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
            const fileExtension = mimeType.split('/')[1]; // Example: "jpeg", "mp3", "mp4"
            const filePath = path.join(cacheFolderPath, `${uniqueFileName}.${fileExtension}`);

            // Save the file
            fs.writeFileSync(filePath, response.data);

            const fileBuffer = fs.readFileSync(filePath);
            inlineData = {
                data: fileBuffer.toString("base64"),
                mimeType
            };

            fs.unlinkSync(filePath);

            // Set query based on MIME type
            if (mimeType.startsWith('image/')) {
                query = args.join(" ") || "What is in this image?";
            } else if (mimeType.startsWith('audio/')) {
                query = args.join(" ") || "What is in this audio?";
            } else if (mimeType.startsWith('video/')) {
                query = args.join(" ") || "What is in this video?";
            } else {
                chat.reply(mono("Unsupported attachment type!"));
                return;
            }
        } catch (error) {
            chat.reply(mono("Failed to download the file: " + error.message));
            return;
        }
    }

    if (!query) {
        chat.reply(fonts.thin("Please provide a question or reply to a attachment!"));
        return;
    }

    const answering = await chat.reply(fonts.thin("🕐 | Answering..."));

    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Create the request payload based on the presence of inlineData
        const payload = inlineData ? [query, { inlineData }] : [query];

        const result = await model.generateContent(payload);
        const answer = result.response.text();

        const codeBlocks = answer.match(/```[\s\S]*?```/g) || [];
        const line = "\n" + '━'.repeat(18) + "\n";

        const formattedAnswer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => fonts.bold(text));
        const message = fonts.bold(" 📸 | GEMINI FLASH 1.5") + line + formattedAnswer + line;

        await answering.edit(message);

        if (codeBlocks.length > 0) {
            const allCode = codeBlocks.map(block => block.replace(/```/g, '').trim()).join('\n\n\n');
            const uniqueFileName = `code_snippet_${Date.now()}_${Math.floor(Math.random() * 1e6)}.txt`;
            const filePath = path.join(cacheFolderPath, uniqueFileName);

            fs.writeFileSync(filePath, allCode, 'utf8');

            const fileStream = fs.createReadStream(filePath);
            await chat.reply({ attachment: fileStream });

            fs.unlinkSync(filePath);
        }
    } catch (error) {
        await answering.edit(fonts.thin("No response from Gemini AI. Please try again later: " + error.message));
    }
};