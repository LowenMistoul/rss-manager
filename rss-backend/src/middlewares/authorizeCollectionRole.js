const { Collection, CollectionMember, Article, Feed } = require("../models");

/**
 * Récupère la collectionId à partir de la requête
 * - collectionId direct (params/body/query)
 * - ou via articleId → feed → collection
 */
async function getCollectionId(req) {
  if (req.params.collectionId) return req.params.collectionId;
  if (req.body.collectionId) return req.body.collectionId;
  if (req.query.collectionId) return req.query.collectionId;

  if (req.params.articleId) {
    const article = await Article.findByPk(req.params.articleId);
    return article?.collectionId || null; // 👈 lecture directe
  }

  return null;
}


/**
 * Vérifie que l’utilisateur est membre de la collection
 */
function requireCollectionMember() {
  return async (req, res, next) => {
    try {
      const collectionId = await getCollectionId(req);
      if (!collectionId) {
        return res.status(400).json({ message: "collectionId introuvable" });
      }

      const membership = await CollectionMember.findOne({
        where: { collectionId, userId: req.user.id },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ message: "Accès refusé : vous n’êtes pas membre" });
      }

      req.membership = membership;
      next();
    } catch (err) {
      console.error("requireCollectionMember error", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

/**
 * Vérifie que l’utilisateur a un rôle précis dans la collection
 */
function requireCollectionRole(roles = []) {
  return async (req, res, next) => {
    try {
      const collectionId = await getCollectionId(req);
      if (!collectionId) {
        return res.status(400).json({ message: "collectionId introuvable" });
      }

      const membership = await CollectionMember.findOne({
        where: { collectionId, userId: req.user.id },
      });

      if (!membership) {
        return res.status(403).json({ message: "Accès refusé : non membre" });
      }

      if (
        roles.length > 0 &&
        !roles.includes(membership.role) &&
        membership.role !== "owner"
      ) {
        return res.status(403).json({ message: "Permission insuffisante" });
      }

      req.membership = membership;
      next();
    } catch (err) {
      console.error("requireCollectionRole error", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

/**
 * Vérifie que l’utilisateur est le propriétaire de la collection
 */
function requireCollectionOwner() {
  return requireCollectionRole(["owner"]);
}

module.exports = {
  requireCollectionMember,
  requireCollectionRole,
  requireCollectionOwner,
};
