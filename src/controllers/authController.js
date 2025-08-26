const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ email, password, displayName });
    res.json({ id: user.id, email: user.email, displayName: user.displayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  
      const valid = await user.verifyPassword(password);
      if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  
      // Généreration de JWT
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, id: user.id, email: user.email, displayName: user.displayName });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
