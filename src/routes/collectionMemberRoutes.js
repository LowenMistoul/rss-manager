const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  requireCollectionMember,
  requireCollectionRole,
  requireCollectionOwner,
} = require("../middlewares/authorizeCollectionRole");

const collectionMemberController = require("../controllers/collectionMemberController");

router.use(authMiddleware);

router.get(
  "/:collectionId/members",
  requireCollectionMember(),
  collectionMemberController.listMembers
);

router.post(
  "/:collectionId/members",
  requireCollectionRole(["admin"]),
  collectionMemberController.addMember
);

router.put(
  "/:collectionId/members/:memberId",
  requireCollectionRole(["admin"]),
  collectionMemberController.updateMemberRole
);

router.delete(
  "/:collectionId/members/:memberId",
  requireCollectionRole(["admin"]),
  collectionMemberController.removeMember
);


module.exports = router;
