const express = require("express");
const app = express();
const cors = require('cors');
const passport = require('./config/passport');
app.use(passport.initialize());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

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
app.use("/api/collections", require ('./routes/collectionMember'));
app.use('/api/feeds', require('./routes/feedImportExport'));



module.exports = app;
