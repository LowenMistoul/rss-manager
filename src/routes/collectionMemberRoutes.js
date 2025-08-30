const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const collectionMemberController = require('../controllers/collectionMemberController');

router.use(authMiddleware);

router.post("/:collectionId/members",collectionMemberController.addMember);             
router.put("/:collectionId/members/:memberId", collectionMemberController.updateMemberRole); 
router.delete("/:collectionId/members/:memberId", collectionMemberController.removeMember); 
router.get("/:collectionId/members", collectionMemberController.listMembers);              

module.exports = router;
