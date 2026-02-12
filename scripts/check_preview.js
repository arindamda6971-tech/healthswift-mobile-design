import fs from 'fs';
import path from 'path';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');

class LocalResourceLoader extends ResourceLoader {
  fetch(url, options) {
    // Map absolute paths (/assets/...) to files in dist
    try {
      let p;
      // Normalize and map URLs to files in `dist`.
      // Accept same-origin (localhost) http(s) requests and map their pathname to `dist`.
      try {
        const parsed = new URL(url, 'http://localhost');
        if (parsed.protocol === 'file:') {
          p = parsed.pathname;
        } else if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          // allow only same-origin (localhost) requests to be served from dist
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            p = path.join(distDir, parsed.pathname.replace(/^\//, ''));
          } else {
            return null;
          }
        } else {
          // other protocols, treat as relative path into dist
          p = path.join(distDir, parsed.pathname.replace(/^\//, ''));
        }
      } catch (err) {
        // fallback for non-URL inputs
        if (typeof url === 'string' && url.startsWith('/')) {
          p = path.join(distDir, url.replace(/^\//, ''));
        } else if (typeof url === 'string' && url.startsWith('file:')) {
          p = new URL(url).pathname;
        } else {
          p = path.join(distDir, String(url));
        }
      }

      if (p && fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return Promise.resolve(buf);
      }
    } catch (err) {
      // fallthrough
    }
    return null;
  }
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('log', (...args) => console.log('[console.log]', ...args));
virtualConsole.on('error', (...args) => console.error('[console.error]', ...args));
virtualConsole.on('warn', (...args) => console.warn('[console.warn]', ...args));
virtualConsole.on('jsdomError', (err) => console.error('[jsdomError]', err && err.stack ? err.stack : err));

(async () => {
  const dom = new JSDOM(indexHtml, {
    resources: new LocalResourceLoader(),
    runScripts: 'dangerously',
    url: 'http://localhost/',
    virtualConsole,
  });

  // Wait up to 5s for load
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Dump any script errors attached to window
  if (dom.window.__lastErrors && dom.window.__lastErrors.length) {
    console.error('Captured errors:', dom.window.__lastErrors);
  }

  // Check if root has children
  const root = dom.window.document.getElementById('root');
  console.log('root innerHTML length:', root ? root.innerHTML.length : 'no-root');

  // Exit
  process.exit(0);
})();
