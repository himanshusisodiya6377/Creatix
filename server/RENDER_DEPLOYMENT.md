# 🚀 Render Backend Deployment Guide

> Deploy your Express.js backend to Render for free

## 📋 Prerequisites

- GitHub account with code pushed
- Render account (https://render.com) - sign up with GitHub
- PostgreSQL database (optional - Render provides one)
- All API keys ready

## ✨ Why Render for Backend?

- ✅ **Simple**: Just a traditional Node.js app, no serverless complexity
- ✅ **Fast**: Very quick deployment process
- ✅ **Free tier**: Generous free tier with PostgreSQL database
- ✅ **Easy scaling**: Simple to upgrade later
- ✅ **Good uptime**: Auto-restart crashed services
- ✅ **Native PostgreSQL**: Built-in Postgres database support

## 🔧 Step 1: Prepare Your Code

### Update package.json
Your `package.json` scripts should be:

```json
{
  "scripts": {
    "start": "tsx server.ts",
    "server": "nodemon --exec tsx server.ts",
    "build": "tsc"
  }
}
```

✅ Your current setup is perfect!

### Build Configuration
The `render.json` file handles build/start commands automatically.

## 📝 Step 2: Set Up Environment Variables

Create `.env.local` for local testing:
```bash
cp .env.example .env.local
```

Fill in all variables (see `.env.example`)

## 🗄️ Step 3: Set Up PostgreSQL Database

### Option A: Use Render's PostgreSQL (Recommended)
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Fill in:
   - **Name**: creatix-db
   - **Database**: creatix
   - **User**: postgres
4. Click "Create Database"
5. Copy the Internal Database URL (starting with "postgres://")

### Option B: Use External Database
- Vercel Postgres
- Railway
- Supabase
- AWS RDS

Get the connection string and set as `DATABASE_URL` env var.

## 🚀 Step 4: Deploy to Render

### Method 1: Using Render Dashboard (Easiest)

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select "Connect a repository" → Choose your GitHub repo
4. Fill in details:
   - **Name**: creatix-backend
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Branch**: main (or your branch)

5. Click "Advanced" and add Environment Variables:
   - DATABASE_URL (from PostgreSQL setup)
   - OPENAI_API_KEY
   - HUGGINGFACE_API_KEY
   - GOOGLE_GENAI_API_KEY
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - CLIPDROP_API_KEY
   - PICSART_API_KEY
   - BETTER_AUTH_SECRET
   - BETTER_AUTH_URL (will be `https://your-app.onrender.com`)
   - TRUSTED_ORIGINS (your frontend domain)
   - NODE_ENV=production
   - PORT=3000

6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Get your URL: `https://your-app.onrender.com`

### Method 2: Using Render CLI

```bash
npm install -g render
render deploy
```

## 🗂️ Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# Option 1: Using Render shell
# (Go to your service in Render dashboard → Shell)
npx prisma migrate deploy --skip-generate

# Option 2: From your local machine
DATABASE_URL="your_render_db_url" npx prisma migrate deploy --skip-generate
```

## ✅ Verification

After deployment:

1. Visit `https://your-app.onrender.com/` - should see "Server is Live!"
2. Test API endpoint: `https://your-app.onrender.com/api/user/...`
3. Check Render logs for errors

## 📊 Your Backend URL

After deployment, update your frontend with:

```
VITE_BASE_URL=https://your-app.onrender.com
VITE_AUTH_URL=https://your-app.onrender.com/api/auth
```

## ⚙️ Environment Variables Reference

| Variable | Value | Example |
|----------|-------|---------|
| DATABASE_URL | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| OPENAI_API_KEY | OpenAI API key | `sk-...` |
| HUGGINGFACE_API_KEY | HF API key | `hf_...` |
| GOOGLE_GENAI_API_KEY | Google GenAI key | `AIza...` |
| CLOUDINARY_API_KEY | Cloudinary key | `123456...` |
| CLOUDINARY_API_SECRET | Cloudinary secret | `abc123...` |
| CLIPDROP_API_KEY | ClipDrop key | `app_...` |
| PICSART_API_KEY | PicsArt key | `...` |
| BETTER_AUTH_SECRET | Random 32-char | `openssl rand -base64 32` |
| BETTER_AUTH_URL | Backend URL | `https://your-app.onrender.com` |
| TRUSTED_ORIGINS | Frontend domain | `https://frontend.netlify.app` |
| NODE_ENV | Environment | `production` |
| PORT | Server port | `3000` |

## 🔐 Security Tips

- ✅ Never commit `.env` files (they're in `.gitignore`)
- ✅ Use strong BETTER_AUTH_SECRET
- ✅ Keep API keys private
- ✅ Enable environment variable encryption in Render
- ✅ Use HTTPS (automatic on Render)

## 🆘 Troubleshooting

### Build fails
- Check: `npm run build` works locally
- Check: All TypeScript compiles
- View logs: Render dashboard → Logs tab

### Can't connect to database
- Check: DATABASE_URL is correct format
- Check: Database exists and is accessible
- Missing brackets? Try: `postgresql://...` not `postgres://...`

### Environment variables not working
- Add them in Render dashboard
- Restart service after adding vars
- Check names match exactly (case-sensitive)

### API returns 500 error
- Check Render logs for error details
- Verify all dependencies are installed
- Check database connection

### Port issues
- Render assigns PORT automatically
- Don't hardcode port 3000 in production
- Your code uses `process.env.PORT || 3000` ✅ (correct)

## 📚 Useful Links

- Render Docs: https://render.com/docs
- Render PostgreSQL: https://render.com/docs/databases
- Prisma on Render: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render

## 🎯 Next Steps

1. ✅ Prepare database (Render PostgreSQL or external)
2. ✅ Deploy backend to Render
3. ✅ Run database migrations
4. ✅ Get Render backend URL
5. ✅ Deploy frontend to Netlify with correct VITE_BASE_URL
6. ✅ Update TRUSTED_ORIGINS if needed
7. ✅ Test API calls

## 📞 Support

If you encounter issues:
1. Check Render dashboard → Logs
2. Check your `server.ts` for errors
3. Verify environment variables are set
4. Test locally first: `npm run server`

---

**Happy Deploying! 🚀**

Your Express app is ready for Render. It's much simpler than serverless - just a regular Node.js server!
