const express = require('express');
const router = express.Router();
const { User } = require('../models');
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

router.get("/lookup", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json({ id: user.id, email: user.email, displayName: user.displayName });
  } catch (err) {
    console.error("lookup error", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
