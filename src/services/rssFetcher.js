const Parser = require('rss-parser');
const { Feed, Article, Collection } = require('../models');
const parser = new Parser();

/**
 * Fonction qui récupère tous les flux actifs et les parcourt
 * pour récupérer les articles récents
 */
const fetchAllFeeds = async () => {
  try {
    // Récup. tous les feeds actifs
    const feeds = await Feed.findAll({ where: { status: 'active' } });

    for (const feed of feeds) {
      try {
        const collection = await Collection.findByPk(feed.collectionId);
        if (!collection) continue;

        const rss = await parser.parseURL(feed.url);

        for (const item of rss.items) {
          // Vérif. si article existant
          const existing = await Article.findOne({ where: { link: item.link, feedId: feed.id } });
          if (existing) continue;

          // Créer un nouvel article
          await Article.create({
            title: item.title || 'Sans titre',
            link: item.link,
            author: item.creator || item.author || 'Inconnu',
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            contentSnippet: item.contentSnippet || item.content || '',
            feedId: feed.id
          });
        }

      } catch (err) {
        console.error(`Erreur lors du fetch du flux ${feed.url}:`, err.message);
      }
    }

    console.log('Fetch RSS terminé ');

  } catch (err) {
    console.error('Erreur lors de la récupération des feeds:', err);
  }
};

module.exports = { fetchAllFeeds };
