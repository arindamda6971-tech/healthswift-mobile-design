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
      let p = url;
      if (p.startsWith('http://') || p.startsWith('https://')) {
        // Block external network requests for safety
        return null;
      }
      if (p.startsWith('/')) {
        p = path.join(distDir, p);
      } else if (p.startsWith('file:')) {
        p = new URL(p).pathname;
      }
      if (fs.existsSync(p)) {
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
