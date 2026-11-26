const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { handleApiRequest } = require('./server/api');

const PORT = process.env.PORT || 8000;
const ROOT_DIR = __dirname;
const CONTRIVE_DIR = path.join(__dirname, 'contrive');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg'
};

function resolveFilePath(pathname) {
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    // Try relative to ROOT_DIR first
    let candidate = path.join(ROOT_DIR, pathname);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }

    // Try with .html extension (Clean URLs support)
    if (!path.extname(pathname)) {
        let htmlCandidate = path.join(ROOT_DIR, pathname + '.html');
        if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
            return htmlCandidate;
        }
    }

    // Try inside CONTRIVE_DIR
    let contriveCandidate = path.join(CONTRIVE_DIR, pathname);
    if (fs.existsSync(contriveCandidate) && fs.statSync(contriveCandidate).isFile()) {
        return contriveCandidate;
    }

    if (!path.extname(pathname)) {
        let contriveHtmlCandidate = path.join(CONTRIVE_DIR, pathname + '.html');
        if (fs.existsSync(contriveHtmlCandidate) && fs.statSync(contriveHtmlCandidate).isFile()) {
            return contriveHtmlCandidate;
        }
    }

    return null;
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Woodora-Token');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. Route API requests directly to WOODORA REST API Engine
    if (pathname.startsWith('/api/')) {
        return handleApiRequest(req, res, pathname, parsedUrl.searchParams);
    }

    // 2. Backward compatible PHP contact form endpoint
    if (pathname === '/contact-form.php' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const parsedData = querystring.parse(body);
            const fname = parsedData.fname || 'Valued Client';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'Success',
                msg: `Thank you, ${fname}! Your inquiry has been delivered to WOODORA's interior concierge. Our design team will contact you shortly.`
            }));
        });
        return;
    }

    // 3. Strip legacy /contrive/ prefix if present
    if (pathname.startsWith('/contrive/')) {
        pathname = pathname.replace(/^\/contrive/, '');
    }

    const resolvedFile = resolveFilePath(pathname);

    if (!resolvedFile) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html>
<head><title>404 Not Found - WOODORA</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px; background: #F7F4EE; color: #252525;">
    <h2>404 - Page Not Found</h2>
    <p>Requested: ${pathname}</p>
    <a href="/" style="display: inline-block; padding: 10px 20px; background: #263D32; color: #fff; text-decoration: none; border-radius: 4px;">Return to WOODORA Homepage</a>
</body>
</html>`);
        return;
    }

    const ext = path.extname(resolvedFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(resolvedFile);
    stream.pipe(res);
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  WOODORA - Premium Furniture E-Commerce Web Server    `);
    console.log(`  Crafted for Comfort. Designed for Life.              `);
    console.log(`=======================================================`);
    console.log(`  Application running at: http://localhost:${PORT}/     `);
    console.log(`  REST API ready at:      http://localhost:${PORT}/api/ `);
    console.log(`=======================================================`);
});

module.exports = server;
