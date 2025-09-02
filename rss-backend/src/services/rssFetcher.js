const Parser = require("rss-parser");
const { Feed, Article, Collection } = require("../models");
const parser = new Parser();

/**
 * Fonction qui récupère tous les flux actifs et les parcourt
 * pour récupérer les articles récents
 */
const fetchAllFeeds = async () => {
  try {
    // Récup. tous les feeds actifs
    const feeds = await Feed.findAll({ where: { status: "active" } });

    for (const feed of feeds) {
      console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
      console.log(`FEED ID ICI ${feed.id}`);
      try {
        // Vérifier que la collection existe
        const collection = await Collection.findByPk(feed.collectionId);
        if (!collection) continue;

        const rss = await parser.parseURL(feed.url);

        for (const item of rss.items) {
          // Vérif. si article existant
          const existing = await Article.findOne({
            where: { link: item.link, feedId: feed.id },
          });
          if (existing) continue;

          // 🚨 Skip si collectionId manquant
          if (!feed.collectionId) {
            console.warn(
              `Feed ${feed.id} n'a pas de collectionId, article ignoré`
            );
            continue;
          }

          try {
            await Article.create({
              title: item.title || "Sans titre",
              link: item.link,
              author: item.creator || item.author || "Inconnu",
              pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
              contentSnippet: item.contentSnippet || item.content || "",
              feedId: feed.id,
              collectionId: feed.collectionId, // 👈 obligatoire maintenant
            });
            console.log("✅ Article créé:", item.title);
          } catch (err) {
            console.error("❌ Erreur création article:", err.message);
          }
        }
      } catch (err) {
        console.error(
          `Erreur lors du fetch du flux ${feed.url}:`,
          err.message
        );
      }
    }

    console.log("✅ Fetch RSS terminé ");
  } catch (err) {
    console.error("Erreur lors de la récupération des feeds:", err);
  }
};

module.exports = { fetchAllFeeds };
