const cron = require('node-cron');
const axios = require('axios');
//const FormData = require('form-data');

module.exports = ({
    api, fonts
}) => {
    const mono = txt => fonts.monospace(txt);

    const greetings = {
        morning: [
            "Good morning! Have a great day!",
            "Rise and shine! Good morning!",
            "Morning! Hope you have an amazing day!",
            "Gising na kayo umaga na!",
        ],
        afternoon: [
            "Good afternoon! Keep up the great work!",
            "Afternoon! Hope you're having a wonderful day!",
            "Hello! Wishing you a pleasant afternoon!",
            "Time to eat something!",
            "Maayong udto mga ril nigas pangaon namo!",
        ],
        evening: [
            "Good evening! Relax and enjoy your evening!",
            "Evening! Hope you had a productive day!",
            "Hello! Have a peaceful and enjoyable evening!",
        ],
        night: [
            "Good night! Rest well!",
            "Night! Sweet dreams!",
            "Hello! Wishing you a restful night!",
            "Tulog na kayo!",
        ]
    };

    async function restart(timeOfDay) {
        process.exit(0);
    }

    function greetRandom(timeOfDay) {
        const greetingsList = greetings[timeOfDay];
        return greetingsList[Math.floor(Math.random() * greetingsList.length)];
    }

    async function greetThreads(timeOfDay) {
        try {
            console.log(`Sending ${timeOfDay} greetings...`);
            const msgTxt = greetRandom(timeOfDay);
            const threads = await api.getThreadList(10, null, ['INBOX']);

            if (!threads || threads.length === 0) {
                console.log('No threads found.');
                return;
            }

            for (const thread of threads) {
                if (thread.isGroup) {
                    await api.sendMessage(mono(msgTxt), thread.threadID);
                }
            }
        } catch (error) {
            console.error(`Error sending ${timeOfDay} greeting:`, error);
        }
    }

    async function clearChat() {
        try {
            console.log('Clearing chat...');
            const threads = await api.getThreadList(25, null, ['INBOX']);
            if (!threads || threads.length === 0) {
                console.log('No threads to clear.');
                return;
            }
            for (const thread of threads) {
                if (!thread.isGroup) {
                    await api.deleteThread(thread.threadID);
                }
            }
        } catch (error) {
            console.error('Error deleting threads:', error);
        }
    }

    async function acceptPending() {
        try {
            console.log('Accepting pending messages...');
            const pendingThreads = await api.getThreadList(25, null, ['PENDING']);
            if (!pendingThreads || pendingThreads.length === 0) {
                console.log('No pending threads to accept.');
                return;
            }

            for (const thread of pendingThreads) {
                await api.sendMessage(mono('📨 This thread is automatically approved by our system.'), thread.threadID);
            }
        } catch (error) {
            console.error('Error accepting pending messages:', error);
        }
    }

    async function motivation() {
        try {
            console.log('Posting Motivational quotes...');
            const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
            const quotes = response.data;

            const randomIndex = Math.floor(Math.random() * quotes.length);
            const randomQuote = quotes[randomIndex];

            const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Kenneth Panio"}`;
            api.createPost(mono(quote)).catch(() => {});
        } catch (error) {
            console.error('Error fetching or posting the motivational quote:', error);
        }
    }

    // Scheduling cron jobs
    const scheduleCronJobs = (hours, timeOfDay) => {
        if (!Array.isArray(hours)) {
            console.error(`Error: Invalid hours array for ${timeOfDay}:`, hours);
            return;
        }
        hours.forEach(hour => {
            cron.schedule(`0 ${hour} * * *`, () => {
                console.log(`Scheduled ${timeOfDay} greetings at hour ${hour}`);
                greetThreads(timeOfDay);
            }, {
                scheduled: true,
                timezone: 'Asia/Manila'
            });
        });
    };

    scheduleCronJobs([5, 6, 7], 'morning');
    scheduleCronJobs([12, 13], 'afternoon');
    scheduleCronJobs([18, 19, 20, 21], 'evening');
    scheduleCronJobs([22, 23], 'night');

    cron.schedule('*/59 * * * *', restart, {
        schedule: false,
        timezone: 'Asia/Manila'
    });

    cron.schedule('*/59 * * * *', clearChat, {
        scheduled: false,
        timezone: 'Asia/Manila'
    });

    cron.schedule('*/50 * * * *', acceptPending, {
        scheduled: false,
        timezone: 'Asia/Manila'
    });

    cron.schedule('*/59 * * * *', motivation, {
        scheduled: true,
        timezone: 'Asia/Manila'
    });
};