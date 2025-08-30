const Parser = require('rss-parser');
const parser = new Parser();

const { Feed, Article, Collection } = require('../models');

const HARD_FAIL_THRESHOLD = 5; 
const schedulers = new Map();  


async function startRssSchedulers() {
  const feeds = await Feed.findAll({ where: { status: 'active' } });
  for (const f of feeds) scheduleFeed(f.id, true);
  console.log(`Schedulers démarrés pour ${feeds.length} feed(s).`);
}


async function scheduleFeed(feedId, initial = false) {
  await stopScheduler(feedId); // évite les doublons
  const feed = await Feed.findByPk(feedId);
  if (!feed || feed.status !== 'active') return;

  const minutes = Math.max(1, feed.updateFrequency || 60);
  const intervalMs = minutes * 60 * 1000;

  const jitterMs = initial ? Math.floor(Math.random() * 10000) : 0;

  const state = { timeout: null, running: false };
  schedulers.set(feedId, state);

  const tick = async () => {
    const fresh = await Feed.findByPk(feedId);
    if (!fresh || fresh.status !== 'active') {
      await stopScheduler(feedId);
      return;
    }

    if (state.running) {
      state.timeout = setTimeout(tick, intervalMs);
      return;
    }

    state.running = true;
    try {
      await fetchOnce(fresh);
    } catch (e) {
      console.error(`⚠️  Tick feed ${feedId} erreur non gérée:`, e);
    } finally {
      state.running = false;
      state.timeout = setTimeout(tick, intervalMs);
    }
  };

  state.timeout = setTimeout(tick, jitterMs || 0);
  console.log(`Feed ${feed.title} planifié toutes les ${minutes} minute(s).`);
}


async function stopScheduler(feedId) {
  const state = schedulers.get(feedId);
  if (state && state.timeout) {
    clearTimeout(state.timeout);
  }
  schedulers.delete(feedId);
}


async function rescheduleFeed(feedId) {
  await scheduleFeed(feedId, false);
}

async function fetchOnce(feed) {
  if (feed.lastFetchedAt) {
    const msSinceLast = Date.now() - new Date(feed.lastFetchedAt).getTime();
    const minMs = Math.max(1, feed.updateFrequency || 60) * 60 * 1000 * 0.8; 
    if (msSinceLast < minMs) {
      return;
    }
  }

  try {
    const collection = await Collection.findByPk(feed.collectionId);
    if (!collection) throw new Error('Collection introuvable pour ce feed');

    const rss = await parser.parseURL(feed.url);

    let created = 0;
    for (const item of rss.items || []) {
      const link = item.link || item.id || item.guid; 
      if (!link) continue; 

      const existing = await Article.findOne({ where: { link, feedId: feed.id } });
      if (existing) continue;

      await Article.create({
        title: item.title || 'Sans titre',
        link,
        author: item.creator || item.author || null,
        pubDate: item.isoDate ? new Date(item.isoDate) : (item.pubDate ? new Date(item.pubDate) : null),
        contentSnippet: item.contentSnippet || item.content || '',
        feedId: feed.id
      });
      created++;
    }

    // reset les compteurs d'échec si succés
    await feed.update({
      lastFetchedAt: new Date(),
      failedAttempts: 0,
      lastError: null
    });

    console.log(`✅ ${feed.title}: ${created} nouvel(aux) article(s) enregistré(s).`);
  } catch (err) {
    // gestion des erreurs réseau/XML
    const msg = normalizeErrorMessage(err);
    const attempts = (feed.failedAttempts || 0) + 1;

    const updates = { failedAttempts: attempts, lastError: msg };

    if (attempts >= HARD_FAIL_THRESHOLD) {
      updates.status = 'inactive';
      console.error(`${feed.title}: ${msg} — désactivé après ${attempts} échecs.`);
    } else {
      console.warn(`${feed.title}: ${msg} — tentative ${attempts}/${HARD_FAIL_THRESHOLD}`);
    }

    await feed.update(updates);
  }
}


function normalizeErrorMessage(err) {
  if (!err) return 'Erreur inconnue';
  const msg = String(err.message || err);
  if (/ENOTFOUND|EAI_AGAIN/i.test(msg)) return 'DNS introuvable';
  if (/ECONNREFUSED|ECONNRESET/i.test(msg)) return 'Connexion refusée/réinitialisée';
  if (/ETIMEDOUT/i.test(msg)) return 'Délai de connexion dépassé';
  if (/Status code/i.test(msg)) return msg; // ex: "Status code 404"
  if (/Unexpected close tag|Non-whitespace before first tag|XML/i.test(msg)) return 'Flux RSS/XML invalide';
  return msg;
}

module.exports = {
  startRssSchedulers,
  rescheduleFeed,
  stopScheduler,
  scheduleFeed
};
