const { Feed, Collection } = require('../models');
const { create } = require('xmlbuilder2');
const { parse: parseXML } = require('fast-xml-parser');
const { Parser: CsvParser } = require('json2csv');
const csvParse = require('csv-parse').parse;

/** Helper: récupère les feeds "exportables" pour l'utilisateur
 * Par défaut: toutes les collections dont il est owner (créateur).
 * Option: ?collectionId=... pour n’exporter qu’une collection.
 */
async function getExportableFeeds(userId, collectionId) {
  const colWhere = collectionId ? { id: collectionId, creatorId: userId } : { creatorId: userId };
  const collections = await Collection.findAll({ where: colWhere, attributes: ['id', 'name'] });
  if (!collections.length) return { collections: [], feeds: [] };

  const collectionIds = collections.map(c => c.id);
  const feeds = await Feed.findAll({
    where: { collectionId: collectionIds },
    attributes: ['id', 'title', 'url', 'description', 'categories', 'updateFrequency', 'status', 'collectionId'],
    order: [['title', 'ASC']]
  });

  return { collections, feeds };
}

/** ----------- EXPORT: OPML ----------- **/
exports.exportOPML = async (req, res) => {
  try {
    const { collectionId } = req.query;
    const { collections, feeds } = await getExportableFeeds(req.user.id, collectionId);

    // map collectionId -> feeds
    const byCol = new Map();
    for (const c of collections) byCol.set(c.id, []);
    for (const f of feeds) {
      if (byCol.has(f.collectionId)) byCol.get(f.collectionId).push(f);
    }

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('opml', { version: '2.0' })
        .ele('head')
          .ele('title').txt(`Export RSS - ${req.user.email}`).up()
          .ele('dateCreated').txt(new Date().toISOString()).up()
        .up()
        .ele('body');

    for (const c of collections) {
      const colNode = root.ele('outline', { text: c.name, title: c.name });
      const list = byCol.get(c.id) || [];
      for (const f of list) {
        colNode.ele('outline', {
          type: 'rss',
          text: f.title,
          title: f.title,
          xmlUrl: f.url,
          // facultatif: categories à plat
          category: Array.isArray(f.categories) ? f.categories.join(',') : undefined
        }).up();
      }
      colNode.up();
    }

    const xml = root.end({ prettyPrint: true });

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="feeds.opml"');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('exportOPML error', err);
    return res.status(500).json({ message: 'Erreur export OPML' });
  }
};

