const { Client } = require("pg");

(async () => {
  const client = new Client({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "rss_user",
    password: process.env.DB_PASSWORD || "rss_pass",
    database: process.env.DB_NAME || "rss_db",
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log("✅ Connexion réussie à Postgres !");
    await client.end();
  } catch (err) {
    console.error("❌ Erreur connexion:", err);
  }
})();
