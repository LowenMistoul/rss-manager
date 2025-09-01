const { Message } = require('../models');
const { Op } = require('sequelize');

// POST /api/collections/:collectionId/messages
exports.createMessage = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Contenu requis' });

    const msg = await Message.create({
      collectionId,
      userId: req.user.id,
      content: content.trim()
    });

    // Emettre en temps réel 
    req.io?.to(`collection:${collectionId}`).emit('message:new', {
      id: msg.id,
      content: msg.content,
      userId: msg.userId,
      collectionId: msg.collectionId,
      createdAt: msg.createdAt
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/collections/:collectionId/messages
exports.listMessages = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const before = req.query.before; // ISO date (simple) ou id si tu veux

    const where = { collectionId, isDeleted: false };
    if (before) where.createdAt = { [Op.lt]: new Date(before) };

    const messages = await Message.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json(messages.reverse()); // du plus ancien au plus récent
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/collections/:collectionId/messages/:id
exports.updateMessage = async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    const { content } = req.body;

    const msg = await Message.findOne({ where: { id, collectionId } });
    if (!msg) return res.status(404).json({ message: 'Message introuvable' });

    // author peut éditer; admin/owner géré par middleware en amont selon ta route
    if (String(msg.userId) !== String(req.user.id) && !req.isModerator) {
      return res.status(403).json({ message: 'Interdit' });
    }

    msg.content = content?.trim() || msg.content;
    msg.editedAt = new Date();
    await msg.save();

    req.io?.to(`collection:${collectionId}`).emit('message:updated', { id: msg.id, content: msg.content, editedAt: msg.editedAt });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/collections/:collectionId/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    const msg = await Message.findOne({ where: { id, collectionId } });
    if (!msg) return res.status(404).json({ message: 'Message introuvable' });

    if (String(msg.userId) !== String(req.user.id) && !req.isModerator) {
      return res.status(403).json({ message: 'Interdit' });
    }

    msg.isDeleted = true;
    msg.deletedAt = new Date();
    await msg.save();

    req.io?.to(`collection:${collectionId}`).emit('message:deleted', { id: msg.id });
    res.json({ message: 'Supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
