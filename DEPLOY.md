## 🚀 VidPipe — Server Deployment Guide

### 1. Create the DB (once)
```bash
psql -h 72.62.39.82 -U alagappan -c "CREATE DATABASE vidpipe_db;"
```

### 2. Clone & Install
```bash
apt update && apt install -y ffmpeg curl git
cd /root
git clone <your-repo> vidpipe
cd vidpipe
npm install
cp .env.example .env   # fill in values
npx prisma migrate deploy
```

### 3. Create video storage directory
```bash
mkdir -p /root/vidpipe/data/videos
```

### 4. Build & start Next.js with PM2
```bash
npm run build
npm install -g pm2
pm2 start "npm start" --name vidpipe
pm2 save
pm2 startup   # auto-start on reboot
```

### 5. Deploy Nginx
```bash
cp nginx.conf /etc/nginx/sites-available/ilovedesi.fun
ln -s /etc/nginx/sites-available/ilovedesi.fun /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. SSL (free via Certbot)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d ilovedesi.fun -d www.ilovedesi.fun
```

---

## 📦 Pipeline Usage

### Add URLs to queue
```bash
node pipeline/ingest.js --file urls.txt
# or
node pipeline/ingest.js --url "https://cdn.example.com/video.mp4"
```

### Process next video (interactive)
```bash
node pipeline/downloader.js
# Prompts:
#   Title: Hot Desi Dance Video
#   Description: (Enter to auto-generate 300+ words)
#   Category: desi
#   Tags: desi, dance, indian
#   Thumbnail time (seconds): 5
```

### Batch process all pending (auto mode)
```bash
# Keep running until queue is empty
while node pipeline/downloader.js --auto; do sleep 2; done
```

### Monitor + retry failed
```bash
node pipeline/monitor.js            # shows status + retries failed
node pipeline/monitor.js --status  # status only
```

---

## 📋 Queue Status Check
```bash
node pipeline/monitor.js --status
```

## 🔍 Verify SEO
```
https://ilovedesi.fun/sitemap.xml
https://ilovedesi.fun/robots.txt
https://ilovedesi.fun/video/<slug>   ← view source → check <title>, <meta description>
```

## 📊 Submit to Google
1. Google Search Console → Add property → ilovedesi.fun
2. Sitemaps → Submit `https://ilovedesi.fun/sitemap.xml`
3. URL Inspection → Test any video page URL
