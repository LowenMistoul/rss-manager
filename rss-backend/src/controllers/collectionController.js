const { Collection, CollectionMember } = require('../models');

// Créer une collection
exports.createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nom requis" });

    // Créer la collection
    const collection = await Collection.create({
      name,
      description,
      creatorId: req.user.id, // si ce champ existe
    });

    // Ajouter le créateur comme membre "owner"
    await CollectionMember.create({
      collectionId: collection.id,
      userId: req.user.id,
      role: "owner",
    });

    res.status(201).json(collection);
  } catch (err) {
    console.error("Erreur createCollection:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Lister toutes les collections de l'utilisateur
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({ where: { creatorId: req.user.id } });
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Voir une collection par ID
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une collection
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    const { name, description, isShared } = req.body;
    collection.name = name || collection.name;
    collection.description = description || collection.description;
    if (isShared !== undefined) collection.isShared = isShared;

    await collection.save();
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une collection
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    if (collection.creatorId !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    await collection.destroy();
    res.json({ message: 'Collection supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
