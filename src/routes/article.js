const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const articleController = require('../controllers/articleController');

router.use(authMiddleware);

router.post('/', articleController.createArticle);
router.get('/feed/:feedId', articleController.getArticlesByFeed);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
