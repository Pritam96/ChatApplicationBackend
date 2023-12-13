const asyncHandler = require("../middleware/async");
const Message = require("../models/Message");
const ArchivedMessage = require("../models/ArchivedMessage");

// Controller function to get and archive messages older than 7 days
exports.archiveMessages = asyncHandler(async (req, res, next) => {
  // Calculate the date 7 days ago
  const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Use a map to count the number of messages per chat
  const mapCount = new Map();

  // Retrieve all messages from the Message model
  const messages = await Message.find();

  // Count messages per chat
  messages.forEach((message) => {
    const chatId = message.chat._id.toString();
    if (mapCount.has(chatId)) {
      mapCount.set(chatId, mapCount.get(chatId) + 1);
    } else {
      mapCount.set(chatId, 1);
    }
  });

  // Iterate through the map to check and archive messages per chat
  for (let [key, value] of mapCount) {
    if (value > 50) {
      // Retrieve messages older than 7 days, skipping the latest 20 messages
      let messagesToArchive = await Message.find({
        chat: key,
        createdAt: { $lt: sevenDayAgo },
      })
        .sort({ createdAt: -1 })
        .skip(20);

      // Archive messages
      for (const message of messagesToArchive) {
        // Create an ArchivedMessage document
        const archivedMessage = await ArchivedMessage.create({
          sender: message.sender,
          content: message.content,
          fileUrl: message.fileUrl,
          chat: message.chat,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        });

        // Delete the message from the Message collection since it's already archived
        await Message.findByIdAndDelete(message._id);
      }
    }
  }

  // Retrieve all archived messages
  const archived = await ArchivedMessage.find();

  // Send a JSON response with the count and data of archived messages
  res.json({
    success: true,
    count: archived.length,
    data: archived,
  });
});
