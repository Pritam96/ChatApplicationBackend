const Message = require("../models/Message");
const ArchivedMessage = require("../models/ArchivedMessage");

const archiveMessages = async () => {
  try {
    const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const mapCount = new Map();

    const messages = await Message.find();
    messages.forEach((message) => {
      const chatId = message.chat._id.toString();
      if (mapCount.has(chatId)) {
        mapCount.set(chatId, mapCount.get(chatId) + 1);
      } else {
        mapCount.set(chatId, 1);
      }
    });

    for (let [key, value] of mapCount) {
      if (value > 50) {
        // messages which are older than 7 days
        // skips latest 20 messages
        let messagesToArchive = await Message.find({
          chat: key,
          createdAt: { $lt: sevenDayAgo },
        })
          .sort({ createdAt: -1 })
          .skip(20);

        // Archive messages
        for (const message of messagesToArchive) {
          // Move messages to the ArchivedMessage collection
          const archivedMessage = await ArchivedMessage.create({
            sender: message.sender,
            content: message.content,
            fileUrl: message.fileUrl,
            chat: message.chat,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
          });

          // Delete message from Message collection, which is already archived
          await Message.findByIdAndDelete(message._id);
        }

        console.log("message archive process done successfully");
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = archiveMessages;
