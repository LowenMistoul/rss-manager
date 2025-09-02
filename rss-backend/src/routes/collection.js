const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const collectionController = require('../controllers/collectionController');
const articleController = require('../controllers/articleController')

// Toutes les routes sont protégées
router.use(authMiddleware);

router.post('/', collectionController.createCollection);
//router.get("/:id/articles", articleController.getArticlesByCollection);
router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollectionById);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);



module.exports = router;
