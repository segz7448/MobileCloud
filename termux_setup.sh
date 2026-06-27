#!/data/data/com.termux/files/usr/bin/bash
# ============================================
# MobileCloud - Termux Setup & GitHub Push
# Run this script from Termux on your Android
# ============================================

set -e

echo "======================================"
echo "  MobileCloud Termux Setup Script"
echo "======================================"

# 1. Install required packages
echo "[1/6] Installing required packages..."
pkg update -y && pkg upgrade -y
pkg install -y git nodejs-lts openssh

# 2. Configure Git (edit these)
echo "[2/6] Configuring Git..."
read -p "Enter your GitHub username: " GH_USER
read -p "Enter your GitHub email: " GH_EMAIL
read -p "Enter your GitHub repo name (e.g. MobileCloud): " REPO_NAME

git config --global user.name "$GH_USER"
git config --global user.email "$GH_EMAIL"

# 3. Generate SSH key for GitHub
echo "[3/6] Setting up SSH key for GitHub..."
if [ ! -f ~/.ssh/id_ed25519 ]; then
  ssh-keygen -t ed25519 -C "$GH_EMAIL" -f ~/.ssh/id_ed25519 -N ""
fi

echo ""
echo "========================================"
echo "  Copy this public key to GitHub:"
echo "  GitHub → Settings → SSH Keys → New"
echo "========================================"
cat ~/.ssh/id_ed25519.pub
echo ""
read -p "Press ENTER after adding the SSH key to GitHub..."

# Test SSH connection
ssh -T git@github.com || true

# 4. Initialize repo if needed
echo "[4/6] Setting up Git repository..."
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Add remote
if git remote | grep -q origin; then
  git remote set-url origin git@github.com:$GH_USER/$REPO_NAME.git
else
  git remote add origin git@github.com:$GH_USER/$REPO_NAME.git
fi

# 5. Create .gitignore
echo "[5/6] Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
android/app/debug.keystore
android/app/release.keystore
android/.gradle/
android/app/build/
android/build/
*.log
.DS_Store
.idea/
*.iml
.expo/
dist/
output/
EOF

# 6. Add, commit and push
echo "[6/6] Pushing to GitHub..."
git add .
git commit -m "feat: initial MobileCloud project setup" || echo "Nothing new to commit"
git push -u origin main

echo ""
echo "========================================"
echo "  SUCCESS! Code pushed to GitHub."
echo "  GitHub Actions will now build APK."
echo ""
echo "  Check progress at:"
echo "  https://github.com/$GH_USER/$REPO_NAME/actions"
echo ""
echo "  Don't forget to add these secrets in:"
echo "  GitHub → Settings → Secrets → Actions"
echo "    - SUPABASE_URL"
echo "    - SUPABASE_ANON_KEY"
echo "========================================"
