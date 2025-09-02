const { Feed, Collection,CollectionMember } = require('../models');
const xml2js = require("xml2js");
//const { create } = require('xmlbuilder2');
//const { parse: parseXML } = require('fast-xml-parser');
//const { Parser: CsvParser } = require('json2csv');
//const csvParse = require('csv-parse').parse;


const sanitizeFeed = (f) => {
  const { id, collectionId, createdAt, updatedAt, ...safe } = f; 
  return safe;
};

exports.exportFeeds = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.params.format?.toLowerCase();

    console.log("DEBUG export format:", format);

    // Charger les feeds accessibles par l’utilisateur
    const memberships = await CollectionMember.findAll({ where: { userId } });
    const collectionIds = memberships.map((m) => m.collectionId);

    const feeds = await Feed.findAll({
      where: { collectionId: collectionIds },
      include: [{ model: Collection, attributes: ["id", "name"] }]
    });

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({ message: "Aucun flux trouvé à exporter" });
    }

    // ----- JSON -----
    if (format === "json") {
      return res.json(feeds);
    }

    // ----- CSV -----
    if (format === "csv") {
      const { Parser } = require("json2csv");
      const fields = ["id", "title", "url", "description", "tags", "status", "collectionId"];
      const parser = new Parser({ fields });
      const csv = parser.parse(feeds.map(f => f.toJSON()));

      res.header("Content-Type", "text/csv");
      res.attachment("feeds.csv");
      return res.send(csv);
    }

    // ----- OPML -----
    if (format === "opml") {
      const xmlbuilder = require("xmlbuilder");
      const root = xmlbuilder.create("opml", { version: "1.0", encoding: "UTF-8" });
      root.att("version", "2.0");
      const body = root.ele("body");

      const grouped = {};
      feeds.forEach((f) => {
        if (!grouped[f.Collection.title]) grouped[f.Collection.title] = [];
        grouped[f.Collection.title].push(f);
      });

      for (const [collectionTitle, collFeeds] of Object.entries(grouped)) {
        const outline = body.ele("outline", { text: collectionTitle });
        collFeeds.forEach((f) => {
          outline.ele("outline", {
            text: f.title,
            title: f.title,
            type: "rss",
            xmlUrl: f.url,
            description: f.description || ""
          });
        });
      }

      res.header("Content-Type", "text/xml");
      res.attachment("feeds.opml");
      return res.send(root.end({ pretty: true }));
    }

    // Format inconnu
    return res.status(400).json({ message: "Format non supporté. Utilisez json, csv ou opml." });

  } catch (err) {
    console.error("exportFeeds error", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


/** ----------- IMPORT (OPML / JSON / CSV) ----------- **/
/** Endpoint: POST /api/feeds/import
 * Form-data:
 *  - file: (OPML / JSON / CSV)
 *  - collectionId: UUID de la collection cible (OBLIGATOIRE)
 * Règle: on vérifie que l’utilisateur est bien owner de la collection cible.
 */
exports.importFeeds = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });

    const userId = req.user.id;
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let feeds = [];

    /** ----- JSON ----- **/
    if (ext === "json") {
      feeds = JSON.parse(req.file.buffer.toString());
      feeds = feeds.map((f) =>
        sanitizeFeed({
          title: f.title,
          url: f.url,
          description: f.description,
          tags: f.tags,
          collectionName: "Import",
        })
      );
    }

    /** ----- CSV ----- **/
    if (ext === "csv") {
      const buffer = req.file.buffer.toString();
      const lines = buffer.split("\n").filter((l) => l.trim() !== "");
      const headers = lines[0].split(",").map((h) => h.trim());

      const rows = [];
      console.log("DEBUG CSV brut =>", rows);
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((h, idx) => (row[h] = values[idx]?.trim()));
          rows.push(row);
        }
      }

      feeds = rows.map((r) =>
        sanitizeFeed({
          title: r.title,
          url: r.url,
          description: r.description,
          tags: r.tags,
          collectionName: "Import",
        })
      );
    }

    /** ----- OPML ----- **/
    if (ext === "opml" || ext === "xml") {
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(req.file.buffer.toString());

      feeds = [];
      const outlines = parsed.opml.body[0].outline || [];

      const extractFeeds = (nodes, collectionName = "Import") => {
        nodes.forEach((n) => {
          if (n.$?.xmlUrl) {
            feeds.push(
              sanitizeFeed({
                title: n.$.title || n.$.text,
                url: n.$.xmlUrl,
                description: n.$.description || "",
                collectionName,
              })
            );
          } else if (n.outline) {
            extractFeeds(n.outline, n.$?.text || collectionName);
          }
        });
      };

      extractFeeds(outlines);
    }

    if (!feeds || feeds.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucun flux valide trouvé dans le fichier." });
    }

    /** ----- Sauvegarde en DB ----- **/
    const createdFeeds = [];
    for (const f of feeds) {
      if (!f.url) continue;

      console.log("Feed importé brut =>", f);

      // Vérifier ou créer la collection (champ `name`)
      let collection = await Collection.findOne({
        where: { name: f.collectionName || "Import", creatorId: userId },
      });

      if (!collection) {
        collection = await Collection.create({
          name: f.collectionName || "Import",
          creatorId: userId,
        });
        console.log("Nouvelle collection créée =>", collection.id, collection.name);
      } else {
        console.log("Collection trouvée =>", collection.id, collection.name);
      }

      // ⚠️ On mappe tags → categories
      const categories = f.tags
        ? f.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      // Insertion du feed sans id/collectionName
      console.log("DEBUG Feed à insérer =>", {
        title: f.title,
        url: f.url,
        description: f.description,
        tags: f.tags,
        collectionName: f.collectionName
      });      
      const feed = await Feed.create({
        title: f.title || f.url,
        url: f.url,
        description: f.description || "",
        categories,
        collectionId: collection.id,
        status: "active",
      });

      console.log("Feed créé =>", feed.id, feed.title);
      createdFeeds.push(feed);
    }

    res.json({
      message: `${createdFeeds.length} flux importés`,
      feeds: createdFeeds,
    });
  } catch (err) {
    console.error("importFeeds error", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};




