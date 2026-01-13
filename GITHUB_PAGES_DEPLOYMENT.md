# GitHub Pages Deployment Guide

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. `gh-pages` package installed (already done)

## Setup Steps

### 1. Update Homepage URL

The `package.json` already has the homepage URL configured. Update it to match your GitHub username and repository:

```json
"homepage": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"
```

Current configuration:
```json
"homepage": "https://jince.george.github.io/christ-soldiers-talent-test"
```

### 2. Create GitHub Repository (if not already done)

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with GitHub Pages deployment"

# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to main branch
git push -u origin main
```

### 3. Deploy to GitHub Pages

Run the deployment command:

```bash
npm run deploy
```

This command will:
1. Build the production version of your app (`npm run build`)
2. Deploy the build folder to the `gh-pages` branch
3. Push to GitHub

### 4. Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

### 5. Access Your Deployed App

After a few minutes, your app will be available at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME
```

Based on current config:
```
https://jince.george.github.io/christ-soldiers-talent-test
```

## Available Scripts

### `npm run deploy`
Builds and deploys the app to GitHub Pages. This is the main command you'll use for deployment.

### `npm run predeploy`
Builds the production version. This runs automatically before deploy.

### `npm run build`
Creates a production build manually (used by predeploy).

## Updating Your Deployment

Whenever you make changes and want to update the live site:

```bash
# 1. Commit your changes
git add .
git commit -m "Your commit message"
git push origin main

# 2. Deploy to GitHub Pages
npm run deploy
```

## Important Notes

### Firebase Configuration
**IMPORTANT:** Do not commit your actual Firebase credentials to GitHub!

Before deploying:
1. Update `src/config/firebase.js` to use environment variables
2. Or use a separate Firebase project for production

### localStorage Data
- The app currently uses localStorage
- Data is stored locally in each user's browser
- For production, complete the Firebase migration for cloud storage

### Routing with React Router
GitHub Pages doesn't support client-side routing by default. If you encounter 404 errors on page refresh:

1. Add a custom 404.html that redirects to index.html
2. Or use HashRouter instead of BrowserRouter

To use HashRouter, update `src/App.js`:
```javascript
import { HashRouter as Router } from 'react-router-dom';
```

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain:
   ```
   yourdomain.com
   ```

2. Configure your domain's DNS settings:
   - Add a CNAME record pointing to: `YOUR-USERNAME.github.io`

3. In GitHub Settings → Pages, enter your custom domain

## Troubleshooting

### Blank Page After Deployment
- Check browser console for errors
- Verify the `homepage` URL in package.json matches your GitHub Pages URL
- Make sure you're using `HashRouter` or have 404 handling configured

### Routes Not Working
- Use `HashRouter` instead of `BrowserRouter`
- Or add 404.html redirect (see above)

### Build Errors
- Run `npm run build` locally first to catch errors
- Fix any warnings or errors before deploying

### Data Not Persisting
- Remember: localStorage data is browser-specific
- Complete Firebase migration for cloud storage

## CI/CD (Optional)

For automatic deployment on every push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Security Checklist

Before deploying:
- [ ] Remove or secure Firebase credentials
- [ ] Update security rules in Firebase Console
- [ ] Remove any debug console.log statements
- [ ] Test authentication flows
- [ ] Verify all features work in production build
- [ ] Check browser compatibility

## Support

For GitHub Pages issues:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

For deployment issues:
- [gh-pages npm package](https://www.npmjs.com/package/gh-pages)
- [Create React App Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Current Status:** Ready to deploy! Run `npm run deploy` to publish your app.
