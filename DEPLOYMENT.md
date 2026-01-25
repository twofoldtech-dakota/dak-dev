# Deployment Guide

Complete guide for deploying the Dakota Smith Personal Blog to Vercel.

## Pre-Deployment Checklist

### Code & Content
- [ ] All blog posts have correct frontmatter
- [ ] Posts intended for production have `published: true`
- [ ] All images exist in `/public/images/posts/`
- [ ] Code passes linting: `npm run lint`
- [ ] Build completes successfully: `npm run build`
- [ ] No console errors in development

### Configuration
- [ ] Environment variables documented in `.env.example`
- [ ] Giscus repository and category IDs obtained
- [ ] Site metadata updated in `app/layout.tsx`
- [ ] Repository URL updated in package.json and README

### Performance
- [ ] Lighthouse Performance score 98+ (target: 98+)
- [ ] Lighthouse Accessibility score 95+ (target: 100)
- [ ] Lighthouse Best Practices score 96+ (target: 100)
- [ ] Lighthouse SEO score 100 (target: 100)
- [ ] Core Web Vitals passing (LCP <2.5s, TBT <200ms, CLS <0.1)

## Vercel Deployment Steps

### 1. Initial Setup

1. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Build Settings** (Usually auto-detected)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2. Environment Variables

Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_SITE_URL=https://your-subdomain.vercel.app
NEXT_PUBLIC_GISCUS_REPO=twofoldtech-dakota/my-site
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDONxWbPw
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDONxWbP84Cmgsy
```

**Important:** Update these values with your actual configuration:
- Replace `your-subdomain` with your chosen Vercel subdomain
- Get Giscus values from [giscus.app](https://giscus.app) after enabling Discussions on your repo

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Visit deployment URL to verify

### 4. Post-Deployment Configuration

1. **Update Site URL**
   - Copy your Vercel deployment URL
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
   - Trigger redeployment

2. **Enable Analytics** (Optional)
   - Analytics tab in Vercel dashboard
   - Enable Web Analytics (already integrated via `@vercel/analytics`)

3. **Custom Domain** (Optional)
   - Domains tab in Vercel dashboard
   - Add custom domain
   - Configure DNS records as instructed

## Automatic Deployments

### Production Deployments
- **Trigger:** Push to `main` branch
- **URL:** Your production domain
- **Environment:** Production environment variables

### Preview Deployments
- **Trigger:** Push to any branch or open Pull Request
- **URL:** Unique preview URL (e.g., `my-site-git-feature-username.vercel.app`)
- **Environment:** Preview environment variables (if configured separately)

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Blog listing shows all published posts
- [ ] Individual blog posts load with correct formatting
- [ ] Code blocks display with syntax highlighting
- [ ] Images load correctly
- [ ] Comments section loads (Giscus)
- [ ] Analytics tracking works
- [ ] OpenGraph images generate: `/api/og?title=Test`
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Favicon displays correctly
- [ ] Mobile responsive design works
- [ ] Dark theme applies correctly

## Performance Validation

Run Lighthouse audit on deployed site:

```bash
npx lighthouse https://your-domain.vercel.app --view
```

Expected scores:
- **Performance:** 98-100
- **Accessibility:** 95-100
- **Best Practices:** 96-100
- **SEO:** 100

## Troubleshooting

### Build Failures

**Issue:** Build fails with "Module not found"
- **Solution:** Ensure all imports are correct and dependencies are in package.json
- **Check:** Run `npm run build` locally first

**Issue:** "Error: Invalid environment variable"
- **Solution:** Verify all required environment variables are set in Vercel dashboard
- **Check:** Compare against `.env.example`

### Runtime Errors

**Issue:** 404 on blog posts
- **Solution:** Check that posts have `published: true` and MDX files are committed to git
- **Check:** Verify files exist in `content/posts/` in deployed code

**Issue:** Images not loading
- **Solution:** Verify images are in `/public/images/` and paths in frontmatter are correct
- **Check:** Image paths should be `/images/posts/slug/image.jpg` (not relative)

**Issue:** Comments not loading
- **Solution:** Verify Giscus environment variables are correct
- **Check:** Ensure GitHub Discussions is enabled on your repository

### Performance Issues

**Issue:** Low Lighthouse performance score
- **Solution:** Check Network tab for large assets, run `npm run analyze` locally
- **Check:** Ensure images are using next/image and proper caching headers

**Issue:** High CLS (Cumulative Layout Shift)
- **Solution:** Ensure all images have explicit dimensions or aspect-ratio
- **Check:** Review image components for `fill` prop with container aspect-ratio

## Monitoring

### Vercel Analytics
- View real-time page views in Vercel dashboard
- No additional configuration needed

### Error Monitoring
- Check Runtime Logs in Vercel dashboard
- Set up error notifications in Vercel settings

### Performance Monitoring
- Use Real Experience Score in Vercel Speed Insights
- Monitor Core Web Vitals trends

## Rollback Procedure

If deployment has issues:

1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

## Updating Content

### Adding New Blog Posts

1. Create MDX file locally in `content/posts/`
2. Add images to `/public/images/posts/slug/`
3. Test locally: `npm run dev`
4. Commit and push:
```bash
git add content/posts/new-post.mdx public/images/posts/new-post/
git commit -m "Add new blog post: Post Title"
git push origin main
```
5. Vercel automatically deploys within 2-3 minutes

### Updating Existing Posts

1. Edit MDX file in `content/posts/`
2. Test locally
3. Commit and push
4. Automatic deployment

## Security

### Headers
Security headers are configured in `next.config.ts`:
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Environment Variables
- Never commit `.env.local` to git
- Use Vercel dashboard for production secrets
- Rotate Giscus credentials if compromised

## Support

For issues:
1. Check this deployment guide
2. Review troubleshooting section in README.md
3. Check Vercel documentation: https://vercel.com/docs
4. Open issue on GitHub repository

---

**Last Updated:** 2026-01-25
**Deployment Platform:** Vercel
**Framework:** Next.js 16+
