const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/authMiddleware');
const { requireCollectionMember, requireCollectionRole } = require('../middlewares/authorizeCollectionRole');
const ctrl = require('../controllers/articleCommentController');

router.use(auth);

router.get('/:articleId/comments', ctrl.listComments);
router.post('/:articleId/comments', requireCollectionMember(), ctrl.createComment);
router.put('/:articleId/comments/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.updateComment
);

router.delete('/:articleId/comments/:id',
  requireCollectionRole(['admin']),
  (req, _res, next) => { req.isModerator = true; next(); },
  ctrl.deleteComment
);

module.exports = router;
