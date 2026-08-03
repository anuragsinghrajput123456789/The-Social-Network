const Message = require("../models/chatModel");
const userModel = require("../models/userModels");

class ChatService {
  async getChatMessages(currentUserId, otherUserId, page = 1, limit = 30) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 30;
    const skip = (pageNum - 1) * limitNum;

    // Filter out messages deleted for currentUserId
    const filter = {
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ],
      deletedFor: { $ne: currentUserId }
    };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: "sharedPost",
        model: "post"
      })
      .lean();

    const totalCount = await Message.countDocuments(filter);

    // Auto mark messages received from otherUserId as seen
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, status: { $ne: "seen" } },
      { status: "seen" }
    );

    return {
      success: true,
      messages: messages.reverse(),
      hasMore: skip + messages.length < totalCount
    };
  }

  async getChatList(currentUserId) {
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      deletedFor: { $ne: currentUserId }
    })
      .sort({ createdAt: -1 })
      .select("_id senderId receiverId message image sharedPost status createdAt date")
      .lean();

    const partnerIdsSet = new Set();
    messages.forEach((m) => {
      if (m.senderId !== currentUserId) partnerIdsSet.add(m.senderId);
      if (m.receiverId !== currentUserId) partnerIdsSet.add(m.receiverId);
    });

    const partnerIds = Array.from(partnerIdsSet);

    const partnerUsers = await userModel
      .find({ _id: { $in: partnerIds } })
      .select("_id username name lastSeen")
      .lean();

    const partnerMap = new Map(partnerUsers.map((u) => [u._id.toString(), u]));

    let activePartners = partnerIds.map((id) => {
      const u = partnerMap.get(id.toString());
      if (!u) return null;

      const lastMsg = messages.find(
        (m) =>
          (m.senderId === currentUserId && m.receiverId === id) ||
          (m.senderId === id && m.receiverId === currentUserId)
      );

      const unreadCount = messages.filter(
        (m) => m.senderId === id && m.receiverId === currentUserId && m.status !== "seen"
      ).length;

      return {
        _id: u._id,
        username: u.username,
        name: u.name,
        lastSeen: u.lastSeen,
        lastMessage: lastMsg ? (lastMsg.image ? "📷 Photo" : lastMsg.message || "Shared a post") : "",
        lastMessageDate: lastMsg ? lastMsg.createdAt || lastMsg.date : null,
        unreadCount
      };
    });

    activePartners = activePartners.filter(Boolean);

    // Connection shortcuts (followers and following to initiate a new message)
    const currentUser = await userModel.findById(currentUserId).lean();
    const connectionIdsSet = new Set();
    if (currentUser && currentUser.followers) {
      currentUser.followers.forEach((f) => connectionIdsSet.add(f.userId));
    }
    if (currentUser && currentUser.following) {
      currentUser.following.forEach((f) => connectionIdsSet.add(f.userId));
    }

    const connectionIds = Array.from(connectionIdsSet);
    const connectionUsers = await userModel
      .find({ _id: { $in: connectionIds } })
      .select("_id username name lastSeen")
      .lean();

    return {
      success: true,
      activeChats: activePartners.sort(
        (a, b) => new Date(b.lastMessageDate || 0) - new Date(a.lastMessageDate || 0)
      ),
      connections: connectionUsers.map((u) => ({
        _id: u._id,
        username: u.username,
        name: u.name,
        lastSeen: u.lastSeen
      }))
    };
  }

  async sendMessage(currentUserId, receiverId, messageText, imageFileName = null, sharedPostId = null, replyTo = null) {
    if (!receiverId) {
      return { success: false, msg: "Receiver ID is required" };
    }
    if (!messageText && !imageFileName && !sharedPostId) {
      return { success: false, msg: "Message content cannot be empty" };
    }

    const newMessage = await Message.create({
      senderId: currentUserId,
      receiverId,
      message: messageText || "",
      image: imageFileName || null,
      sharedPost: sharedPostId || null,
      replyTo: replyTo || null,
      status: "sent"
    });

    const populatedMsg = await Message.findById(newMessage._id)
      .populate({ path: "sharedPost", model: "post" })
      .lean();

    return {
      success: true,
      msg: "Message sent successfully",
      data: populatedMsg
    };
  }

  async searchMessages(currentUserId, otherUserId, query) {
    if (!query || !query.trim()) {
      return { success: true, messages: [] };
    }

    const regex = new RegExp(query.trim(), "i");
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ],
      message: regex,
      deletedFor: { $ne: currentUserId }
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      messages
    };
  }
}

module.exports = new ChatService();
