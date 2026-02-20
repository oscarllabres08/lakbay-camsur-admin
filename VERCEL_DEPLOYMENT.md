# Deploying Admin Website to Vercel

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. A Vercel account (sign up at https://vercel.com)
3. Your Supabase project credentials

## Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   cd admin-website
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `admin-website` (if your repo contains both mobile app and admin website)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to admin-website directory:
   ```bash
   cd admin-website
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

## Step 3: Configure Environment Variables

**IMPORTANT:** You must add your Supabase credentials as environment variables in Vercel.

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Where to find these:**
   - Go to your Supabase project dashboard
   - Click **Settings** (gear icon) → **API**
   - Copy **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

## Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the login (default credentials: `admin` / `admin123`)
3. Try adding a destination to verify Supabase connection

## Troubleshooting

### Build Errors

- **Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
  - Make sure environment variables are set in Vercel
  - Redeploy after adding variables

- **Error: "Module not found"**
  - Make sure `package.json` has all dependencies
  - Run `npm install` locally to verify

### Runtime Errors

- **Images not loading**
  - Check if Supabase Storage bucket is public
  - Verify image URLs in database

- **Cannot connect to Supabase**
  - Verify environment variables are correct
  - Check Supabase project is active
  - Ensure RLS policies allow public read access

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Continuous Deployment

Vercel automatically deploys when you push to:
- **main/master branch** → Production
- **Other branches** → Preview deployments

## Notes

- The admin website is a Next.js app, so it uses Server-Side Rendering (SSR)
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` files to git (already in `.gitignore`)
