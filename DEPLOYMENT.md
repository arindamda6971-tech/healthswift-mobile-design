# BloodLyn Deployment Guide

## Project Overview
BloodLyn is a **React + TypeScript + Vite PWA** mobile health diagnostics app. This guide covers building, previewing, and deploying the project.

---

## Local Development & Preview

### Prerequisites
- Node.js >= 16 (with npm or bun)
- Git

### Setup
```bash
# Clone and install dependencies
git clone <repo-url>
cd healthswift-mobile-design
npm install  # or: bun install
```

### Running Locally

**Development (hot reload on file changes)**
```bash
npm run dev
# Runs on http://localhost:8080
# Access from browser/VS Code preview at the printed URL
```

**Build (production-ready)**
```bash
npm run build
# Outputs bundled app to dist/ folder
# Runs Vite build with PWA service worker generation
```

**Preview (test production build locally)**
```bash
npm run preview
# Serves dist/ folder on http://localhost:8080
# Use this to verify the built app before deploying
```

---

## Building for Production

### Build Process

The `npm run build` command:
1. Transpiles TypeScript → JavaScript
2. Bundles React components and dependencies
3. Minifies CSS and JavaScript  
4. Generates PWA service worker (`dist/sw.js`)
5. Creates manifest (`dist/manifest.webmanifest`)
6. Outputs optimized files to `dist/` folder

**Build output example:**
```
dist/
├── index.html                    (3 KB) Entry point
├── manifest.webmanifest          (0.6 KB) PWA manifest
├── sw.js                         Service worker for offline support
├── registerSW.js                 PWA registration script
├── assets/
│   ├── index-*.js               (1 MB) Bundled app code
│   ├── index-*.css              (130 KB) Styles
│   └── *.woff2                  Fonts
├── pwa-192x192.png              Icon for PWA
└── pwa-512x512.png              Icon for PWA
```

---

## Deployment Platforms

### 1. **Vercel** (Recommended for Vite)

**Fastest & easiest option. Automatic deployments from Git.**

#### Setup
1. Push your code to GitHub (if not already)
2. Visit [vercel.com](https://vercel.com) → Sign in with GitHub
3. Click **"New Project"** → Select your repo
4. **Configuration:**
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables** (if needed): Add Supabase keys, etc.
5. Click **"Deploy"**

**Auto-deploy on push:**
Every time you push to the default branch, Vercel automatically rebuilds and deploys.

**Custom domain:**
- Go to project settings → Domains
- Add your domain and configure DNS

---

### 2. **Netlify**

**Alternative to Vercel. Simple setup with Git integration.**

#### Setup
1. Push to GitHub
2. Visit [netlify.com](https://netlify.com) → Sign in with GitHub
3. Click **"New site from Git"** → Select your repo
4. **Configuration:**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables** (if needed): Add in Site Settings → Environment
5. Click **"Deploy Site"**

**Redirect rules (for React Router):**
If using client-side routing, add `netlify.toml`:
```toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

---

### 3. **AWS (S3 + CloudFront)**

**For self-hosted or enterprise deployments.**

#### Setup
```bash
# Build locally
npm run build

# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://my-bloodlyn-app

# Upload dist/ to bucket
aws s3 sync dist/ s3://my-bloodlyn-app --delete

# Set bucket as static website hosting (in AWS Console)
# Create CloudFront distribution pointing to bucket

# Optional: Sync script for repeated deployments
npm install -g aws-amplify-cli
```

---

### 4. **GitHub Pages**

**Free hosting for repository owners.**

#### Setup
1. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/healthswift-mobile-design"
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add scripts to `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

5. Enable Pages in GitHub repo settings → Pages → Source: `gh-pages` branch

---

### 5. **Docker** (Self-Hosting)

**For deployment on any server (VPS, Kubernetes, etc.)**

#### Create `Dockerfile`
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Create `nginx.conf`
```nginx
server {
  listen 80;
  server_name _;

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

#### Build & run
```bash
# Build Docker image
docker build -t bloodlyn-app:latest .

# Run container
docker run -p 80:80 bloodlyn-app:latest

# Access at http://localhost
```

#### Deploy to services
- **Render**: Drag-and-drop Dockerfile → auto-deploys
- **Railway**: Connect GitHub → auto-builds Dockerfile
- **DigitalOcean App Platform**: Upload Dockerfile → deploy
- **AWS ECS/Fargate**: Push image to ECR → deploy on ECS

---

## Environment Variables

### Required (for Supabase integration)

Create `.env.production` (or set in deployment platform):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Getting Supabase keys:**
1. Dashboard → Project → Settings → API
2. Copy `Project URL` and `anon` key

---

## Pre-Deployment Checklist

- [ ] Run `npm run build` locally and verify no errors
- [ ] Check `dist/index.html` exists and has correct content
- [ ] Test preview: `npm run preview` and open http://localhost:8080
- [ ] Verify environment variables are set in deployment platform
- [ ] Test critical flows (add test, view cart, checkout)
- [ ] Check PWA manifest loads correctly (DevTools → Application → Manifest)
- [ ] Test offline mode (DevTools → Offline)
- [ ] Run `npm run lint` to catch any code issues

---

## Troubleshooting

### Build fails with module errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist/
npm install
npm run build
```

### Preview doesn't open
```bash
# Ensure dist/ exists
npm run build

# Try preview on explicit port
npm run preview -- --host --port 3000

# Test with curl
curl http://localhost:3000/
```

### App not loading in deployed URL
- Check **dist/index.html** exists in deployed files
- Ensure routing is configured for SPA (see Netlify redirect rule above)
- Verify environment variables (Supabase URL/key) are set
- Check browser console for 404s or CORS errors

### PWA not installing
- Serve over **HTTPS** (all deployment platforms do this automatically)
- Verify `manifest.webmanifest` loads (no 404)
- Service worker (`sw.js`) must load without errors
- Mobile: Use "Install App" from browser menu

---

## Performance Tips

1. **Monitor bundle size:**
   ```bash
   npm run build
   # Check output for warnings about large chunks
   ```

2. **Enable caching** (Vercel/Netlify do this by default):
   - Static assets cache for 1 year (hash-based filenames)
   - HTML refreshes on every request (no-cache)

3. **Use imagemin for images:**
   ```bash
   npm install vite-plugin-imagemin --save-dev
   ```

4. **Optimize Supabase queries:**
   - Use `.select('id, name')` to fetch only needed columns
   - Paginate results with `.range()`
   - Cache responses where suitable

---

## Support & Docs

- **Vite**: https://vitejs.dev/guide/
- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com
- **React PWA**: https://web.dev/progressive-web-apps/

---

## Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Vercel (one-time setup)
npm i -g vercel
vercel

# Deploy to Netlify (one-time setup)
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

**Last Updated:** Feb 12, 2025  
**Project:** BloodLyn Mobile Health Diagnostics App
