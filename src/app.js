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
app.use('/api/collections', require('./routes/collection'));
app.use('/api/feeds', require('./routes/feed'));
app.use('/api/articles', require('./routes/article'));

module.exports = app;
