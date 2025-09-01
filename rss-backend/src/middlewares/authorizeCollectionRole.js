// src/middlewares/authorizeCollectionRole.js
const { Collection, CollectionMember } = require('../models');

//récupère l'id de collection 
function getCollectionId(req) {
  return (
    req.params.collectionId ||
    req.params.id ||
    req.body.collectionId ||
    req.query.collectionId
  );
}


 //Vérifie si l'utilisateur est le propriétaire (owner) d'une collection.
function isOwner(collection, userId) {
  return String(collection.creatorId || collection.creator_id) === String(userId);
}


 //Vérifie si un user est membre de la collection et retourne son membership
async function findMembership(collectionId, userId) {
  return await CollectionMember.findOne({ where: { collectionId, userId } });
}

/**
 * Middleware: utilisateur doit être membre (ou propriétaire).
 */
function requireCollectionMember() {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
      const collectionId = getCollectionId(req);
      if (!collectionId) return res.status(400).json({ message: 'collectionId requis' });

      const collection = await Collection.findByPk(collectionId);
      if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

      const membership = await findMembership(collectionId, req.user.id);

      if (!membership && !isOwner(collection, req.user.id)) {
        return res.status(403).json({ message: 'Accès refusé : non membre de la collection' });
      }

      req.collection = collection;
      req.membership = membership;
      req.isOwner = isOwner(collection, req.user.id);
      return next();
    } catch (err) {
      console.error('requireCollectionMember error', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };
}

/**
 * Middleware: utilisateur doit avoir un rôle précis.
 * - Owner est toujours autorisé par défaut (sauf option allowOwner=false)
 */
function requireCollectionRole(allowedRoles = [], options = { allowOwner: true }) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
      const collectionId = getCollectionId(req);
      if (!collectionId) return res.status(400).json({ message: 'collectionId requis' });

      const collection = await Collection.findByPk(collectionId);
      if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

      const membership = await findMembership(collectionId, req.user.id);
      const owner = isOwner(collection, req.user.id);

      // Le propriétaire est autorisé automatiquement sauf si on force allowOwner=false
      if (owner && options.allowOwner !== false) {
        req.collection = collection;
        req.membership = membership;
        req.isOwner = true;
        return next();
      }

      if (!membership) {
        return res.status(403).json({ message: 'Accès refusé : non membre de la collection' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
      }

      req.collection = collection;
      req.membership = membership;
      req.isOwner = false;
      return next();
    } catch (err) {
      console.error('requireCollectionRole error', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };
}

/**
 * Middleware: utilisateur doit être le propriétaire
 */
function requireCollectionOwner() {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
      const collectionId = getCollectionId(req);
      if (!collectionId) return res.status(400).json({ message: 'collectionId requis' });

      const collection = await Collection.findByPk(collectionId);
      if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

      if (!isOwner(collection, req.user.id)) {
        return res.status(403).json({ message: 'Accès refusé : propriétaire requis' });
      }

      req.collection = collection;
      req.isOwner = true;
      return next();
    } catch (err) {
      console.error('requireCollectionOwner error', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };
}

module.exports = {
  requireCollectionMember,
  requireCollectionRole,
  requireCollectionOwner,
};
