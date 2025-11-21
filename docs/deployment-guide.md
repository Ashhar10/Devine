# Devine Water - Deployment Guide

This guide walks you through deploying the Devine Water application to production using free and low-cost hosting services.

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub account
- Code committed to a GitHub repository
- Strong `JWT_SECRET` generated (min 32 characters)
- Production MySQL database credentials

## 🎯 Deployment Architecture

```
┌─────────────────────┐
│  GitHub Pages       │
│  (Frontend)         │
│  Static HTML/JS/CSS │
└──────────┬──────────┘
           │
           │ HTTPS API calls
           │
           ▼
┌─────────────────────┐
│  Render.com/Railway │
│  (Backend)          │
│  Node.js + Express  │
└──────────┬──────────┘
           │
           │ MySQL connection
           │
           ▼
┌─────────────────────┐
│  MySQL Database     │
│  (Render/PlanetScale)│
└─────────────────────┘
```

## 🗄️ Step 1: Deploy MySQL Database

### Option A: Render.com MySQL (Recommended - $7/month)

1. Go to https://render.com/
2. Sign up / Login
3. Click "New" → "MySQL"
4. Configure:
   - Name: `devine-water-db`
   - Database: `devine_water`
   - User: Auto-generated
   - Region: Choose closest to your users
   - Plan: Starter ($7/month)
5. Click "Create Database"
6. Wait for provisioning (5-10 minutes)
7. Save the **Internal Database URL** (starts with `mysql://`)

### Option B: PlanetScale (Free Tier - Recommended for Free)

1. Go to https://planetscale.com/
2. Sign up / Login
3. Click "Create database"
4. Configure:
   - Name: `devine-water`
   - Region: Choose closest
   - Plan: Hobby (Free)
5. Create database
6. Go to "Connect" → "Create password"
7. Select "General" and copy the connection string
8. **Note**: PlanetScale doesn't support foreign keys. You'll need to remove FK constraints from schema.

### Option C: Railway.app (Limited Free Tier)

1. Go to https://railway.app/
2. Sign up with GitHub
3. Create "New Project" → "Provision MySQL"
4. Click on MySQL → "Variables" tab
5. Copy `DATABASE_URL`

### Import Database Schema

Once database is created:

```bash
# For services with mysql CLI access (Render, Railway):
mysql -h [host] -u [user] -p [database] < server/sql/schema.sql

# For PlanetScale (using pscale CLI):
pscale shell devine-water main < server/sql/schema.sql

# Or use a GUI tool like TablePlus, MySQL Workbench, or DBeaver
```

## 🚀 Step 2: Deploy Backend (Node.js)

### Render.com Deployment

1. Go to https://render.com/
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `devine-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free

5. **Environment Variables** (click "Advanced")
   Add these:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=[your-32-char-secret]
   DATABASE_URL=[from database step]
   DB_SSL=true
   ALLOW_ORIGINS=https://[your-github-username].github.io
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-15 minutes)
8. Copy your service URL (e.g., `https://devine-backend.onrender.com`)

### Railway.app Deployment

1. Go to https://railway.app/
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=[your-secret]
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   DB_SSL=true
   ALLOW_ORIGINS=https://[your-username].github.io
   ```
6. Update start command to: `cd server && npm start`
7. Deploy

### Verify Backend Deployment

Test your backend:
```bash
curl https://your-backend-url.com/api/health
# Should return: {"ok":true,"env":"production"}
```

## 🌐 Step 3: Deploy Frontend (GitHub Pages)

### Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to "Settings" → "Pages"
3. Under "Source":
   - Branch: `main`
   - Folder: `/` (root)
4. Click "Save"
5. GitHub will provide your Pages URL: `https://[username].github.io/[repo-name]`

### Update Frontend Configuration

1. Edit `config.js`:
   ```javascript
   window.__CONFIG__ = {
     API_BASE: 'https://your-backend-url.onrender.com/api'
   };
   ```

2. Commit and push:
   ```bash
   git add config.js
   git commit -m "Update API endpoint for production"
   git push origin main
   ```

3. Wait 1-2 minutes for GitHub Pages to rebuild

### Test Frontend

1. Visit your GitHub Pages URL
2. Navigate to `/pages/login.html`
3. Try logging in with admin credentials:
   - Username: `admin`
   - Password: `Admin123`

## 🔒 Step 4: Security Hardening

### 1. Change Admin Password

Immediately after first deployment:
1. Log in as admin
2. Use the "Change Password" feature
3. Set a strong password (min 8 chars, letters + numbers)

### 2. Configure CORS Properly

