// Local preview server for web/ — no dependencies.  Run: npm run dev   (PORT=8080 to change)
// Only for development; production is GitHub Pages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../web');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.xml': 'application/atom+xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.webp': 'image/webp',
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = path.resolve(WEB_ROOT, `.${urlPath}`);
    if (!file.startsWith(WEB_ROOT + path.sep) && file !== WEB_ROOT) throw Object.assign(new Error('forbidden'), { code: 403 });
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const type = TYPES[path.extname(file)];
    if (!type) throw Object.assign(new Error('type not served'), { code: 404 });
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    res.end(await readFile(file));
  } catch (err) {
    const code = err.code === 403 ? 403 : 404;
    res.writeHead(code, { 'content-type': 'text/plain' });
    res.end(code === 403 ? 'Forbidden' : 'Not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Serving web/ at http://127.0.0.1:${PORT}`));
