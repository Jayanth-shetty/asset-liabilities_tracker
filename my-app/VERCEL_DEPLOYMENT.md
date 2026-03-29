# Vercel Deployment Guide

## Steps to Deploy

### 1. Prepare Your Code

- Ensure all changes are committed to GitHub
- Make sure `npm run build` passes locally

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"

### 3. Configure Environment Variables on Vercel

On the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

**Important:** Replace with YOUR actual values!

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Visit your live URL

## Troubleshooting 404 Errors

### If you get 404 errors:

1. **Check Environment Variables**
   - Vercel → Settings → Environment Variables
   - Ensure `MONGODB_URI` and `JWT_SECRET` are set
   - Redeploy after adding variables

2. **Rebuild the Project**
   - Vercel Dashboard → Deployments → Redeploy

3. **Check Logs**
   - Vercel → Deployments → Select latest → View Logs
   - Look for MongoDB connection errors

### MongoDB Connection Issues

Ensure your MongoDB cluster allows connections from Vercel IPs:

- Go to MongoDB Atlas
- Network Access → IP Whitelist
- Add `0.0.0.0/0` (allows all IPs) or specific Vercel IPs

**⚠️ Security Note:** Using `0.0.0.0/0` is less secure. Better approach:

1. Restrict by IP whitelist in production
2. Use strong database credentials
3. Keep JWT_SECRET secure

## Key Files

- `.env.local` - Local development environment variables
- `.env.example` - Template for environment variables
- `next.config.ts` - Next.js configuration for Vercel
- `lib/db.ts` - Uses `process.env.MONGODB_URI`

## Next.js 16 on Vercel

- ✅ Using Turbopack for faster builds
- ✅ Supports dynamic routes with Promise-based params
- ✅ Automatic static optimization
- ✅ Serverless functions for API routes

## Performance Tips

1. **Use Edge Functions** for faster API responses
2. **Enable Caching** for static content
3. **Monitor Build Time** - should be under 5 minutes
4. **Check Function Duration** - API routes should respond in <1s

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
