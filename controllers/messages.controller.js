import Message from '../models/message.model.js';
import Grade from '../models/grade.model.js';

// Fetch recent messages for a chat group with simple pagination
export const getMessages = async (req, res) => {
  try {
    const { chat_group_id, limit = 50, before } = req.query;

    if (!chat_group_id) {
      return res.status(400).json({
        status: 'error',
        message: 'chat_group_id is required.',
      });
    }

    // Optional: make sure chat_group_id exists and belongs to some grade
    const grade = await Grade.findOne({ where: { chat_group_id } });
    if (!grade) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid chat group.',
      });
    }

    const where = { chat_group_id };
    if (before) {
      where.sentAt = { lt: new Date(before) };
    }

    const messages = await Message.findAll({
      where,
      order: [['sentAt', 'DESC']],
      limit: Number(limit) > 0 ? Number(limit) : 50,
    });

    const userId = req.user.id;

    // Filter out messages hidden from this user
    const visibleMessages = messages
      .map((m) => m.toJSON())
      .filter((m) => !Array.isArray(m.hidefrom) || !m.hidefrom.includes(userId));

    return res.status(200).json({
      status: 'success',
      data: visibleMessages,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages. Error: ' + error.message,
    });
  }
};


