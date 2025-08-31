const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/feedImportExportController');

router.use(auth);

// EXPORTS
router.get('/export.opml', ctrl.exportOPML);
router.get('/export.json', ctrl.exportJSON);
router.get('/export.csv', ctrl.exportCSV);

// IMPORT
router.post('/import', upload.single('file'), ctrl.importFeeds);

module.exports = router;
