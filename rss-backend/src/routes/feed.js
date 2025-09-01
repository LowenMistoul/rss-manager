const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const feedController = require('../controllers/feedController');

router.use(authMiddleware);

router.post('/', feedController.createFeed);
router.get('/collection/:collectionId', feedController.getFeedsByCollection);
//router.get('/collections/:collectionId/feeds', feedController.getFeedsByCollection);
router.get('/:id', feedController.getFeedById);
router.put('/:id', feedController.updateFeed);
router.delete('/:id', feedController.deleteFeed);

module.exports = router;
