# Deployment Guide – Codex Portfolio

## Quick Start

### 1. Local Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2. GitHub Pages Deployment

#### Option A: Automatic (Recommended)
The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys on every push to `main`.

Simply push your changes:
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

The workflow will:
1. Install dependencies
2. Build the project
3. Deploy to GitHub Pages

Site will be live at: `https://akshayaa-403.github.io/portfolio`

#### Option B: Manual
If you prefer manual deployment:

```bash
# 1. Build the project
npm run build

# 2. Deploy using GitHub CLI
gh repo deploy --dir dist --branch gh-pages

# OR: Use git commands directly
git add dist/
git commit -m "Deploy: production build"
git subtree push --prefix dist origin gh-pages
```

#### Option C: Using npm deploy script
```bash
# Install gh-pages package first (one-time setup)
npm install --save-dev gh-pages

# Then deploy
npm run deploy
```

### 3. Enable GitHub Pages

1. Go to your repository settings: `Settings → Pages`
2. Select "Deploy from a branch"
3. Choose branch: `gh-pages`
4. Choose folder: `root`
5. Click "Save"

Your site will be deployed and the URL will appear on the Pages settings page.

---

## Configuration

### For Custom Domain

If deploying to a custom domain (e.g., `akshayaa.dev`):

**Step 1:** Update `vite.config.js`
```js
export default {
  base: '/',  // Change from '/portfolio/' to '/'
  // ... rest of config
}
```

**Step 2:** Add CNAME file
```bash
echo "yourdomain.com" > public/CNAME
```

**Step 3:** In GitHub repository settings:
- Go to `Settings → Pages`
- Add your custom domain
- DNS settings required (see GitHub docs)

### For Subdomain

To deploy to `github.com/akshayaa-403/codex` (different repo name):

Update `vite.config.js`:
```js
export default {
  base: '/codex/',  // Change to your repo name
  // ... rest of config
}
```

---

## Troubleshooting

### Build fails with module errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Site doesn't appear after deployment
- Check GitHub Pages settings are enabled
- Verify the workflow ran successfully (GitHub → Actions tab)
- Clear browser cache: `Ctrl+Shift+Delete`
- Wait up to 5 minutes for GitHub Pages to update

### 404 errors after deployment
- Ensure `vite.config.js` has correct `base` path
- Run `npm run build` again
- Verify the `dist/` folder contains `index.html`

### API rate limiting
The portfolio caches API responses for 30 minutes. If you hit rate limits:
- Use a GitHub personal access token
- In `src/github.js`, add:
  ```js
  const token = 'your-github-token';
  const response = await fetch(url, {
    headers: { 'Authorization': `token ${token}` }
  });
  ```

---

## Monitoring

### Check Deployment Status
- GitHub: Repository → Actions tab
- GitHub Pages: Settings → Pages (shows deployment status)

### Performance
The production build is **23 KB gzipped**:
- HTML: 0.62 KB
- CSS: 2.87 KB  
- JS: 4.04 KB

Expected Lighthouse scores:
- Performance: ✅ 95+
- Accessibility: ✅ 100
- Best Practices: ✅ 90+

---

## Next Steps

After deployment:

1. **Share on Social**
   - Twitter/X: Tweet your portfolio link
   - LinkedIn: Add to profile
   - Dev.to: Write a "portfolio redesign" post

2. **Track Analytics** (Optional)
   - Add Google Analytics
   - Use Vercel Analytics
   - Monitor GitHub repository traffic

3. **Iterate** 
   - Gather feedback from peers
   - Update project descriptions
   - Add new projects as you build

4. **Customize Further**
   - Update hero taglines
   - Modify footer social links
   - Adjust colors in `src/style.css`

---

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev)
- [GitHub REST API](https://docs.github.com/en/rest)
