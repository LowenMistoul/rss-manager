const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/authMiddleware');
const { requireCollectionMember, requireCollectionRole } = require('../middlewares/authorizeCollectionRole');
const ctrl = require('../controllers/messageController');

router.use(auth);

// GET /api/collections/:collectionId/messages
router.get('/:collectionId/messages', requireCollectionMember(), ctrl.listMessages);

// POST /api/collections/:collectionId/messages
router.post('/:collectionId/messages', requireCollectionMember(), ctrl.createMessage);

// PUT /api/collections/:collectionId/messages/:id
router.put(
  '/:collectionId/messages/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.updateMessage
);

// DELETE /api/collections/:collectionId/messages/:id
router.delete(
  '/:collectionId/messages/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.deleteMessage
);

module.exports = router;
