const { CollectionMember } = require('../models');
module.exports = function requireCollectionRole(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const collectionId = req.params.id || req.body.collectionId || req.query.collectionId;
      if (!collectionId) return res.status(400).json({ message: 'collectionId requis' });

      const mem = await CollectionMember.findOne({
        where: { collectionId, userId: req.user.id }
      });

      if (!mem) return res.status(403).json({ message: 'Vous n’êtes pas membre de cette collection' });
      if (!allowedRoles || allowedRoles.length === 0) return next();

      if (allowedRoles.includes(mem.role) || mem.role === 'owner') {
        return next();
      }

      return res.status(403).json({ message: 'Permission insuffisante' });
    } catch (err) {
      console.error('collectionAuth error', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};
