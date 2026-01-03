#!/bin/bash

echo "🚀 Restaurant Manager Pro API - Quick Deploy Script"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the restaurant-manager-api directory"
    exit 1
fi

echo "📋 Step 1: Checking Git status..."
git status

echo ""
echo "📝 Step 2: Creating GitHub repository..."
echo ""
echo "Choose your method:"
echo "  A) I have GitHub CLI installed (gh)"
echo "  B) I'll create the repository manually on GitHub"
echo ""
read -p "Enter A or B: " choice

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo ""
    echo "Creating repository with GitHub CLI..."
    gh repo create restaurant-manager-api --public --source=. --remote=origin --push
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository created and code pushed!"
    else
        echo "❌ Failed to create repository. Please do it manually."
        exit 1
    fi
else
    echo ""
    echo "📌 Manual Setup Instructions:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: restaurant-manager-api"
    echo "3. Description: API backend for Restaurant Manager Pro"
    echo "4. Visibility: Public"
    echo "5. DO NOT initialize with README"
    echo "6. Click: Create repository"
    echo ""
    read -p "Press Enter when you've created the repository..."
    
    echo ""
    read -p "Enter your GitHub username: " username
    
    echo ""
    echo "Adding remote and pushing..."
    git remote add origin "https://github.com/$username/restaurant-manager-api.git"
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Code pushed to GitHub!"
    else
        echo "❌ Failed to push. Check your credentials."
        exit 1
    fi
fi

echo ""
echo "=================================================="
echo "✅ GitHub Setup Complete!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Deploy to Vercel:"
echo "   → Go to: https://vercel.com/new"
echo "   → Import: restaurant-manager-api"
echo "   → Framework: Next.js"
echo "   → Click: Deploy"
echo ""
echo "2. Configure Domain:"
echo "   → In Vercel: Settings → Domains"
echo "   → Add: api.restaurantmanagerpro.fr"
echo "   → Add DNS CNAME: api → cname.vercel-dns.com"
echo ""
echo "3. Add Environment Variables:"
echo "   → Get Firebase credentials from backoffice:"
echo "   → Run: cat '../restaurant-manager-backoffice/.env.local'"
echo "   → Copy to Vercel: Settings → Environment Variables"
echo ""
echo "4. Redeploy after adding env vars"
echo ""
echo "📖 Full instructions: See SETUP_INSTRUCTIONS.md"
echo ""
