# Git Repository Setup Guide

Your code has been committed to a local git repository. Follow these steps to push it to a private GitHub/GitLab repository.

## Step 1: Create a Private Repository

### Option A: GitHub
1. Go to https://github.com/new
2. Repository name: `gxgold` (or your preferred name)
3. Description: "XAUT Staking System with 240% APY"
4. Select **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: GitLab
1. Go to https://gitlab.com/projects/new
2. Project name: `gxgold`
3. Visibility level: **Private**
4. **DO NOT** initialize with README
5. Click "Create project"

## Step 2: Push Your Code

After creating the repository, you'll see instructions. Use these commands:

### For GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/gxgold.git
git branch -M main
git push -u origin main
```

### For GitLab:
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/gxgold.git
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub/GitLab username.

## Step 3: Authentication

You may be prompted for credentials:
- **GitHub**: Use a Personal Access Token (not password)
  - Create token: https://github.com/settings/tokens
  - Select `repo` scope
- **GitLab**: Use your username and Personal Access Token
  - Create token: https://gitlab.com/-/user_settings/personal_access_tokens
  - Select `write_repository` scope

## Alternative: Using SSH

If you have SSH keys set up:

### GitHub:
```bash
git remote add origin git@github.com:YOUR_USERNAME/gxgold.git
git push -u origin main
```

### GitLab:
```bash
git remote add origin git@gitlab.com:YOUR_USERNAME/gxgold.git
git push -u origin main
```

## Verify

After pushing, visit your repository URL:
- GitHub: `https://github.com/YOUR_USERNAME/gxgold`
- GitLab: `https://gitlab.com/YOUR_USERNAME/gxgold`

You should see all your files there!

## Current Repository Status

Your local repository is ready with:
- ✅ All smart contracts
- ✅ Frontend application
- ✅ Tests and scripts
- ✅ Documentation
- ✅ Proper .gitignore

## Next Steps

1. Share the repository link with your team
2. Set up branch protection (optional)
3. Add collaborators (Settings → Collaborators)
4. Continue development and push changes regularly

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push

# Pull latest changes
git pull

# View remote URL
git remote -v
```

## Troubleshooting

**Error: "remote origin already exists"**
```bash
git remote remove origin
# Then add it again with the correct URL
```

**Error: "Authentication failed"**
- Make sure you're using a Personal Access Token, not your password
- Check that the token has the correct permissions

**Error: "Permission denied"**
- Verify you have write access to the repository
- Check that the repository URL is correct

---

Your repository is ready! Just follow the steps above to push it to GitHub or GitLab.

