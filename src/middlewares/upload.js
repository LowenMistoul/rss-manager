const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Mo
  },
  fileFilter: (req, file, cb) => {
    const ok = [
      'text/xml', 'application/xml',              // OPML
      'application/json', 'text/json',            // JSON
      'text/csv', 'application/csv', 'application/vnd.ms-excel' // CSV
    ];
    if (ok.includes(file.mimetype)) cb(null, true);
    else cb(null, true); // on laisse passer, on détectera au parse
  }
});

module.exports = upload;
