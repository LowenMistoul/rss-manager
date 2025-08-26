const express = require("express");
const app = express();

// Middleware JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur le backend RSS 🚀" });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
