const { Article, ArticleComment, Feed, Collection } = require('../models');
const { Op } = require('sequelize');

// POST /api/articles/:articleId/comments
exports.createComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Contenu requis' });
    const article = await Article.findByPk(articleId);
    if (!article) return res.status(404).json({ message: 'Article introuvable' });
    const feed = await Feed.findByPk(article.feedId);
    const collection = await Collection.findByPk(feed.collectionId);
    if (String(collection.creatorId) !== String(req.user.id) && !req.membership) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const comment = await ArticleComment.create({
      collectionId: collection.id,
      articleId,
      userId: req.user.id,
      content: content.trim(),
      parentId: parentId || null
    });

    req.io?.to(`collection:${collection.id}`).emit('comment:new', {
      id: comment.id, articleId, content: comment.content, userId: req.user.id, createdAt: comment.createdAt
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/articles/:articleId/comments?parentId=null&limit=20&before=<ISO>
exports.listComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { parentId, before } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const where = { articleId, isDeleted: false };
    if (parentId === 'null') where.parentId = null;
    else if (parentId) where.parentId = parentId;
    if (before) where.createdAt = { [Op.lt]: new Date(before) };

    const comments = await ArticleComment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json(comments.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/articles/:articleId/comments/:id
exports.updateComment = async (req, res) => {
  try {
    const { articleId, id } = req.params;
    const { content } = req.body;

    const comment = await ArticleComment.findOne({ where: { id, articleId } });
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' });

    if (String(comment.userId) !== String(req.user.id) && !req.isModerator) {
      return res.status(403).json({ message: 'Interdit' });
    }

    comment.content = content?.trim() || comment.content;
    comment.editedAt = new Date();
    await comment.save();

    req.io?.to(`collection:${comment.collectionId}`).emit('comment:updated', { id: comment.id, content: comment.content, editedAt: comment.editedAt });
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE (soft) /api/articles/:articleId/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const { articleId, id } = req.params;

    const comment = await ArticleComment.findOne({ where: { id, articleId } });
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' });

    if (String(comment.userId) !== String(req.user.id) && !req.isModerator) {
      return res.status(403).json({ message: 'Interdit' });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    req.io?.to(`collection:${comment.collectionId}`).emit('comment:deleted', { id: comment.id });
    res.json({ message: 'Supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
