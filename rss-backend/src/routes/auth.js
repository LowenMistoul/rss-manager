const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // ⚠️ manquant
const auth = require('../controllers/authController');
const passport = require('../config/passport');

// Auth classique
router.post('/register', auth.register);
router.post('/login', auth.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName
      }
    });
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName
      }
    });
  }
);

module.exports = router;
