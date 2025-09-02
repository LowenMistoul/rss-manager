const { Feed, Collection, CollectionMember } = require('../models');
const { rescheduleFeed } = require('../services/rssScheduler');

// Créer un feed
exports.createFeed = async (req, res) => {
  try {
    const { title, url, description, categories, collectionId } = req.body;

    const feed = await Feed.create({
      title,
      url,
      description,
      categories,
      collectionId,
      userId: req.user.id, // 👈 nouvel attribut obligatoire
    });

    res.status(201).json(feed);
  } catch (err) {
    console.error("Erreur création feed:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Lister tous les feeds d'une collection
exports.getFeedsByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await Collection.findByPk(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    const feeds = await Feed.findAll({ where: { collectionId } });
    res.json(feeds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Voir un feed
exports.getFeedById = async (req, res) => {
  try {
    const feed = await Feed.findByPk(req.params.id);
    if (!feed) return res.status(404).json({ message: 'Feed non trouvé' });

    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    res.json(feed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un feed
exports.updateFeed = async (req, res) => {
    try {
      const feed = await Feed.findByPk(req.params.id);
      if (!feed) return res.status(404).json({ message: 'Feed non trouvé' });
  
      const collection = await Collection.findByPk(feed.collectionId);
      if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
  
      const { title, url, description, categories, updateFrequency, status } = req.body;
      if (title) feed.title = title;
      if (url) feed.url = url;
      if (description) feed.description = description;
      if (Array.isArray(categories)) feed.categories = categories;
      if (updateFrequency) feed.updateFrequency = updateFrequency;
      if (status) feed.status = status;
  
      await feed.save();
  
      await rescheduleFeed(feed.id);
  
      res.json(feed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

// Supprimer un feed
exports.deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findByPk(req.params.id);
    if (!feed) return res.status(404).json({ message: 'Feed non trouvé' });

    const collection = await Collection.findByPk(feed.collectionId);
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    await feed.destroy();
    res.json({ message: 'Feed supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyFeeds = async (req, res) => {
  try {
    const userId = req.user.id;

    const feeds = await Feed.findAll({
      where: { userId },
      include: [{ model: Collection, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(feeds);
  } catch (err) {
    console.error("Erreur getMyFeeds:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};