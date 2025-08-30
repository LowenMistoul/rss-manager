// src/middleware/authorize.js
const { CollectionMember } = require('../models');

const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // injecté par middleware auth
      const collectionId = req.params.collectionId;

      // Vérifier que l'utilisateur est bien membre de la collection
      const membership = await CollectionMember.findOne({
        where: { userId, collectionId }
      });

      if (!membership) {
        return res.status(403).json({ message: 'Accès refusé : non membre' });
      }

      // Vérifier que son rôle fait partie des rôles autorisés
      if (!roles.includes(membership.role)) {
        return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
      }

      // Attacher le rôle au req pour usage ultérieur
      req.membership = membership;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  };
};

module.exports = authorizeRole;