In your backend `.env`:
```bash
# Only allow your actual frontend domain
ALLOW_ORIGINS=https://yourusername.github.io

# For multiple domains:
ALLOW_ORIGINS=https://yourusername.github.io,https://yourdomain.com
```

### 3. Verify HTTPS

Both frontend and backend should use HTTPS:
- ✅ GitHub Pages: Automatic HTTPS
- ✅ Render/Railway: Automatic HTTPS

### 4. Test Rate Limiting

Try logging in with wrong password 6 times - you should get rate limited.

## 📊 Step 5: Database Backup Strategy

### Automated Backups

**Render.com**: Automatic daily backups (retained 7 days on Starter plan)

**PlanetScale**: Automatic backups on paid plans

**Railway**: Manual backups via dashboard

### Manual Backup Script

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h [host] -u [user] -p [database] > backup_$DATE.sql
```

## 🧪 Step 6: Testing & Verification

### Functional Testing Checklist

- [ ] Admin can login
- [ ] Customer can login (if you have test customers)
- [ ] Admin can view dashboard
- [ ] Admin can add new customer
- [ ] Admin can record delivery
- [ ] Admin can record payment
- [ ] Orders can be created
- [ ] Orders can be marked as delivered
- [ ] Stats page loads correctly
- [ ] All CRUD operations work

### Security Testing

```bash
# Test rate limiting
for i in {1..6}; do
  curl -X POST https://your-backend/api/auth/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
done
# 6th request should return rate limit error

# Test CORS
curl -H "Origin: https://malicious-site.com" \
  https://your-backend/api/health
# Should not return Access-Control-Allow-Origin header

# Test SQL injection protection
curl -X POST https://your-backend/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin' OR '1'='1","password":"test"}'
# Should return validation error
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 100 concurrent requests
ab -n 1000 -c 100 https://your-backend/api/health
```

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors in Browser Console

**Symptom**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: 
- Verify `ALLOW_ORIGINS` includes your frontend URL
- Ensure no trailing slashes in URLs
- Check backend logs for the actual origin being sent

#### 2. Database Connection Fails

**Symptom**: Backend crashes with `ECONNREFUSED` or `ER_ACCESS_DENIED_ERROR`

**Solution**:
- Verify `DATABASE_URL` is correct
- Check if `DB_SSL=true` is set for cloud databases
- Ensure database allows connections from backend IP

#### 3. JWT Token Issues

**Symptom**: "Invalid token" errors

**Solution**:
- Verify `JWT_SECRET` is the same across all backend instances
- Check if secret is at least 32 characters
- Clear browser localStorage and login again

#### 4. GitHub Pages 404 Error

**Symptom**: Pages not loading

**Solution**:
- Ensure paths are correct (case-sensitive on Linux servers)
- Check GitHub Pages is enabled in settings
- Wait 2-3 minutes after pushing changes

#### 5. Backend Cold Starts (Free Tier)

**Symptom**: First request takes 30+ seconds

**Solution**:
- Render/Railway free tiers sleep after inactivity
- Consider upgrading to paid tier OR
- Set up a cron job to ping health endpoint every 10 minutes

## 📈 Monitoring & Maintenance

### Monitoring

**Render.com**: Built-in metrics dashboard
**Railway.app**: Logs and metrics in dashboard

**External Monitoring** (Free):
- [UptimeRobot](https://uptimerobot.com/) - Ping your `/healthz` endpoint every 5 minutes
- [BetterStack](https://betterstack.com/) - Uptime monitoring

### Log Management

View logs:
```bash
# Render.com: Dashboard → Logs tab
# Railway.app: Click on service → Logs tab
```

### Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main

# Backend: Auto-deploys via Render/Railway
# Frontend: Auto-deploys via GitHub Pages (1-2 min delay)
```

## 💰 Cost Breakdown

### Free Tier (Hobby Projects)
- Frontend (GitHub Pages): **$0/month**
- Backend (Railway free tier): **~$5 credit/month** (limited hours)
- Database (PlanetScale): **$0/month** (with limitations)
- **Total: $0-5/month**

### Recommended Production
- Frontend (GitHub Pages): **$0/month**
- Backend (Render Starter): **$7/month**
- Database (Render MySQL): **$7/month**
- **Total: $14/month**

### Alternatives
- Backend (Railway): **$5-10/month** usage-based
- Database (PlanetScale Scaler): **$29/month**
- Full stack on VPS (DigitalOcean): **$6/month**

## 🎓 Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure email notifications (future feature)
3. ✅ Set up automated testing CI/CD
4. ✅ Implement database migrations
5. ✅ Add monitoring and alerts

## 📞 Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**🎉 Congratulations!** Your Devine Water application is now deployed and accessible worldwide!
