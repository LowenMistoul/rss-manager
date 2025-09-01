const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/authMiddleware');
const { requireCollectionMember, requireCollectionRole } = require('../middlewares/authorizeCollectionRole');
const ctrl = require('../controllers/messageController');

router.use(auth);

router.get('/:collectionId/messages', requireCollectionMember(), ctrl.listMessages);
router.post('/:collectionId/messages', requireCollectionMember(), ctrl.createMessage);
router.use('/:collectionId/messages/:id', requireCollectionMember(), (req, res, next) => {
  next();
});
router.put('/:collectionId/messages/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.updateMessage
);

router.delete('/:collectionId/messages/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.deleteMessage
);

module.exports = router;