/** ----------- EXPORT: JSON ----------- **/
exports.exportJSON = async (req, res) => {
  try {
    const { collectionId } = req.query;
    const { collections, feeds } = await getExportableFeeds(req.user.id, collectionId);

    const colById = new Map(collections.map(c => [c.id, c]));
    const payload = feeds.map(f => ({
      title: f.title,
      url: f.url,
      description: f.description || '',
      categories: f.categories || [],
      updateFrequency: f.updateFrequency || 60,
      status: f.status || 'active',
      collection: colById.get(f.collectionId)?.name || ''
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="feeds.json"');
    return res.status(200).json(payload);
  } catch (err) {
    console.error('exportJSON error', err);
    return res.status(500).json({ message: 'Erreur export JSON' });
  }
};

/** ----------- EXPORT: CSV ----------- **/
exports.exportCSV = async (req, res) => {
  try {
    const { collectionId } = req.query;
    const { collections, feeds } = await getExportableFeeds(req.user.id, collectionId);

    const colById = new Map(collections.map(c => [c.id, c]));
    const rows = feeds.map(f => ({
      collection: colById.get(f.collectionId)?.name || '',
      title: f.title,
      url: f.url,
      description: f.description || '',
      categories: Array.isArray(f.categories) ? f.categories.join('|') : '',
      updateFrequency: f.updateFrequency || 60,
      status: f.status || 'active'
    }));

    const fields = ['collection', 'title', 'url', 'description', 'categories', 'updateFrequency', 'status'];
    const parser = new CsvParser({ fields });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="feeds.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('exportCSV error', err);
    return res.status(500).json({ message: 'Erreur export CSV' });
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
    const { file } = req;
    const { collectionId } = req.body;
    if (!file) return res.status(400).json({ message: 'Fichier manquant' });
    if (!collectionId) return res.status(400).json({ message: 'collectionId requis' });

    const collection = await Collection.findByPk(collectionId);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    if (String(collection.creatorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Accès refusé : vous devez être le propriétaire de la collection' });
    }

    const buffer = file.buffer;
    const original = (file.originalname || '').toLowerCase();

    let feedsToCreate = [];

    if (original.endsWith('.opml') || /xml/.test(file.mimetype)) {
      feedsToCreate = parseOPML(buffer);
    } else if (original.endsWith('.json') || /json/.test(file.mimetype)) {
      feedsToCreate = parseJSON(buffer);
    } else if (original.endsWith('.csv') || /csv|excel/.test(file.mimetype)) {
      feedsToCreate = await parseCSV(buffer);
    } else {
      // tentative: auto-détection OPML
      const txt = buffer.toString('utf8').trim();
      if (txt.startsWith('<')) feedsToCreate = parseOPML(buffer);
      else if (txt.startsWith('[') || txt.startsWith('{')) feedsToCreate = parseJSON(buffer);
      else feedsToCreate = await parseCSV(buffer);
    }

    // Dé-doublonnage simple: par URL dans la collection
    const created = [];
    for (const f of feedsToCreate) {
      const title = f.title?.trim() || 'Sans titre';
      const url = f.url?.trim();
      if (!url) continue;

      // existe déjà ?
      const exists = await Feed.findOne({ where: { url, collectionId } });
      if (exists) continue;

      const categories = Array.isArray(f.categories)
        ? f.categories
        : typeof f.categories === 'string'
          ? f.categories.split(/[;,|]/).map(s => s.trim()).filter(Boolean)
          : [];

      const feed = await Feed.create({
        title,
        url,
        description: f.description || '',
        categories,
        updateFrequency: Number(f.updateFrequency) || 60,
        status: f.status === 'inactive' ? 'inactive' : 'active',
        collectionId
      });
      created.push(feed);
    }

    return res.status(201).json({
      message: `Import terminé`,
      created: created.length
    });
  } catch (err) {
    console.error('importFeeds error', err);
    return res.status(500).json({ message: 'Erreur import', detail: err.message });
  }
};

/** ------ Helpers de parsing ------ **/

function parseOPML(buffer) {
  const text = buffer.toString('utf8');
  const obj = parseXML(text, {
    ignoreAttributes: false,
    attributeNamePrefix: ''
  });

  // Parcours récursif d'outlines
  const feeds = [];
  const body = obj?.opml?.body;
  if (!body) return feeds;

  const outlines = Array.isArray(body.outline) ? body.outline : (body.outline ? [body.outline] : []);

  function walk(nodes) {
    for (const n of nodes) {
      if (n.xmlUrl || (n.outline && !n.type)) {
        // Si c'est un dossier (outline contenant d'autres outlines)
        if (n.outline) {
          const children = Array.isArray(n.outline) ? n.outline : [n.outline];
          walk(children);
        }
      }
      if (n.type === 'rss' && n.xmlUrl) {
        feeds.push({
          title: n.title || n.text || 'Sans titre',
          url: n.xmlUrl,
          categories: (n.category || '').split(/[;,|]/).map(s => s.trim()).filter(Boolean)
        });
      }
      // Si c'est un container (outline) sans type, on parcourt ses enfants
      if (!n.type && n.outline) {
        const children = Array.isArray(n.outline) ? n.outline : [n.outline];
        walk(children);
      }
    }
  }

  walk(outlines);
  return feeds;
}

function parseJSON(buffer) {
  try {
    const json = JSON.parse(buffer.toString('utf8'));
    if (Array.isArray(json)) {
      return json.map(j => ({
        title: j.title || 'Sans titre',
        url: j.url,
        description: j.description || '',
        categories: j.categories || [],
        updateFrequency: j.updateFrequency || 60,
        status: j.status || 'active'
      })).filter(f => !!f.url);
    }
    // format objet { feeds: [...] }
    if (Array.isArray(json.feeds)) {
      return json.feeds.map(j => ({
        title: j.title || 'Sans titre',
        url: j.url,
        description: j.description || '',
        categories: j.categories || [],
        updateFrequency: j.updateFrequency || 60,
        status: j.status || 'active'
      })).filter(f => !!f.url);
    }
    return [];
  } catch {
    return [];
  }
}

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const out = [];
    csvParse(buffer.toString('utf8'), {
      columns: true,
      trim: true,
      skip_empty_lines: true
    })
    .on('readable', function () {
      let rec;
      while ((rec = this.read())) {
        out.push({
          title: rec.title || rec.TITLE || 'Sans titre',
          url: rec.url || rec.URL,
          description: rec.description || rec.DESCRIPTION || '',
          categories: rec.categories || rec.CATEGORIES || '',
          updateFrequency: rec.updateFrequency || rec.UPDATEFREQUENCY || 60,
          status: rec.status || rec.STATUS || 'active'
        });
      }
    })
    .on('end', () => resolve(out.filter(f => !!f.url)))
    .on('error', reject);
  });
}
