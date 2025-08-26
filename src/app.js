const express = require("express");
const app = express();

// Middleware JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur le backend RSS 🚀" });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));


module.exports = app;
