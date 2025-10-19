# Deployment Guide for Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git repository connected to your project
- Supabase project credentials

## Environment Variables
Before deploying, you need to set up the following environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will automatically detect the Vite framework
4. Add your environment variables
5. Click "Deploy"

## Build Configuration
The project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

## Post-Deployment
After deployment:
1. Verify all environment variables are set correctly
2. Test all routes and functionality
3. Check that Supabase integration is working
4. Monitor the deployment logs for any errors

## Troubleshooting

### Build Fails
- Ensure all environment variables are set
- Check that `npm install --legacy-peer-deps` is used as the install command
- Review build logs in Vercel dashboard

### Routes Not Working
- The `vercel.json` file includes rewrites for SPA routing
- All routes should redirect to `index.html`

### Environment Variables Not Loading
- Ensure variables start with `VITE_` prefix
- Redeploy after adding/updating environment variables
