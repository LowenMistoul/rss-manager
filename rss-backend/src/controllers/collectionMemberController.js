const { CollectionMember, User, Collection } = require("../models");

// Add a member to a collection
const addMember = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { userId, role } = req.body;

    // Vérifier que la collection existe
    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection introuvable" });
    }

    // Vérifier que l’utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Vérifier qu’il n’est pas déjà membre
    const exists = await CollectionMember.findOne({ where: { userId, collectionId } });
    if (exists) {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre" });
    }

    // Créer le membership
    const membership = await CollectionMember.create({
      userId,
      collectionId,
      role: role || "viewer",
    });

    // Charger le membership avec les infos User incluses
    const fullMembership = await CollectionMember.findByPk(membership.id, {
      include: [{ model: User, attributes: ["id", "email", "displayName"] }],
    });

    res.status(201).json(fullMembership);

  } catch (err) {
    console.error("addMember error", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
  
  // Update a member's role
  const updateMemberRole = async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
      const { role } = req.body;
  
      const membership = await CollectionMember.findOne({
        where: { id: memberId, collectionId },
      });
  
      if (!membership) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }

      if (membership.role === "owner" && role !== "owner") {
        return res.status(400).json({ message: "Impossible de modifier le rôle du propriétaire" });
      }
  
      membership.role = role || membership.role;
      await membership.save();
  
      // recharger avec User inclus
      const fullMembership = await CollectionMember.findByPk(membership.id, {
        include: [{ model: User, attributes: ["id", "email", "displayName"] }],
      });
  
      res.json(fullMembership);
    } catch (err) {
      console.error("updateMemberRole error", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  // Remove a member from a collection
  const removeMember = async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
  
      const membership = await CollectionMember.findOne({
        where: { id: memberId, collectionId },
        include: [{ model: User, attributes: ["id", "email", "displayName"] }],
      });
  
      if (!membership) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }
  
      
      if (membership.role === "owner") {
        return res.status(400).json({ message: "Impossible de supprimer le propriétaire de la collection" });
      }
  
      await membership.destroy();
  
      res.json({
        message: "Membre supprimé",
        removed: membership,
      });
    } catch (err) {
      console.error("removeMember error", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  // List all members in a collection
  const listMembers = async (req, res) => {
    try {
      const { collectionId } = req.params;
  
      const members = await CollectionMember.findAll({
        where: { collectionId },
        include: [
          {
            model: User,
            attributes: ["id", "email", "displayName"]
          }
        ]
      });
  
      res.json(members);
    } catch (err) {
      console.error("listMembers error", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  
  module.exports = {
    addMember,
    updateMemberRole,
    removeMember,
    listMembers,
  };
  