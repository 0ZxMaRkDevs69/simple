module.exports["config"] = {
  name: 'pending',
  version: '1.0.0',
  credits: 'Kenneth Panio',
  role: 2,
  info: 'List pending threads bot participated',
  type: 'thread',
  cd: 0
};

module.exports["run"] = async ({ chat, event, args, fonts, api }) => {
  const getUserName = async (uid) => await chat.userName(uid);
  const pendingThreads = await api.getThreadList(25, null, ['PENDING']);

  if (pendingThreads.length === 0) {
          chat.reply(fonts.thin("There are no pending threads."));
          return;
  }

  if (args.length === 0) {
          const pendingListPromises = pendingThreads.map(async (thread, index) => {
                  const threadName = thread.name || await getUserName(thread.threadID);
                  return `${index + 1}. ${threadName} (${thread.threadID})`;
          });

          const pendingList = await Promise.all(pendingListPromises);
          chat.reply(fonts.thin(`Pending threads:\n${pendingList.join('\n')}\nUse 'approve <number>' to approve or 'reject <number>' to reject.`));
  } else {
          const action = args[0].toLowerCase();
          const index = parseInt(args[1], 10) - 1;

          if (action === "approve" || action === "reject") {
                  if (!isNaN(index) && index >= 0 && index < pendingThreads.length) {
                          const thread = pendingThreads[index];
                          const threadName = thread.name || await getUserName(thread.threadID);

                          if (action === "approve") {
                                  await api.sendMessage(fonts.thin("This Thread has been approved by admin"), thread.threadID);
                                  chat.reply(fonts.thin(`Approved thread ${threadName} (${thread.threadID})`));
                          } else if (action === "reject") {
                                  if (thread.isGroup && thread.name !== thread.threadID) {
                                          await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
                                          chat.reply(fonts.thin(`Left group ${threadName} (${thread.threadID})`));
                                  } else if (!thread.isGroup && thread.name !== thread.threadID) {
                                          const userName = await getUserName(thread.threadID);
                                          await chat.block(thread.threadID);
                                          chat.reply(fonts.thin(`Blocked user ${userName} (${thread.threadID})`));
                                  } else {
                                          chat.reply(fonts.thin(`Invalid pending thread type.`));
                                  }
                          }
                  } else {
                          chat.reply(fonts.thin(`Invalid pending thread index.`));
                  }
          } else {
                  chat.reply(fonts.thin(`Invalid action. Please use 'approve' or 'reject'.`));
          }
  }
};