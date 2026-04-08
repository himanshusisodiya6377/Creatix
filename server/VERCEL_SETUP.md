# ✅ Vercel Serverless Deployment Setup Complete

Your backend is now configured for **Vercel serverless functions**. Here's what was set up:

## 📁 Structure Created

```
server/
├── api/
│   └── index.ts          ✅ NEW - Serverless entry point
├── server.ts             (Keep for local development)
├── vercel.json           ✅ NEW - Vercel routing config
├── .vercelignore         ✅ NEW - Files to skip in builds
├── package.json          ✅ UPDATED - Added serverless-http
└── .gitignore            ✅ UPDATED - Added .vercel, dist/
```

## 🔧 What Changed

### 1. **api/index.ts** (NEW)
- Exports Express app without `app.listen()`
- All routes imported from existing files
- Perfect for serverless functions

### 2. **vercel.json** (NEW)
- Routes all requests to `api/index.ts`
- Configured for Node.js 20.x runtime
- Set memory to 1024 MB, timeout to 60 seconds

### 3. **package.json** (UPDATED)
- Added `serverless-http: ^3.2.0` dependency
- Added `dev` script for local development

### 4. **.gitignore** (UPDATED)
- Added `.vercel/` to ignore build artifacts
- Added `dist/` build output
- Added `.env.production` for prod env files

## 📦 Installation

```bash
cd server
npm install
```

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Create `.env.local` in server directory
Copy `.env.example` and fill in all variables:
```bash
cp .env.example .env.local
```

Required variables:
- DATABASE_URL
- OPENAI_API_KEY
- HUGGINGFACE_API_KEY
- GOOGLE_GENAI_API_KEY
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLIPDROP_API_KEY
- PICSART_API_KEY
- BETTER_AUTH_SECRET (use `openssl rand -base64 32`)
- BETTER_AUTH_URL (will be your Vercel domain)
- TRUSTED_ORIGINS (your frontend domain)
- NODE_ENV=production
- PORT=3000

### Step 3: Deploy to Vercel
```bash
vercel --prod
```

This will:
1. Build your TypeScript
2. Create serverless functions in `/api`
3. Deploy to Vercel
4. Give you a live URL

### Step 4: Run Database Migrations
```bash
npx prisma migrate deploy --skip-generate
```

Or generate Prisma client:
```bash
npx prisma generate
```

## 💻 Local Development

Continue using the existing setup:
```bash
npm run dev
# or
npm run server
```

This runs `server.ts` with `app.listen()` locally.

## 🔄 How It Works

### Local Development
```
Client → http://localhost:3000 → server.ts → app.listen(3000)
```

### Vercel Production
```
Client → https://your-app.vercel.app → api/index.ts → Serverless Function
```

## ✅ Troubleshooting

### Issue: Build fails with "Cannot find module"
**Solution**: Make sure all imports use `../` paths correctly (api/index.ts is one level deep)

### Issue: Routes return 404
**Solution**: Verify vercel.json routing and that api/index.ts exports the Express app

### Issue: Environment variables not working
**Solution**: Add them in Vercel dashboard → Settings → Environment Variables

### Issue: Database connection fails
**Solution**: Check DATABASE_URL and IP whitelist in your database provider

## 📚 Next Steps

1. ✅ Set up `.env.local`
2. ✅ Deploy backend: `vercel --prod`
3. ✅ Get Vercel backend URL
4. ✅ Deploy frontend to Netlify with VITE_BASE_URL pointing to Vercel
5. ✅ Test API calls from frontend
6. ✅ Update TRUSTED_ORIGINS if needed and redeploy backend

## 🎯 Key Files Reference

- **Local Dev**: `server.ts` - has `app.listen()`
- **Vercel Production**: `api/index.ts` - exports app only
- **Configuration**: `vercel.json` - routing rules
- **Environment**: `.env.local` - for secrets (git ignored)
- **Build**: `package.json` scripts - handles compilation

---

**Ready to deploy!** 🚀 Follow the deployment steps above.
