const { Article, Feed, Collection } = require('../models');

// Créer un article (manuellement pour test)
exports.createArticle = async (req, res) => {
  try {
    const { title, link, author, pubDate, contentSnippet, feedId } = req.body;
    if (!title || !link || !feedId) 
      return res.status(400).json({ message: 'Title, link et feedId sont requis' });

    // Vérifier que le feed appartient bien à l'utilisateur
    const feed = await Feed.findByPk(feedId);
    if (!feed) return res.status(404).json({ message: 'Feed non trouvé' });

    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) 
      return res.status(403).json({ message: 'Accès refusé' });

    const article = await Article.create({
      title, link, author, pubDate, contentSnippet, feedId
    });

    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Lister tous les articles d'un feed
exports.getArticlesByFeed = async (req, res) => {
  try {
    const { feedId } = req.params;
    const feed = await Feed.findByPk(feedId);
    if (!feed) return res.status(404).json({ message: 'Feed non trouvé' });

    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) 
      return res.status(403).json({ message: 'Accès refusé' });

    const articles = await Article.findAll({ where: { feedId } });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Voir un article
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const feed = await Feed.findByPk(article.feedId);
    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) 
      return res.status(403).json({ message: 'Accès refusé' });

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un article (ex: marquer lu ou favori)
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const feed = await Feed.findByPk(article.feedId);
    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) 
      return res.status(403).json({ message: 'Accès refusé' });

    const { title, link, author, pubDate, contentSnippet, isRead, isFavorite } = req.body;
    if (title) article.title = title;
    if (link) article.link = link;
    if (author) article.author = author;
    if (pubDate) article.pubDate = pubDate;
    if (contentSnippet) article.contentSnippet = contentSnippet;
    if (isRead !== undefined) article.isRead = isRead;
    if (isFavorite !== undefined) article.isFavorite = isFavorite;

    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const feed = await Feed.findByPk(article.feedId);
    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) 
      return res.status(403).json({ message: 'Accès refusé' });

    await article.destroy();
    res.json({ message: 'Article supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
