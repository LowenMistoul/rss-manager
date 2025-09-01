const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    provider: user.provider
  });
});

module.exports = router;
