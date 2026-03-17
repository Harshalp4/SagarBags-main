const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Image upload endpoint
  if (req.method === 'POST' && req.url === '/upload-image') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(body);

        // Parse multipart form data manually
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
          // JSON-based upload with base64
          const data = JSON.parse(buffer.toString());
          const { category, fileName, imageData } = data;

          if (!category || !fileName || !imageData) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Missing category, fileName, or imageData' }));
            return;
          }

          // Sanitize fileName to prevent path traversal
          const safeFileName = path.basename(fileName);

          // Determine folder: support both products and testimonials
          let folderPath;
          let relativePath;
          if (category === 'testimonials') {
            folderPath = path.join(ROOT, 'assets', 'images', 'testimonials');
            relativePath = `assets/images/testimonials/${safeFileName}`;
          } else {
            const safeCategory = category.replace(/[^a-z0-9-]/g, '');
            folderPath = path.join(ROOT, 'assets', 'images', 'products', safeCategory);
            relativePath = `assets/images/products/${safeCategory}/${safeFileName}`;
          }
          fs.mkdirSync(folderPath, { recursive: true });

          // Decode base64 and save
          const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
          const filePath = path.join(folderPath, safeFileName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          console.log(`Saved: ${relativePath}`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, path: relativePath }));
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Use JSON upload' }));
      } catch (error) {
        console.error('Upload error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // Static file serving
  let filePath = req.url.split('?')[0];
  if (filePath === '/') filePath = '/index.html';

  const fullPath = path.join(ROOT, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Sagar Bags Server running at http://localhost:${PORT}`);
  console.log(`  Bulk Upload: http://localhost:${PORT}/bulk-upload-products.html`);
  console.log(`  Admin: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`\n  Images will be saved automatically to assets/images/products/<category>/\n`);
});
